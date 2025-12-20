import { Env, RealtimeDelayResult, CachedRealtimeData } from './types';

/**
 * Get Durable Object instance for realtime cache
 */
function getRealtimeCacheStub(env: Env): DurableObjectStub {
  // Use a fixed ID for the singleton Durable Object
  const id = env.REALTIME_CACHE.idFromName('realtime-cache');
  return env.REALTIME_CACHE.get(id);
}

/**
 * Fetch realtime data from Durable Object cache
 */
async function getRealtimeData(env: Env): Promise<CachedRealtimeData> {
  const stub = getRealtimeCacheStub(env);
  const response = await stub.fetch('https://fake-host/data');

  if (!response.ok) {
    throw new Error(`Failed to fetch from Durable Object: ${response.status}`);
  }

  const data = await response.json<CachedRealtimeData>();
  if (!data) {
    // Return empty data if no cache available yet
    return {
      fetchedAt: Date.now(),
      tripUpdates: [],
    };
  }

  return data;
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

/**
 * Force update realtime cache in Durable Object
 */
export async function forceUpdateRealtimeCache(env: Env): Promise<void> {
  const stub = getRealtimeCacheStub(env);
  await stub.fetch('https://fake-host/update');
}
