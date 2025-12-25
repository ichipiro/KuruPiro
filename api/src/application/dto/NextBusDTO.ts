/**
 * 次のバス情報のDTO（Data Transfer Object）
 *
 * アプリケーション層からプレゼンテーション層へのデータ転送に使用します。
 */
export interface NextBusDTO {
  /**
   * 予定到着時刻（HH:MM形式）
   */
  scheduledArrival: string;

  /**
   * 実際の到着時刻（HH:MM形式）
   */
  actualArrival: string;

  /**
   * 残り時間の表示文字列（例: "あと5分"、"まもなく到着"）
   */
  remainingTime: string;

  /**
   * 残り時間（分）- ソート用
   */
  remainingMinutes: number;

  /**
   * 路線名（例: "1"）
   */
  routeShortName: string;

  /**
   * 行き先ラベル（例: "終点"、"東京駅行き"）
   */
  destinationLabel: string;

  /**
   * トリップID
   */
  tripId: string;

  /**
   * 遅延時間（秒）
   */
  delaySeconds: number;

  /**
   * 遅延の表示文字列（例: "5分遅れ"、空文字列）
   */
  delayDisplay: string;

  /**
   * フィードから削除されているかどうか（true = 到着済み）
   * GTFS Realtimeフィードに該当stopSequenceのStopTimeUpdateが存在しない場合にtrue
   */
  isArrivedInFeed: boolean;

  /**
   * 現在のバスの位置（停留所名のみ、例: "Ａシティ中央"）
   * リアルタイムデータがない場合は空文字列
   */
  currentLocation: string;
}

/**
 * 停留所情報のDTO
 */
export interface StopDTO {
  /**
   * 停留所ID
   */
  stopId: string;

  /**
   * 停留所名
   */
  stopName: string;
}

/**
 * トリップ情報のDTO（詳細情報用）
 */
export interface TripDTO {
  /**
   * トリップID
   */
  tripId: string;

  /**
   * 路線ID
   */
  routeId: string;

  /**
   * サービスID
   */
  serviceId: string;

  /**
   * ヘッドサイン（行き先表示）
   */
  headsign?: string;

  /**
   * 方向ID（0=往路, 1=復路）
   */
  directionId: number;
}
