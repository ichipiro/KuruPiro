import { IRealtimeRepository } from '@/domain/repositories';
import { TripUpdate, StopTimeUpdate } from '@/domain/entities/TripUpdate';
import { TripId, StopId, Delay } from '@/domain/value-objects/identifiers';
import type { Env } from '@/types';
import type { CachedRealtimeData, TripUpdateRaw } from './types';

/**
 * DO呼び出しの上限時間（ミリ秒）
 *
 * 実測でDOの正常応答はP99でも約300msのため、2.5秒は十分な余裕。
 * 本番ではDOへの配送が数秒滞留する事象（isolate再起動等が原因と推定）が
 * 約10%の頻度で観測されており、上限を長くしても成功率は上がらない。
 */
const DO_FETCH_TIMEOUT_MS = 2_500;

/**
 * この時間以内に同期したデータは無条件で使う（DOのフィード更新間隔と同じ）
 */
const FRESH_MS = 30_000;

/**
 * これより古いキャッシュは提供しない（誤解を招く遅延情報を出さない上限）
 */
const MAX_STALE_MS = 5 * 60_000;

interface RealtimeCacheState {
  /** DOがフィードを取得した時刻（DO側の版） */
  fetchedAt: number;
  /** このisolateがDOと同期した時刻 */
  syncedAt: number;
  tripUpdates: TripUpdate[];
  byTripId: Map<string, TripUpdate>;
}

/**
 * 変換済みリアルタイムデータのisolate単位キャッシュ
 *
 * ## stale-while-revalidate 方式にしている理由
 * DOへのリクエストは通常は数十msで返るが、本番では配送が数秒滞留する
 * 事象が無視できない頻度で起きる（DOのisolateは無トラフィック時に
 * 30秒ごとの再生成が観測されるほど積極的に退避される）。
 * リアルタイム情報は補助データなので、DOの応答を「待つ」構造をやめ、
 * 手元のキャッシュを即座に返し、古ければ waitUntil で裏更新する。
 * これによりDOがどれだけ黙ってもユーザー応答はブロックされない。
 *
 * Worker isolateはユーザートラフィック（サイネージの15秒ポーリング等）で
 * 温まり続けるため、キャッシュの生存はDOより格段に安定している。
 */
let isolateCache: RealtimeCacheState | null = null;
/** 裏更新の単一飛行（同時リクエストが同じ更新を共有する） */
let refreshInFlight: Promise<void> | null = null;

/**
 * テスト用: isolateキャッシュを破棄する
 * @internal
 */
export function resetRealtimeIsolateCache(): void {
  isolateCache = null;
  refreshInFlight = null;
}

/**
 * Durable Objectを使用したリアルタイムリポジトリの実装
 */
export class DurableObjectRealtimeRepository implements IRealtimeRepository {
  private stub: DurableObjectStub;

  constructor(
    env: Env,
    private readonly executionCtx?: ExecutionContext,
    private readonly timeoutMs: number = DO_FETCH_TIMEOUT_MS
  ) {
    // Use a fixed ID for the singleton Durable Object
    const id = env.REALTIME_CACHE.idFromName('realtime-cache');
    this.stub = env.REALTIME_CACHE.get(id);
  }

  async getAllTripUpdates(): Promise<TripUpdate[]> {
    return (await this.ensureData())?.tripUpdates ?? [];
  }

  async getTripUpdate(tripId: TripId): Promise<TripUpdate | undefined> {
    return (await this.ensureData())?.byTripId.get(tripId.value);
  }

  async getLastUpdatedAt(): Promise<number> {
    const cache = await this.ensureData();
    return cache?.fetchedAt ?? Date.now();
  }

  async getTripUpdatesForTrips(tripIds: TripId[]): Promise<Map<string, TripUpdate>> {
    const result = new Map<string, TripUpdate>();
    const cache = await this.ensureData();
    if (!cache) {
      return result;
    }
    for (const tripId of tripIds) {
      const update = cache.byTripId.get(tripId.value);
      if (update) {
        result.set(tripId.value, update);
      }
    }
    return result;
  }

  /**
   * リアルタイムデータを強制更新
   */
  async forceUpdate(): Promise<void> {
    await this.fetchWithTimeout('https://fake-host/update');
    // 次の読み取りで新しいデータを取り直させる
    resetRealtimeIsolateCache();
  }

