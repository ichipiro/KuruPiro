/**
 * Durable Object（RealtimeCache）固有の型定義
 *
 * GTFS Realtimeデータのスナップショット形式を定義します。
 * ドメインエンティティ（TripUpdate）への変換は mapRawToTripUpdate が担います。
 */

/**
 * GTFSリアルタイムのトリップ更新情報（生データ形式）
 *
 * R2スナップショットに永続化される形式です。
 * ドメインエンティティ（TripUpdate）とは別物です。
 */
export interface TripUpdateRaw {
  tripId: string;
  stopTimeUpdates: {
    stopSequence?: number;
    stopId?: string;
    arrivalDelay?: number;
    arrivalTime?: number;
    departureDelay?: number;
    departureTime?: number;
  }[];
}

/**
 * リアルタイムデータのスナップショット形式
 *
 * R2スナップショットに永続化されるデータ全体の構造です。
 */
export interface CachedRealtimeData {
  fetchedAt: number;
  tripUpdates: TripUpdateRaw[];
}
