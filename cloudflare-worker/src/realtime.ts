import { Root } from 'protobufjs/light';
import descriptor from './gtfsRealtimeDescriptor';
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

const root = Root.fromJSON(descriptor);
const FeedMessage = root.lookupType('transit_realtime.FeedMessage');

let realtimeCache: CachedRealtimeData | null = null;

function decodeTripUpdates(buffer: ArrayBuffer): TripUpdateEntity[] {
  const message = FeedMessage.decode(new Uint8Array(buffer));
  const object = FeedMessage.toObject(message, {
    defaults: false,
    arrays: true,
    longs: Number,
    enums: String,
  }) as any;
  const entities = Array.isArray(object.entity) ? object.entity : [];

  const tripUpdates: TripUpdateEntity[] = [];
  for (const entity of entities) {
    if (!entity.trip_update || !entity.trip_update.trip) continue;
    const tripId: string | undefined = entity.trip_update.trip.trip_id;
    if (!tripId) continue;
    const updatesRaw = Array.isArray(entity.trip_update.stop_time_update)
      ? entity.trip_update.stop_time_update
      : [];
    const updates = updatesRaw.map((update: any) => ({
      stopSequence: update.stop_sequence as number | undefined,
      stopId: update.stop_id as string | undefined,
      arrivalDelay: update.arrival?.delay as number | undefined,
      arrivalTime: update.arrival?.time as number | undefined,
      departureDelay: update.departure?.delay as number | undefined,
      departureTime: update.departure?.time as number | undefined,
    }));
    tripUpdates.push({
      tripId,
      stopTimeUpdates: updates,
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
