/**
 * Durable Object（RealtimeCache）固有の型定義
 *
 * GTFS Realtimeデータのキャッシュ形式を定義します。
 * ドメインエンティティ（TripUpdate）への変換は DurableObjectRealtimeRepository が担います。
 */

/**
 * GTFSリアルタイムのトリップ更新情報（生データ形式）
 *
 * DurableObjectのストレージに永続化される形式です。
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
 * リアルタイムデータのキャッシュ形式
 *
 * DurableObjectのストレージに永続化されるデータ全体の構造です。
 */
export interface CachedRealtimeData {
  fetchedAt: number;
  tripUpdates: TripUpdateRaw[];
}
