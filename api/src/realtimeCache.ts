import { Env, TripUpdateEntity, CachedRealtimeData } from './types';
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
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });
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
  private async fetchRealtimeTripUpdates(): Promise<TripUpdateEntity[]> {
    // Add cache busting query parameter to prevent Cloudflare from caching
    const cacheBustingUrl = `${this.env.GTFS_REALTIME_URL}?t=${Date.now()}`;
    console.log(`[RealtimeCache] Fetching from: ${cacheBustingUrl}`);
    const response = await fetch(cacheBustingUrl, {
      // Explicitly disable caching
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch realtime data: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    console.log(`[RealtimeCache] Downloaded ${buffer.byteLength} bytes`);

    // Use ProtobufDecoder to decode the data
    const rawTripUpdates = ProtobufDecoder.decodeTripUpdates(buffer);
    console.log(`[RealtimeCache] Decoded ${rawTripUpdates.length} trip updates`);

    // Convert to TripUpdateEntity format
    return rawTripUpdates.map((raw) => ({
      tripId: raw.tripId,
      stopTimeUpdates: raw.stopTimeUpdates,
    }));
  }
}
