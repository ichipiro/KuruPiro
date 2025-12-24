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

// デバッグ用エンドポイント（ワイルドカードより先に定義）
// デバッグ用：リアルタイムデータ強制更新
app.post('/api/debug/update-realtime', async (c) => {
  try {
    const factory = c.get('factory');
    const realtimeRepo = factory.getRealtimeRepository();
    await realtimeRepo.forceUpdate();
    return c.json({ status: 'updated', timestamp: Date.now() });
  } catch (error) {
    console.error('Failed to update realtime data:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Update failed' }, 500);
  }
});

// デバッグ用：キャッシュの最終更新時刻を取得
app.get('/api/debug/cache-info', async (c) => {
  try {
    const factory = c.get('factory');
    const realtimeRepo = factory.getRealtimeRepository();
    const lastUpdated = await realtimeRepo.getLastUpdatedAt();
    const allUpdates = await realtimeRepo.getAllTripUpdates();

    const now = Date.now();
    const ageSeconds = Math.floor((now - lastUpdated) / 1000);

    // クエリパラメータでtripIdsを要求された場合はトリップIDのリストを返す
    const includeTripIds = c.req.query('includeTripIds') === 'true';

    return c.json({
      lastUpdatedAt: new Date(lastUpdated).toISOString(),
      ageSeconds,
      totalTrips: allUpdates.length,
      now: new Date(now).toISOString(),
      ...(includeTripIds && { tripIds: allUpdates.map(u => u.tripId.value) }),
    });
  } catch (error) {
    console.error('Failed to get cache info:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Failed' }, 500);
  }
});

// デバッグ用：リアルタイムデータ詳細取得
app.get('/api/debug/realtime/:trip_id', async (c) => {
  try {
    const tripId = c.req.param('trip_id');
    const factory = c.get('factory');
    const realtimeRepo = factory.getRealtimeRepository();
    const allUpdates = await realtimeRepo.getAllTripUpdates();

    // 指定されたtripを探す
    const targetUpdate = allUpdates.find(update => update.tripId.value === tripId);

    if (!targetUpdate) {
      return c.json({
        found: false,
        totalTrips: allUpdates.length,
        message: `Trip ${tripId} not found in realtime data`
      });
    }

    // 詳細情報を返す
    return c.json({
      found: true,
      tripId: targetUpdate.tripId.value,
      stopTimeUpdates: targetUpdate.stopTimeUpdates.map(update => ({
        stopSequence: update.stopSequence,
        stopId: update.stopId?.value,
        arrivalDelay: update.arrivalDelay?.toSeconds(),
        arrivalTime: update.arrivalTime,
        departureDelay: update.departureDelay?.toSeconds(),
        departureTime: update.departureTime,
        representativeDelay: update.getRepresentativeDelay().toSeconds(),
      }))
    });
  } catch (error) {
    console.error('Failed to get realtime data:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Failed' }, 500);
  }
});

// バス情報エンドポイント（ワイルドカードは最後に定義）
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
