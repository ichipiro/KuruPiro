import { Hono } from 'hono';
import { cors } from 'hono/cors';
import * as Sentry from '@sentry/cloudflare';
import type { Env } from '@/types';
import { sentryOptions } from '@/sentry';
import { injectServiceFactory } from '@/presentation/middleware';
import { BadRequestError } from '@/presentation/errors';
import { BusController } from '@/presentation/controllers';
import { StopController } from '@/presentation/controllers';
import { DebugController } from '@/presentation/controllers';
import { HealthController } from '@/presentation/controllers';
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
// exposeHeaders(Access-Control-Expose-Headers)が無いと、クロスオリジンの
// fetchからはリアルタイム鮮度ヘッダが読めない（サイネージが検知に使う）
const REALTIME_FRESHNESS_HEADERS = ['X-Realtime-Updated-At', 'X-Realtime-Age-Seconds'];

app.use('*', async (c, next) => {
  const isDebugMode = c.env.DEBUG_MODE === 'true';
  if (isDebugMode) {
    return cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      exposeHeaders: REALTIME_FRESHNESS_HEADERS,
      maxAge: 7200,
    })(c, next);
  }
  return cors({ origin: '*', exposeHeaders: REALTIME_FRESHNESS_HEADERS, maxAge: 7200 })(c, next);
});
app.use('*', injectServiceFactory());

// ヘルスチェックエンドポイント
app.get('/', (c) => {
  return c.json({ status: 'healthy' });
});

// 外形監視用: リアルタイム提供が止まっているとき(未取得・5分上限超過)に503を返す
app.get('/api/health', HealthController.getHealth);

// デバッグ用エンドポイント（ワイルドカードより先に定義）
app.post('/api/debug/update-realtime', DebugController.updateRealtime);
app.get('/api/debug/cache-info', DebugController.getCacheInfo);
app.get('/api/debug/realtime/:trip_id', DebugController.getRealtimeDetail);

// Sentry疎通確認用（DEBUG_MODE環境のみ）。onError→captureExceptionの実経路を通す
app.get('/api/debug/sentry-test', (c) => {
  if (c.env.DEBUG_MODE !== 'true') {
    return c.json({ error: 'Not found' }, 404);
  }
  throw new Error(`Sentry test error ${new Date().toISOString()}`);
});

app.get('/api/trips', BusController.getTrips);
app.post('/api/trips/batch', BusController.batchTrips);
app.get('/api/stops/:stop_id', StopController.getStopInfo);

// グローバルエラーハンドラー
//
// Honoはハンドラー内のthrowをミドルウェアのtry/catchへ伝播させず
// 直接ここへ渡すため、ステータス判定はonErrorで行うのが唯一の正解。
// 以前はerrorHandlerミドルウェアで判定していたが一度も実行されておらず、
// BadRequestErrorも500で返っていた。
app.onError((err, c) => {
  if (err instanceof BadRequestError) {
    return c.json({ error: err.message }, 400);
  }
  // Honoがthrowをここで握りつぶすため、withSentryの自動捕捉には乗らない。
  // 想定外エラー(500)だけを明示的にSentryへ送る
  Sentry.captureException(err);
  console.error('Worker error', err);
  // 内部エラーの詳細（D1/R2の生エラー文など）はログにのみ残し、
  // クライアントへは固定文言を返す
  return c.json({ error: 'Internal Server Error' }, 500);
});

// Durable Objectのエクスポート（Sentry計装を噛ませる）
// RealtimeCacheは旧式の `implements DurableObject` クラスのため
// ラッパーのジェネリクス制約(cloudflare:workersのDurableObject継承)に合わないが、
// ランタイムはどちらも new (state, env) で互換。型だけ元クラスに戻す
import { RealtimeCache as RealtimeCacheCore } from './realtimeCache';
export const RealtimeCache = Sentry.instrumentDurableObjectWithSentry(
  sentryOptions,
  RealtimeCacheCore as never
) as unknown as typeof RealtimeCacheCore;

// Workerのエクスポート
export default Sentry.withSentry(sentryOptions, {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, _env: Env, _ctx: ExecutionContext): Promise<void> {
    // No-op: cronは未使用（GTFSデータの更新はGitHub Actionsが行う）
  },
});
