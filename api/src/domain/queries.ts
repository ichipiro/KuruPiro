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
   * 出発地と目的地を通過するトリップを、その曜日の1日分まとめて取得
   *
   * 現在時刻での絞り込みは行いません。曜日ごとの時刻表は
   * GTFSの静的データが更新されるまで変化しないため、
   * 呼び出し側でキャッシュでき、D1への読み取りを大幅に削減できます。
   * 現在時刻・リアルタイム情報による絞り込みは呼び出し側（TripFinderService）が行います。
   *
   * @param originStopId 出発地停留所ID
   * @param destinationStopId 目的地停留所ID（末尾に_があるとプレフィックスマッチ）
   * @param weekday 曜日（0=Monday, 6=Sunday）
   * @returns 到着時刻順のトリップ検索結果（その曜日の全便）
   */
  findByStopsAndWeekday(
    originStopId: StopId,
    destinationStopId: StopId,
    weekday: number
  ): Promise<TripSearchResult[]>;
}
