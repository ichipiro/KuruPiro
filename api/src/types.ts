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
  /** "true"で共有ストア(KV)への書き込みを止める（プレビューWorkerが本番KVの時刻表キャッシュやpairs記録を汚染しないように） */
  CACHE_WRITE_DISABLED?: string;
  ANALYTICS: AnalyticsEngineDataset;
  DEBUG_MODE?: string;
  /** Sentryの送信先DSN（公開書き込み専用キー）。未設定ならSDKは無効のまま */
  SENTRY_DSN?: string;
  /** Sentry上で環境を区別するラベル（production / preview） */
  SENTRY_ENVIRONMENT?: string;
  /** トレースのサンプルレート（0〜1の数値文字列）。不正値・未設定時はコード側の既定値 */
  SENTRY_TRACES_SAMPLE_RATE?: string;
}
