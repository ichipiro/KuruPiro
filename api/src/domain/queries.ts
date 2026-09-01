/**
 * ドメイン層のクエリインターフェースと結果型
 *
 * インフラ層の実装詳細をドメイン層から隠蔽するための抽象化。
 * 依存性逆転の原則（DIP）に従い、ドメイン層がインターフェースを定義し、
 * インフラ層がそれを実装します。
 */

import type { GTFSTime } from './value-objects/time';
import type { StopId } from './value-objects/identifiers';

/**
 * トリップ検索結果の型
 *
 * 出発地・目的地を通過するトリップの検索結果を表します。
 */
export interface TripSearchResult {
  tripId: string;
  arrivalTime: GTFSTime;
  stopSequence: number;
  routeShortName: string;
  destinationStopId: string;
  destinationLabel: string;
  serviceId: string;
}

/**
 * トリップ検索クエリのインターフェース
 *
 * ドメイン層で定義し、インフラ層で実装します（依存性逆転の原則）。
 */
export interface IFindTripsQuery {
  /**
   * 出発地と目的地を通過するトリップを検索
   *
   * 曜日の時刻表を取得し、時刻表ベースの便（currentTime以降）と
   * リアルタイムで遅延中の便（realtimeTripIds）を統合して返します。
   *
   * @param originStopId 出発地停留所ID
   * @param destinationStopId 目的地停留所ID（末尾に_があるとプレフィックスマッチ）
   * @param weekday 曜日（0=Monday, 6=Sunday）
   * @param currentTime 現在時刻（この時刻以降の便のみ）
   * @param realtimeTripIds リアルタイムで運行中のtripId一覧（時刻フィルタを免除）
   */
  findByStopsAndTimeWithRealtime(
    originStopId: StopId,
    destinationStopId: StopId,
    weekday: number,
    currentTime: GTFSTime,
    realtimeTripIds: string[]
  ): Promise<TripSearchResult[]>;
}
