import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from '@/types';
import { injectServiceFactory } from '@/presentation/middleware/serviceFactory';
import { errorHandler } from '@/presentation/middleware/errorHandler';
import { BusController } from '@/presentation/controllers/BusController';
import { StopController } from '@/presentation/controllers/StopController';

const app = new Hono<{ Bindings: Env }>();

// グローバルミドルウェア
app.use('*', cors());
app.use('*', injectServiceFactory());
app.use('*', errorHandler);

// ヘルスチェックエンドポイント
app.get('/', (c) => {
  return c.json({ status: 'healthy' });
});

// バス情報エンドポイント
app.get('/api/:stop_id/:dest_stop_id', BusController.getNextBuses);

// 停留所情報エンドポイント
app.get('/api/stop/:stop_id/name', StopController.getStopName);

// グローバルエラーハンドラー
app.onError((err, c) => {
  console.error('Worker error', err);
  return c.json({ error: err.message || 'Internal Server Error' }, 500);
});

// Durable Objectのエクスポート
export { RealtimeCache } from './realtimeCache';

// Workerのエクスポート
export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, _env: Env, _ctx: ExecutionContext): Promise<void> {
    // No-op: D1 data is refreshed by GitHub Actions
    // This cron job is no longer needed but kept for compatibility
  },
};
