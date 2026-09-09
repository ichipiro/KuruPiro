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
 * Durable Objectを使用したリアルタイムリポジトリの実装
 */
export class DurableObjectRealtimeRepository implements IRealtimeRepository {
  private stub: DurableObjectStub;
  private loadPromise: Promise<{ fetchedAt: number; tripUpdates: TripUpdate[] }> | null = null;

  constructor(env: Env) {
    // Use a fixed ID for the singleton Durable Object
    const id = env.REALTIME_CACHE.idFromName('realtime-cache');
    this.stub = env.REALTIME_CACHE.get(id);
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
   * リアルタイムデータを強制更新
   */
  async forceUpdate(): Promise<void> {
    await this.stub.fetch('https://fake-host/update');
    // 次の読み取りで新しいデータを取り直させる
    isolateCache = null;
    this.loadPromise = null;
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
    const response = await this.stub.fetch(url);

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
