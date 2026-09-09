import type { Env } from './types';
import type { TripUpdateRaw, CachedRealtimeData } from './infrastructure/external/durable-objects/types';
import { ProtobufDecoder } from './infrastructure/external/gtfs/ProtobufDecoder';

/**
 * Durable Object that periodically polls GTFS Realtime API
 * and caches the trip updates data
 */
export class RealtimeCache implements DurableObject {
  private state: DurableObjectState;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  /**
   * Get the update interval from environment variables
   */
  private getUpdateInterval(): number {
    const intervalStr = this.env.REALTIME_UPDATE_INTERVAL;
    return intervalStr ? parseInt(intervalStr, 10) * 1000 : 15_000;
  }

  /**
   * Handle HTTP requests to this Durable Object
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Get cached data
    if (url.pathname === '/data') {
      const data = await this.getCachedData();

      // 呼び出し側が既に同じ版を持っていれば本文を送らない。
      // 350KB超のJSONをWorker側でリクエスト毎にパースするとCPU制限(無料10ms)を
      // 圧迫するため、フィードが変わったときだけ本文を返す
      const fetchedAt = data ? String(data.fetchedAt) : '';
      if (data && url.searchParams.get('since') === fetchedAt) {
        return new Response(null, {
          status: 304,
          headers: { 'X-Fetched-At': fetchedAt },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', 'X-Fetched-At': fetchedAt },
      });
    }

    // 指定トリップの更新情報だけを返す（ホットパス用）
    // Workerがフィード全件(350KB超)をパースするとCPU制限を圧迫するため、
    // 必要なトリップに絞った小さな応答を返す
    if (url.pathname === '/updates' && request.method === 'POST') {
      const body = await request.json<{ tripIds?: string[] }>();
      const wanted = new Set(body?.tripIds ?? []);
      const data = await this.getCachedData();

      const tripUpdates = data
        ? data.tripUpdates.filter((update) => wanted.has(update.tripId))
        : [];
      return new Response(
        JSON.stringify({ fetchedAt: data?.fetchedAt ?? Date.now(), tripUpdates }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Force update
    if (url.pathname === '/update') {
      await this.updateRealtimeData();
      return new Response(JSON.stringify({ status: 'updated' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404 });
  }

  /**
   * Handle alarm events for periodic updates
   */
  async alarm(): Promise<void> {
    await this.updateRealtimeData();
    // Schedule next update
    await this.state.storage.setAlarm(Date.now() + this.getUpdateInterval());
  }

  /**
   * Get cached realtime data from storage
   */
  private async getCachedData(): Promise<CachedRealtimeData | null> {
    // If no cached data exists, trigger initial update
    console.log('[RealtimeCache] Getting cached data...');
    const cachedData = await this.state.storage.get<CachedRealtimeData>('realtimeData');

    if (!cachedData) {
      console.log('[RealtimeCache] No cache found, updating...');
      await this.updateRealtimeData();
      // Schedule first alarm
      const currentAlarm = await this.state.storage.getAlarm();
      if (currentAlarm === null) {
        await this.state.storage.setAlarm(Date.now() + this.getUpdateInterval());
      }
      return (await this.state.storage.get<CachedRealtimeData>('realtimeData')) ?? null;
    }

    // stale-while-revalidate: キャッシュが古い場合はアラームを即座に再スケジュール
    // （/data・/updates どちらの経路でも効くようここで行う）
    const ageSeconds = Math.floor((Date.now() - cachedData.fetchedAt) / 1000);
    if (ageSeconds > this.getUpdateInterval() / 1000) {
      const currentAlarm = await this.state.storage.getAlarm();
      if (currentAlarm === null || currentAlarm > Date.now() + 5000) {
        console.log(`[RealtimeCache] Cache is ${ageSeconds}s old, rescheduling alarm immediately`);
        await this.state.storage.setAlarm(Date.now() + 1000);
      }
    }

    console.log(`[RealtimeCache] Returning cached data with ${cachedData.tripUpdates.length} updates`);
    return cachedData;
  }

  /**
   * Fetch and update realtime data
   */
  private async updateRealtimeData(): Promise<void> {
    try {
      console.log('[RealtimeCache] Fetching realtime data...');
      const tripUpdates = await this.fetchRealtimeTripUpdates();

      const data: CachedRealtimeData = {
        fetchedAt: Date.now(),
        tripUpdates,
      };

      await this.state.storage.put('realtimeData', data);
      console.log(`[RealtimeCache] Updated ${tripUpdates.length} trip updates`);
    } catch (error) {
      console.error('[RealtimeCache] Failed to update realtime data:', error);
      // Don't throw - keep existing cached data if update fails
    }
  }

  /**
   * Fetch trip updates from GTFS Realtime API
   */
  private async fetchRealtimeTripUpdates(): Promise<TripUpdateRaw[]> {
    // Add cache busting query parameter to prevent Cloudflare from caching
    const cacheBustingUrl = `${this.env.GTFS_REALTIME_URL}?t=${Date.now()}`;
    console.log(`[RealtimeCache] Fetching from: ${cacheBustingUrl}`);
    const response = await fetch(cacheBustingUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch realtime data: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    console.log(`[RealtimeCache] Downloaded ${buffer.byteLength} bytes`);

    // Use ProtobufDecoder to decode the data
    const rawTripUpdates = ProtobufDecoder.decodeTripUpdates(buffer);
    console.log(`[RealtimeCache] Decoded ${rawTripUpdates.length} trip updates`);

    // Debug: Log first 10 trip IDs
    console.log('[RealtimeCache] First 10 trip IDs:', rawTripUpdates.slice(0, 10).map(t => t.tripId));

    // Convert to TripUpdateEntity format
    return rawTripUpdates.map((raw) => ({
      tripId: raw.tripId,
      stopTimeUpdates: raw.stopTimeUpdates,
    }));
  }
}
