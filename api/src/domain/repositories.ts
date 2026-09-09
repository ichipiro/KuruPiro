/**
 * リポジトリインターフェースを集約したファイル
 *
 * 含まれるインターフェース:
 * - ICalendarRepository: カレンダーデータへのアクセス
 * - IRealtimeRepository: リアルタイムデータへのアクセス
 * - IRouteRepository: 路線データへのアクセス
 * - IStopRepository: 停留所データへのアクセス
 * - IStopTimeRepository: 停車時刻データへのアクセス
 * - ITripRepository: トリップデータへのアクセス
 */

import { Calendar } from './entities/Calendar';
import { Route } from './entities/Route';
import { Stop } from './entities/Stop';
import { StopTime } from './entities/StopTime';
import { Trip } from './entities/Trip';
import { TripUpdate } from './entities/TripUpdate';
import { JSTDateTime } from './value-objects/time';
import { StopId, TripId } from './value-objects/identifiers';

/**
 * 運行カレンダーリポジトリのインターフェース
 *
 * ドメイン層で定義し、インフラ層で実装します（依存性逆転の原則）
 */
export interface ICalendarRepository {
  /**
   * サービスIDでカレンダーを検索
   * @param serviceId サービスID
   * @returns カレンダー、見つからない場合はundefined
   */
  findByServiceId(serviceId: string): Promise<Calendar | undefined>;
  /**
   * 指定した日付と曜日に有効なカレンダーを検索
   * @param date 日付
   * @param weekday 曜日（0=Monday, 6=Sunday）
   * @returns 有効なカレンダーの配列
   */
  findActiveByDateAndWeekday(date: JSTDateTime, weekday: number): Promise<Calendar[]>;
  /**
   * 全てのカレンダーを取得
   * @returns カレンダーの配列
   */
  findAll(): Promise<Calendar[]>;
}
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
   * 指定したトリップ群のリアルタイム更新情報を取得
   *
   * フィード全件（350KB超）をリクエスト毎に取得・変換するとCPU制限を
   * 圧迫するため、ホットパスでは必要なトリップだけを問い合わせる。
   *
   * @returns tripId文字列 → TripUpdate のMap（フィードに存在するもののみ）
   */
  getTripUpdatesForTrips(tripIds: TripId[]): Promise<Map<string, TripUpdate>>;
  /**
   * リアルタイムデータの最終更新時刻を取得（Unix timestamp）
   */
  getLastUpdatedAt(): Promise<number>;
  /**
   * リアルタイムデータを強制更新
   */
  forceUpdate(): Promise<void>;
}
/**
 * 路線リポジトリのインターフェース
 *
 * ドメイン層で定義し、インフラ層で実装します（依存性逆転の原則）
 */
export interface IRouteRepository {
  /**
   * IDで路線を検索
   * @param routeId 路線ID
   * @returns 路線、見つからない場合はundefined
   */
  findById(routeId: string): Promise<Route | undefined>;
  /**
   * 全ての路線を取得
   * @returns 路線の配列
   */
  findAll(): Promise<Route[]>;
}
/**
 * 停留所リポジトリのインターフェース
 *
 * ドメイン層で定義し、インフラ層で実装します（依存性逆転の原則）
 */
export interface IStopRepository {
  /**
   * IDで停留所を検索
   * @param id 停留所ID
   * @returns 停留所、見つからない場合はundefined
   */
  findById(id: StopId): Promise<Stop | undefined>;
  /**
   * 停留所名で検索
   * @param id 停留所ID
   * @returns 停留所名、見つからない場合は空文字列
   */
  findNameById(id: StopId): Promise<string>;
  /**
   * 複数の停留所名をまとめて検索
   *
   * 便ごとに findNameById を呼ぶとD1への問い合わせがN+1になるため、
   * 1クエリでまとめて引くための入口。
   *
   * @param ids 停留所IDの配列
   * @returns 停留所ID → 停留所名 のMap（見つからなかったIDはキーを持たない）
   */
  findNamesByIds(ids: StopId[]): Promise<Map<string, string>>;
  /**
   * 全ての停留所を取得
   * @returns 停留所の配列
   */
  findAll(): Promise<Stop[]>;
}
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
   * 複数のトリップIDの停車時刻をまとめて検索（順序順）
   *
   * 経由地フィルタのようにトリップごとに停車地を引く処理でN+1を避けるための入口。
   *
   * @param tripIds トリップIDの配列
   * @returns トリップID → 停車時刻の配列（停車順序順）のMap
   */
  findByTripIds(tripIds: TripId[]): Promise<Map<string, StopTime[]>>;
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
/**
 * トリップリポジトリのインターフェース
 *
 * ドメイン層で定義し、インフラ層で実装します（依存性逆転の原則）
 */
export interface ITripRepository {
  /**
   * IDでトリップを検索
   * @param id トリップID
   * @returns トリップ、見つからない場合はundefined
   */
  findById(id: TripId): Promise<Trip | undefined>;
  /**
   * サービスIDでトリップを検索
   * @param serviceId サービスID
   * @returns トリップの配列
   */
  findByServiceId(serviceId: string): Promise<Trip[]>;
  /**
   * 路線IDでトリップを検索
   * @param routeId 路線ID
   * @returns トリップの配列
   */
  findByRouteId(routeId: string): Promise<Trip[]>;
}
