import Pbf from 'pbf';
import { Env, RealtimeDelayResult } from './types';

interface TripUpdateEntity {
  tripId?: string;
  stopTimeUpdates: {
    stopSequence?: number;
    stopId?: string;
    arrivalDelay?: number;
    arrivalTime?: number;
    departureDelay?: number;
    departureTime?: number;
  }[];
}

interface CachedRealtimeData {
  fetchedAt: number;
  tripUpdates: TripUpdateEntity[];
}

let realtimeCache: CachedRealtimeData | null = null;

function readStopTimeUpdate(tag: number, obj: any, pbf: Pbf) {
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

function readTripDescriptor(tag: number, obj: any, pbf: Pbf) {
  if (tag === 1) obj.tripId = pbf.readString();
  else pbf.skip(tag & 0x7);
}

function readTripUpdate(tag: number, obj: any, pbf: Pbf) {
  if (tag === 1) {
    obj.trip = pbf.readMessage(readTripDescriptor, {});
  } else if (tag === 2) {
    if (!obj.stopTimeUpdates) obj.stopTimeUpdates = [];
    obj.stopTimeUpdates.push(pbf.readMessage(readStopTimeUpdate, {}));
  } else {
    pbf.skip(tag & 0x7);
  }
}

function readFeedEntity(tag: number, obj: any, pbf: Pbf) {
  if (tag === 1) obj.id = pbf.readString();
  else if (tag === 3) obj.tripUpdate = pbf.readMessage(readTripUpdate, {});
  else pbf.skip(tag & 0x7);
}

function readFeedMessage(tag: number, obj: any, pbf: Pbf) {
  if (tag === 2) {
    if (!obj.entities) obj.entities = [];
    obj.entities.push(pbf.readMessage(readFeedEntity, {}));
  } else {
    pbf.skip(tag & 0x7);
  }
}

function decodeTripUpdates(buffer: ArrayBuffer): TripUpdateEntity[] {
  const pbf = new Pbf(new Uint8Array(buffer));
  const message: any = pbf.readMessage(readFeedMessage, {});

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

async function fetchRealtimeTripUpdates(env: Env): Promise<TripUpdateEntity[]> {
  const response = await fetch(`${env.GTFS_REALTIME_URL}/trip_updates.bin`);
  if (!response.ok) {
    throw new Error(`Failed to fetch realtime data: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  return decodeTripUpdates(buffer);
}

function getCacheTtl(env: Env): number {
  const override = env.REALTIME_UPDATE_INTERVAL;
  if (!override) return 15_000;
  const parsed = Number.parseInt(override, 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed * 1000;
  }
  return 15_000;
}

async function getRealtimeData(env: Env): Promise<CachedRealtimeData> {
  const ttl = getCacheTtl(env);
  if (realtimeCache && Date.now() - realtimeCache.fetchedAt < ttl) {
    return realtimeCache;
  }
  const updates = await fetchRealtimeTripUpdates(env);
  realtimeCache = {
    fetchedAt: Date.now(),
    tripUpdates: updates,
  };
  return realtimeCache;
}

export async function getRealtimeDelay(
  env: Env,
  tripId: string,
  stopSequence?: number,
): Promise<RealtimeDelayResult> {
  try {
    const data = await getRealtimeData(env);
    const trip = data.tripUpdates.find((entry) => entry.tripId === tripId);
    if (!trip) {
      return {};
    }

    let candidate = trip.stopTimeUpdates.find(
      (update) =>
        typeof stopSequence === 'number' &&
        update.stopSequence !== undefined &&
        update.stopSequence === stopSequence,
    );

    if (!candidate && typeof stopSequence === 'number') {
      candidate = trip.stopTimeUpdates.find(
        (update) =>
          update.stopSequence !== undefined &&
          update.stopSequence > stopSequence,
      );
    }

    if (!candidate) {
      candidate = trip.stopTimeUpdates.find(
        (update) =>
          update.departureDelay !== undefined || update.arrivalDelay !== undefined,
      );
    }

    if (!candidate) {
      return {};
    }

    const delaySeconds =
      candidate.departureDelay ?? candidate.arrivalDelay ?? undefined;
    const timestampSeconds =
      candidate.departureTime ?? candidate.arrivalTime ?? undefined;

    if (delaySeconds === undefined && timestampSeconds === undefined) {
      return {};
    }

    return {
      delaySeconds,
      timestampSeconds,
    };
  } catch (error) {
    console.error('Failed to obtain realtime delay', error);
    return {};
  }
}

export function resetRealtimeCache(): void {
  realtimeCache = null;
}
