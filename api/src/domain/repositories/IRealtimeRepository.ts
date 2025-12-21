import { TripUpdate } from '../entities/TripUpdate';
import { TripId } from '../value-objects/TripId';

/**
 * リアルタイム情報リポジトリのインターフェース
 *
 * GTFSリアルタイムデータへのアクセスを提供します。
 */
export interface IRealtimeRepository {
  /**
   * 全てのトリップ更新情報を取得
   */
  getAllTripUpdates(): Promise<TripUpdate[]>;

  /**
   * 指定したトリップIDの更新情報を取得
   */
  getTripUpdate(tripId: TripId): Promise<TripUpdate | undefined>;

  /**
   * リアルタイムデータの最終更新時刻を取得（Unix timestamp）
   */
  getLastUpdatedAt(): Promise<number>;

  /**
   * リアルタイムデータを強制更新
   */
  forceUpdate(): Promise<void>;
}
