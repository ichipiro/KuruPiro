import { IRealtimeRepository } from '@/domain/repositories';
import { TripUpdate } from '@/domain/entities/TripUpdate';
import { TripId } from '@/domain/value-objects/identifiers';
import type { Env } from '@/types';
import type { CachedRealtimeData, TripUpdateRaw } from '@/infrastructure/external/durable-objects/types';
import { mapRawToTripUpdate } from './mapRawToTripUpdate';

/** スナップショットのR2キー（realtimeCache.ts のポーラーが書く先と一致させること） */
const SNAPSHOT_KEY = 'realtime/trip-updates.json';

/** この時間以内に同期済みならR2にも触れない（ポーラーの更新周期と同じ） */
const FRESH_MS = 15_000;

/** R2読み取りの上限時間。超えたら手元のキャッシュで応答する */
const R2_TIMEOUT_MS = 2_500;

/** これより古いスナップショットは提供しない（誤解を招く遅延情報を出さない上限） */
const MAX_STALE_MS = 5 * 60_000;

/** スナップショットがこの齢を超えていたらポーラー(DO)のalarm復活を裏で促す */
const WATCHDOG_AGE_MS = 45_000;

interface SnapshotCacheState {
  /** R2オブジェクトのETag（条件付き読み取りで転送をスキップするため） */
  etag: string;
  /** ポーラーがフィードを取得した時刻 */
  fetchedAt: number;
  /** このisolateがR2と同期した時刻 */
  syncedAt: number;
  rawByTripId: Map<string, TripUpdateRaw>;
  /** エンティティ変換の遅延メモ（要求されたトリップだけ変換する） */
  entities: Map<string, TripUpdate>;
}

/**
 * isolate単位のスナップショットキャッシュ
 *
 * Worker isolateはユーザートラフィックで温まり続けるため、
 * ここでの保持はDOと違い実際に機能する。
 */
let isolateCache: SnapshotCacheState | null = null;
/** 同期の単一飛行（同時リクエストが同じR2読み取りを共有する） */
let syncInFlight: Promise<void> | null = null;

/**
 * テスト用: isolateキャッシュを破棄する
 * @internal
 */
export function resetSnapshotCache(): void {
  isolateCache = null;
  syncInFlight = null;
}

/**
 * R2スナップショットからリアルタイム情報を読むリポジトリ
 *
 * ## 設計の背景
 * 旧実装はリクエストごとにDOへ問い合わせていたが、無料プランのDOは
 * トラフィック下でも約20秒ごとにisolateがリサイクルされ、コールドブートが
 * 時々数秒固まる（実測: タイムアウト全件がブートと完全相関、約10%の
 * リクエストがwallTime約5秒）。本リポジトリはDO(ポーラー)が15秒ごとに
 * R2へ書くスナップショットを読むだけにし、読み取り経路からDOを排除する。
 *
 * - 15秒以内に同期済み: R2にも触れず即応答
 * - それ以外: R2をETag条件付きで読む（変わっていなければ本文転送なし）
 * - R2が遅い/失敗: 手元のキャッシュ（5分まで）で応答し、鮮度より可用性を優先
 * - スナップショットが45秒超に古い: ポーラーのalarm復活を waitUntil で促す
 *   （読み取り経路がDOを呼ばなくなったことで生じる「alarm無音死」への保険）
 */
export class SnapshotRealtimeRepository implements IRealtimeRepository {
  private doStub: DurableObjectStub;

  constructor(
    private readonly env: Env,
    private readonly executionCtx?: ExecutionContext
  ) {
    const id = env.REALTIME_CACHE.idFromName('realtime-cache');
    this.doStub = env.REALTIME_CACHE.get(id);
  }

  async getAllTripUpdates(): Promise<TripUpdate[]> {
    const cache = await this.ensureData();
    if (!cache) return [];
    return [...cache.rawByTripId.keys()].map((tripId) => this.entityOf(cache, tripId)!);
  }

  async getTripUpdate(tripId: TripId): Promise<TripUpdate | undefined> {
    const cache = await this.ensureData();
    if (!cache) return undefined;
    return this.entityOf(cache, tripId.value);
  }

  async getLastUpdatedAt(): Promise<number> {
    const cache = await this.ensureData();
    return cache?.fetchedAt ?? Date.now();
  }

