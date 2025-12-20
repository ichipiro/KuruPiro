import Pbf from 'pbf';
import { Env, TripUpdateEntity, CachedRealtimeData } from './types';

/**
 * Durable Object that periodically polls GTFS Realtime API
 * and caches the trip updates data
 */
export class RealtimeCache implements DurableObject {
  private state: DurableObjectState;
  private env: Env;
  private updateInterval: number;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;

    // Get update interval from env, default to 15 seconds
    const intervalStr = env.REALTIME_UPDATE_INTERVAL;
    this.updateInterval = intervalStr ? parseInt(intervalStr, 10) * 1000 : 15_000;
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
    await this.state.storage.setAlarm(Date.now() + this.updateInterval);
  }

  /**
   * Get cached realtime data from storage
   */
  private async getCachedData(): Promise<CachedRealtimeData | null> {
    // If no cached data exists, trigger initial update
    const cachedData = await this.state.storage.get<CachedRealtimeData>('realtimeData');

    if (!cachedData) {
      await this.updateRealtimeData();
      // Schedule first alarm
      const currentAlarm = await this.state.storage.getAlarm();
      if (currentAlarm === null) {
        await this.state.storage.setAlarm(Date.now() + this.updateInterval);
      }
      return (await this.state.storage.get<CachedRealtimeData>('realtimeData')) ?? null;
    }

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
    const response = await fetch(`${this.env.GTFS_REALTIME_URL}/trip_updates.bin`);
    if (!response.ok) {
      throw new Error(`Failed to fetch realtime data: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    return this.decodeTripUpdates(buffer);
  }

  /**
   * Decode GTFS Realtime protobuf data
   */
  private decodeTripUpdates(buffer: ArrayBuffer): TripUpdateEntity[] {
    const pbf = new Pbf(new Uint8Array(buffer));
    const message: any = pbf.readMessage(this.readFeedMessage, {});

    const tripUpdates: TripUpdateEntity[] = [];
    for (const entity of message.entities || []) {
      if (!entity.tripUpdate?.trip?.tripId) continue;

      tripUpdates.push({
        tripId: entity.tripUpdate.trip.tripId,
        stopTimeUpdates: entity.tripUpdate.stopTimeUpdates || [],
      });
    }
    return tripUpdates;
  }

  // Protobuf reading functions
  private readStopTimeUpdate(tag: number, obj: any, pbf: Pbf) {
    if (tag === 1) obj.stopSequence = pbf.readVarint();
    else if (tag === 4) obj.stopId = pbf.readString();
    else if (tag === 2) {
      // arrival
      pbf.readMessage((tag2, obj2) => {
        if (tag2 === 1) obj.arrivalDelay = pbf.readSVarint();
        else if (tag2 === 2) obj.arrivalTime = pbf.readVarint();
        else pbf.skip(tag2 & 0x7);
      }, obj);
    } else if (tag === 3) {
      // departure
      pbf.readMessage((tag2, obj2) => {
        if (tag2 === 1) obj.departureDelay = pbf.readSVarint();
        else if (tag2 === 2) obj.departureTime = pbf.readVarint();
        else pbf.skip(tag2 & 0x7);
      }, obj);
    } else {
      pbf.skip(tag & 0x7);
    }
  }

  private readTripDescriptor(tag: number, obj: any, pbf: Pbf) {
    if (tag === 1) obj.tripId = pbf.readString();
    else pbf.skip(tag & 0x7);
  }

  private readTripUpdate(tag: number, obj: any, pbf: Pbf) {
    if (tag === 1) {
      obj.trip = pbf.readMessage(this.readTripDescriptor, {});
    } else if (tag === 2) {
      if (!obj.stopTimeUpdates) obj.stopTimeUpdates = [];
      obj.stopTimeUpdates.push(pbf.readMessage(this.readStopTimeUpdate, {}));
    } else {
      pbf.skip(tag & 0x7);
    }
  }

  private readFeedEntity(tag: number, obj: any, pbf: Pbf) {
    if (tag === 1) obj.id = pbf.readString();
    else if (tag === 3) obj.tripUpdate = pbf.readMessage(this.readTripUpdate, {});
    else pbf.skip(tag & 0x7);
  }

  private readFeedMessage(tag: number, obj: any, pbf: Pbf) {
    if (tag === 2) {
      if (!obj.entities) obj.entities = [];
      obj.entities.push(pbf.readMessage(this.readFeedEntity, {}));
    } else {
      pbf.skip(tag & 0x7);
    }
  }
}
