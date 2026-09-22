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
   * 出発地と目的地を通過するトリップを、そのサービス日の1日分まとめて取得
   *
   * サービス日単位で運行判定を行う:
   * - calendar の曜日フラグと適用期間（start_date〜end_date）
   * - calendar_dates の例外（祝日など。type=1で追加、type=2で除外）
   *
   * 現在時刻での絞り込みは行わない。ある日の時刻表はGTFSの静的データが
   * 更新されるまで変化しないため、呼び出し側でキャッシュでき、
   * D1への読み取りを大幅に削減できる。現在時刻・リアルタイム情報による
   * 絞り込みは呼び出し側（TripFinderService）が行う。
   *
   * @param originStopId 出発地停留所ID
   * @param destinationStopId 目的地停留所ID（末尾に_があるとプレフィックスマッチ）
   * @param serviceDate サービス日（YYYYMMDD。深夜0〜2時台は前日扱い）
   * @param weekday serviceDateの曜日（0=Monday, 6=Sunday）
   */
  findByStopsAndDate(
    originStopId: StopId,
    destinationStopId: StopId,
    serviceDate: string,
    weekday: number
  ): Promise<TripSearchResult[]>;
}