  async getTripUpdatesForTrips(tripIds: TripId[]): Promise<Map<string, TripUpdate>> {
    const result = new Map<string, TripUpdate>();
    const cache = await this.ensureData();
    if (!cache) return result;
    for (const tripId of tripIds) {
      const entity = this.entityOf(cache, tripId.value);
      if (entity) {
        result.set(tripId.value, entity);
      }
    }
    return result;
  }

  /**
   * リアルタイムデータを強制更新（ポーラーに即時取得させ、手元キャッシュを破棄）
   */
  async forceUpdate(): Promise<void> {
    await this.doStub.fetch('https://fake-host/update');
    resetSnapshotCache();
  }

  /**
   * 要求されたトリップだけエンティティに変換する（遅延変換）
   *
   * スナップショット全体は約250便・4,000超の停留所更新を含み、全件変換は
   * コールドisolateのCPUを無駄に使うため、使う分だけ変換してメモ化する。
   */
  private entityOf(cache: SnapshotCacheState, tripId: string): TripUpdate | undefined {
    const memoized = cache.entities.get(tripId);
    if (memoized) return memoized;
    const raw = cache.rawByTripId.get(tripId);
    if (!raw) return undefined;
    const entity = mapRawToTripUpdate(raw);
    cache.entities.set(tripId, entity);
    return entity;
  }

  private async ensureData(): Promise<SnapshotCacheState | null> {
    const cache = isolateCache;
    if (cache && Date.now() - cache.syncedAt < FRESH_MS) {
      this.scheduleWatchdog(cache);
      return cache;
    }

    try {
      await this.sync();
    } catch (error) {
      // R2が遅い/失敗しても、新しめのキャッシュがあればそれで応答する
      const fallback = isolateCache;
      if (fallback && Date.now() - fallback.fetchedAt < MAX_STALE_MS) {
        console.warn('[SnapshotRealtime] R2 read failed, serving cached snapshot:', error);
        this.scheduleWatchdog(fallback);
        return fallback;
      }
      throw error;
    }

    const synced = isolateCache;
    if (synced) {
      this.scheduleWatchdog(synced);
    }
    return synced;
  }

  /** R2と同期する（単一飛行） */
  private sync(): Promise<void> {
    if (!syncInFlight) {
      syncInFlight = this.readSnapshot().finally(() => {
        syncInFlight = null;
      });
    }
    return syncInFlight;
  }

  private async readSnapshot(): Promise<void> {
    const known = isolateCache;
    const get = known
      ? this.env.REALTIME_BUCKET.get(SNAPSHOT_KEY, {
          onlyIf: { etagDoesNotMatch: known.etag },
        })
      : this.env.REALTIME_BUCKET.get(SNAPSHOT_KEY);

    const object = await this.withTimeout(get);

    if (object === null) {
      // スナップショット未作成（初回デプロイ直後など）。
      // ポーラーの起動を促し、今回はリアルタイムなしで進む
      this.pingPoller();
      return;
    }

    // 条件付き読み取りでETag一致（= 変わっていない）の場合、bodyなしで返る
    if (!('body' in object) || object.body === null) {
      if (known) {
        known.syncedAt = Date.now();
      }
      return;
    }

    const data = (await this.withTimeout(object.json())) as CachedRealtimeData;
    isolateCache = {
      etag: object.httpEtag,
      fetchedAt: data.fetchedAt,
      syncedAt: Date.now(),
      rawByTripId: new Map(data.tripUpdates.map((raw) => [raw.tripId, raw])),
      entities: new Map(),
    };
  }

  private withTimeout<T>(promise: Promise<T>): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`R2 read timed out after ${R2_TIMEOUT_MS}ms`)), R2_TIMEOUT_MS)
      ),
    ]);
  }

  /**
   * スナップショットが古くなっていたら、ポーラーのalarm復活を裏で促す
   */
  private scheduleWatchdog(cache: SnapshotCacheState): void {
    if (Date.now() - cache.fetchedAt <= WATCHDOG_AGE_MS) {
      return;
    }
    this.pingPoller();
  }

  private pingPoller(): void {
    const ping = this.doStub
      .fetch('https://fake-host/ensure-alarm')
      .then((response) => response.arrayBuffer())
      .then(() => undefined)
      .catch(() => undefined);
    if (this.executionCtx) {
      this.executionCtx.waitUntil(ping);
    }
  }
}
