/**
 * Cloudflare Workers の環境変数型定義
 */
export interface Env {
  DB: D1Database;
  GTFS_CACHE: KVNamespace;
  GTFS_STATIC_URL: string;
  GTFS_REALTIME_URL: string;
  REALTIME_UPDATE_INTERVAL?: string;
  REALTIME_CACHE: DurableObjectNamespace;
  REALTIME_BUCKET: R2Bucket;
  /** "false"でDOのポーリングを止める（プレビューWorkerでポーラーが重複しないように） */
  REALTIME_POLLER_ENABLED?: string;
  ANALYTICS: AnalyticsEngineDataset;
  DEBUG_MODE?: string;
}