  /**
   * キャッシュを返し、必要なら更新する
   *
   * - 30秒以内に同期済み: そのまま返す（DOに触れない）
   * - 30秒〜5分: 即座に返しつつ waitUntil で裏更新（ここが本命の非ブロック経路）
   * - それより古い/キャッシュなし: 同期取得（タイムアウト付き。失敗は呼び出し側で
   *   時刻表のみへのデグレードとして処理される）
   */
  private async ensureData(): Promise<RealtimeCacheState | null> {
    const cache = isolateCache;
    const age = cache ? Date.now() - cache.syncedAt : Infinity;

    if (cache && age < FRESH_MS) {
      return cache;
    }
    if (cache && age < MAX_STALE_MS) {
      this.scheduleBackgroundRefresh();
      return cache;
    }

    await this.refresh();
    return isolateCache;
  }

  /**
   * 応答をブロックせずに裏で更新する。失敗しても既存キャッシュで動き続ける
   */
  private scheduleBackgroundRefresh(): void {
    const refresh = this.refresh().catch(() => {});
    if (this.executionCtx) {
      this.executionCtx.waitUntil(refresh);
    }
  }

  /**
   * DOと同期する（単一飛行: 同時に呼ばれても実際の通信は1本）
   */
  private refresh(): Promise<void> {
    if (!refreshInFlight) {
      refreshInFlight = this.syncWithDurableObject().finally(() => {
        refreshInFlight = null;
      });
    }
    return refreshInFlight;
  }

  private async syncWithDurableObject(): Promise<void> {
    const known = isolateCache;
    const url = known
      ? `https://fake-host/data?since=${known.fetchedAt}`
      : 'https://fake-host/data';
    const response = await this.fetchWithTimeout(url);

    if (response.status === 304 && known) {
      // フィードは変わっていない: 同期時刻だけ進める
      known.syncedAt = Date.now();
      return;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch from Durable Object: ${response.status}`);
    }

    const data = await response.json<CachedRealtimeData>();
    if (!data) {
      // DOにまだデータがない: 空として扱う（FRESH_MSの間だけ）
      isolateCache = {
        fetchedAt: Date.now(),
        syncedAt: Date.now(),
        tripUpdates: [],
        byTripId: new Map(),
      };
      return;
    }

    const tripUpdates = data.tripUpdates.map((raw) => this.mapToTripUpdate(raw));
    isolateCache = {
      fetchedAt: data.fetchedAt,
      syncedAt: Date.now(),
      tripUpdates,
      byTripId: new Map(tripUpdates.map((update) => [update.tripId.value, update])),
    };
  }

  /**
   * タイムアウト付きでDOを呼び出す
   */
  private async fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const startedAt = Date.now();
    try {
      const response = await this.stub.fetch(url, { ...init, signal: controller.signal });
      // 調査用計測: タイムアウト未満でも遅い呼び出しの分布を残す
      const elapsed = Date.now() - startedAt;
      if (elapsed > 1000) {
        console.warn(`[RealtimeRepo] slow DO call: ${elapsed}ms ${url}`);
      }
      return response;
    } catch (error) {
      console.warn(
        `[RealtimeRepo] DO call failed after ${Date.now() - startedAt}ms: ${url}`,
        error instanceof Error ? error.name : String(error)
      );
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Raw TripUpdateEntityをドメインエンティティに変換
   */
  private mapToTripUpdate(raw: TripUpdateRaw): TripUpdate {
    const tripId = TripId.fromString(raw.tripId);

    const stopTimeUpdates = raw.stopTimeUpdates.map((update) => {
      return StopTimeUpdate.create({
        stopSequence: update.stopSequence,
        stopId: update.stopId ? StopId.fromString(update.stopId) : undefined,
        arrivalDelay:
          update.arrivalDelay !== undefined
            ? Delay.fromSeconds(update.arrivalDelay)
            : undefined,
        departureDelay:
          update.departureDelay !== undefined
            ? Delay.fromSeconds(update.departureDelay)
            : undefined,
        arrivalTime: update.arrivalTime,
        departureTime: update.departureTime,
      });
    });

    return TripUpdate.create(tripId, stopTimeUpdates);
  }
}
