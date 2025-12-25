import { IRealtimeRepository } from '@/domain/repositories';
import { TripUpdate, StopTimeUpdate } from '@/domain/entities/TripUpdate';
import { TripId, StopId, Delay } from '@/domain/value-objects/identifiers';
import { Env, CachedRealtimeData } from '@/types';

/**
 * Durable Objectを使用したリアルタイムリポジトリの実装
 */
export class DurableObjectRealtimeRepository implements IRealtimeRepository {
  private stub: DurableObjectStub;

  constructor(env: Env) {
    // Use a fixed ID for the singleton Durable Object
    const id = env.REALTIME_CACHE.idFromName('realtime-cache');
    this.stub = env.REALTIME_CACHE.get(id);
  }

  /**
   * キャッシュが古い場合は更新（ローカル開発環境対応）
   */
  private async ensureFreshData(): Promise<CachedRealtimeData> {
    const data = await this.fetchRealtimeData();

    // キャッシュが古い場合は強制更新
    const now = Date.now();
    const ageSeconds = Math.floor((now - data.fetchedAt) / 1000);
    const maxAgeSeconds = 30; // 30秒以上古い場合は更新

    if (ageSeconds > maxAgeSeconds) {
      console.log(`[DurableObjectRealtimeRepository] Cache is ${ageSeconds}s old, forcing update...`);
      await this.forceUpdate();
      return await this.fetchRealtimeData();
    }

    return data;
  }

  /**
   * 全てのトリップ更新情報を取得
   */
  async getAllTripUpdates(): Promise<TripUpdate[]> {
    const data = await this.ensureFreshData();
    return data.tripUpdates.map((raw) => this.mapToTripUpdate(raw));
  }

  /**
   * 指定したトリップIDの更新情報を取得
   */
  async getTripUpdate(tripId: TripId): Promise<TripUpdate | undefined> {
    const data = await this.ensureFreshData();
    const raw = data.tripUpdates.find((update) => update.tripId === tripId.value);
    if (!raw) {
      return undefined;
    }
    return this.mapToTripUpdate(raw);
  }

  /**
   * リアルタイムデータの最終更新時刻を取得（Unix timestamp）
   */
  async getLastUpdatedAt(): Promise<number> {
    const data = await this.fetchRealtimeData();
    return data.fetchedAt;
  }

  /**
   * リアルタイムデータを強制更新
   */
  async forceUpdate(): Promise<void> {
    await this.stub.fetch('https://fake-host/update');
  }

  /**
   * Durable Objectからリアルタイムデータを取得
   */
  private async fetchRealtimeData(): Promise<CachedRealtimeData> {
    const response = await this.stub.fetch('https://fake-host/data');

    if (!response.ok) {
      throw new Error(
        `Failed to fetch from Durable Object: ${response.status}`
      );
    }

    const data = await response.json<CachedRealtimeData>();
    if (!data) {
      // Return empty data if no cache available yet
      return {
        fetchedAt: Date.now(),
        tripUpdates: [],
      };
    }

    return data;
  }

  /**
   * Raw TripUpdateEntityをドメインエンティティに変換
   */
  private mapToTripUpdate(raw: {
    tripId: string;
    stopTimeUpdates: {
      stopSequence?: number;
      stopId?: string;
      arrivalDelay?: number;
      arrivalTime?: number;
      departureDelay?: number;
      departureTime?: number;
    }[];
  }): TripUpdate {
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
