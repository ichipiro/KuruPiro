import { IRealtimeRepository } from '@/domain/repositories';
import { TripUpdate, StopTimeUpdate } from '@/domain/entities/TripUpdate';
import { TripId, StopId, Delay } from '@/domain/value-objects/identifiers';
import type { Env } from '@/types';
import type { CachedRealtimeData, TripUpdateRaw } from './types';

/**
 * 変換済みリアルタイムデータのisolate単位キャッシュ
 *
 * リアルタイムフィードは350KB超のJSONで、リクエスト毎にパースして
 * 4,000個超のエンティティへ変換すると無料プランのCPU制限(10ms)を圧迫する。
 * DOの fetchedAt を版として使い、フィードが変わっていない間(通常30秒)は
 * 変換済みエンティティをisolate内のリクエスト間で再利用する。
 * エンティティは読み取り専用なので共有しても安全。
 */
let isolateCache: { fetchedAt: number; tripUpdates: TripUpdate[] } | null = null;

/**
 * テスト用: isolateキャッシュを破棄する
 * @internal
 */
export function resetRealtimeIsolateCache(): void {
  isolateCache = null;
}

/**
 * DO呼び出しの上限時間（ミリ秒）
 *
 * リアルタイム情報は補助データなので、応答しないDOを待ち続けるより
 * 諦めて時刻表だけ返す方がよい。過去に応答が返らないまま数分固まる
 * リクエストが観測されており（wallTime 298秒等）、その間クライアントの
 * ポーリングが塞がってサイネージ停止の引き金になった。
 */
const DO_FETCH_TIMEOUT_MS = 5_000;

/**
 * Durable Objectを使用したリアルタイムリポジトリの実装
 */
export class DurableObjectRealtimeRepository implements IRealtimeRepository {
  private stub: DurableObjectStub;
  private loadPromise: Promise<{ fetchedAt: number; tripUpdates: TripUpdate[] }> | null = null;
  /**
   * トリップ単位の取得結果のリクエストスコープキャッシュ
   * （undefined = フィードに存在しないことが確認済み）
   */
  private selectiveCache = new Map<string, TripUpdate | undefined>();

  constructor(
    env: Env,
    private readonly timeoutMs: number = DO_FETCH_TIMEOUT_MS
  ) {
    // Use a fixed ID for the singleton Durable Object
    const id = env.REALTIME_CACHE.idFromName('realtime-cache');
    this.stub = env.REALTIME_CACHE.get(id);
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
   * 全てのトリップ更新情報を取得
   */
  async getAllTripUpdates(): Promise<TripUpdate[]> {
    return (await this.load()).tripUpdates;
  }

  /**
   * 指定したトリップIDの更新情報を取得
   */
  async getTripUpdate(tripId: TripId): Promise<TripUpdate | undefined> {
    const { tripUpdates } = await this.load();
    return tripUpdates.find((update) => update.tripId.value === tripId.value);
  }

  /**
   * リアルタイムデータの最終更新時刻を取得（Unix timestamp）
   */
  async getLastUpdatedAt(): Promise<number> {
    return (await this.load()).fetchedAt;
  }

  /**
   * 指定したトリップ群の更新情報を取得（ホットパス用）
   *
   * フィード全件(350KB超)ではなく、必要なトリップだけをDOに問い合わせて
   * 小さな応答のみパースする。コールドスタートしたisolateでも
   * CPU制限(無料10ms)内に収まるようにするための経路。
   * 結果はリクエストスコープで累積キャッシュされ、同じトリップの
   * 再問い合わせはDO往復なしで返る。
   */
  async getTripUpdatesForTrips(tripIds: TripId[]): Promise<Map<string, TripUpdate>> {
    const result = new Map<string, TripUpdate>();
    const missing: string[] = [];

    for (const id of new Set(tripIds.map((t) => t.value))) {
      if (this.selectiveCache.has(id)) {
        const cached = this.selectiveCache.get(id);
        if (cached) {
          result.set(id, cached);
        }
      } else {
        missing.push(id);
      }
    }

    if (missing.length > 0) {
      const response = await this.fetchWithTimeout('https://fake-host/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripIds: missing }),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch from Durable Object: ${response.status}`);
      }

      const data = await response.json<CachedRealtimeData>();
      const found = new Map(data.tripUpdates.map((raw) => [raw.tripId, raw]));
      for (const id of missing) {
        const raw = found.get(id);
        const mapped = raw ? this.mapToTripUpdate(raw) : undefined;
        this.selectiveCache.set(id, mapped);
        if (mapped) {
          result.set(id, mapped);
        }
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
    isolateCache = null;
    this.loadPromise = null;
    this.selectiveCache.clear();
  }

  /**
   * リアルタイムデータを取得する（リクエストスコープでメモ化）
   */
  private load(): Promise<{ fetchedAt: number; tripUpdates: TripUpdate[] }> {
    if (!this.loadPromise) {
      this.loadPromise = this.fetchShared();
    }
    return this.loadPromise;
  }

  /**
   * Durable Objectからリアルタイムデータを取得し、変換済みエンティティを返す
   *
   * 手元のisolateキャッシュと同じ版であればDOは304を返し、
   * 本文のパース・エンティティ変換を丸ごと省略する。
   */
  private async fetchShared(): Promise<{ fetchedAt: number; tripUpdates: TripUpdate[] }> {
    const known = isolateCache;
    const url = known
      ? `https://fake-host/data?since=${known.fetchedAt}`
      : 'https://fake-host/data';
    const response = await this.fetchWithTimeout(url);

    if (response.status === 304 && known) {
      return known;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch from Durable Object: ${response.status}`);
    }

    const data = await response.json<CachedRealtimeData>();
    if (!data) {
      // Return empty data if no cache available yet（キャッシュには載せない）
      return { fetchedAt: Date.now(), tripUpdates: [] };
    }

    const mapped = {
      fetchedAt: data.fetchedAt,
      tripUpdates: data.tripUpdates.map((raw) => this.mapToTripUpdate(raw)),
    };
    isolateCache = mapped;
    return mapped;
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
