import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from '@/types';
import { injectServiceFactory } from '@/presentation/middleware';
import { errorHandler } from '@/presentation/middleware';
import { BusController } from '@/presentation/controllers';
import { StopController } from '@/presentation/controllers';
import { DebugController } from '@/presentation/controllers';
import type { ServiceFactory } from '@/infrastructure/di/ServiceFactory';

const app = new Hono<{
  Bindings: Env;
  Variables: {
    factory: ServiceFactory;
  };
}>();

// グローバルミドルウェア
// DEBUG_MODEがtrueの場合のみオープンなCORS設定を使用
//
// maxAge(Access-Control-Max-Age)はプリフライト結果（許可判定のみ・データは
// 含まない）をブラウザにキャッシュさせる秒数。未指定だと既定5秒のため、
// サイネージの15秒ポーリングで毎回 OPTIONS+POST の2往復になっていた。
// 7200秒はChromium系が受け付ける上限（超過分は切り詰められる）。
app.use('*', async (c, next) => {
  const isDebugMode = c.env.DEBUG_MODE === 'true';
  if (isDebugMode) {
    return cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      maxAge: 7200,
    })(c, next);
  }
  return cors({ origin: '*', maxAge: 7200 })(c, next);
});
app.use('*', injectServiceFactory());
app.use('*', errorHandler);

// ヘルスチェックエンドポイント
app.get('/', (c) => {
  return c.json({ status: 'healthy' });
});

// デバッグ用エンドポイント（ワイルドカードより先に定義）
app.post('/api/debug/update-realtime', DebugController.updateRealtime);
app.get('/api/debug/cache-info', DebugController.getCacheInfo);
app.get('/api/debug/realtime/:trip_id', DebugController.getRealtimeDetail);

app.get('/api/trips', BusController.getTrips);
app.post('/api/trips/batch', BusController.batchTrips);
app.get('/api/stops/:stop_id', StopController.getStopInfo);

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
    // No-op: cronは未使用（GTFSデータの更新はGitHub Actionsが行う）
  },
};
