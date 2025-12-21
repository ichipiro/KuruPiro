import { StopTime } from '../entities/StopTime';
import { TripId } from '../value-objects/TripId';
import { StopId } from '../value-objects/StopId';

/**
 * 停車時刻リポジトリのインターフェース
 *
 * ドメイン層で定義し、インフラ層で実装します（依存性逆転の原則）
 */
export interface IStopTimeRepository {
  /**
   * トリップIDで停車時刻を検索（順序順）
   * @param tripId トリップID
   * @returns 停車時刻の配列（停車順序順）
   */
  findByTripId(tripId: TripId): Promise<StopTime[]>;

  /**
   * 停留所IDで停車時刻を検索
   * @param stopId 停留所ID
   * @returns 停車時刻の配列
   */
  findByStopId(stopId: StopId): Promise<StopTime[]>;

  /**
   * トリップIDと停留所IDで停車時刻を検索
   * @param tripId トリップID
   * @param stopId 停留所ID
   * @returns 停車時刻、見つからない場合はundefined
   */
  findByTripAndStop(tripId: TripId, stopId: StopId): Promise<StopTime | undefined>;
}
