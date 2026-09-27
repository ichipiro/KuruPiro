import { transit_realtime } from "./gen/gtfs-realtime";
import type { Env, StopTimeUpdate, TripUpdate, UnixTimeSec, DurationSec } from "./types";

const CACHE_TTL_MS = 15_000;

let cachedTrips: { data: TripUpdate[]; expiresAt: number } | null = null;

function normalizeStopId(stopId: string): string {
  return stopId.replace(/ /g, "_");
}

function toStopTimeUpdate(
  stu: transit_realtime.TripUpdate.StopTimeUpdate.$Properties,
): StopTimeUpdate {
  const rawDelay = stu.departure?.delay ?? stu.arrival?.delay;
  return {
    stopId: normalizeStopId(stu.stopId ?? ""),
    stopSequence: stu.stopSequence ?? undefined,
    arrivalTime:
      stu.arrival?.time != null ? (Number(stu.arrival.time) as UnixTimeSec) : undefined,
    departureTime:
      stu.departure?.time != null ? (Number(stu.departure.time) as UnixTimeSec) : undefined,
    delay: rawDelay != null ? (rawDelay as DurationSec) : undefined,
  };
}

async function fetchAndDecode(url: string): Promise<TripUpdate[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GTFS-RT fetch failed: HTTP ${res.status}`);
  const feed = transit_realtime.FeedMessage.decode(
    new Uint8Array(await res.arrayBuffer()),
  );
  return feed.entity
    .filter((e) => e.tripUpdate?.trip?.tripId && e.tripUpdate.stopTimeUpdate)
    .map((e) => ({
      tripId: e.tripUpdate!.trip!.tripId!,
      routeId: e.tripUpdate!.trip!.routeId ?? undefined,
      stopTimeUpdates: e.tripUpdate!.stopTimeUpdate!.map(toStopTimeUpdate),
    }));
}

export async function getAllTrips(
  env: Env,
): Promise<TripUpdate[] | null> {
  return getCachedTrips(env);
}

async function getCachedTrips(
  env: Env,
): Promise<TripUpdate[] | null> {
  if (cachedTrips && cachedTrips.expiresAt > Date.now()) {
    return cachedTrips.data;
  }

  try {
    const trips = await fetchAndDecode(env.GTFS_REALTIME_URL);
    cachedTrips = { data: trips, expiresAt: Date.now() + CACHE_TTL_MS };
    return trips;
  } catch (error) {
    console.error("[realtime] Failed to fetch:", error);
    return null;
  }
}

export function filterByOriginDest(
  trips: TripUpdate[],
  origin: string,
  dest: string | null,
): TripUpdate[] {
  return trips.filter((trip) => {
    const originIdx = trip.stopTimeUpdates.findIndex((s) => s.stopId === origin);
    if (originIdx === -1) return false;
    if (!dest) return true;
    const destIdx = trip.stopTimeUpdates.findIndex((s) => s.stopId === dest);
    return destIdx !== -1 && destIdx > originIdx;
  });
}

export async function getTripsForStop(
  env: Env,
  stopId: string,
  destStopId: string,
): Promise<TripUpdate[] | null> {
  const trips = await getCachedTrips(env);
  if (!trips) return null;

  const origin = normalizeStopId(stopId);
  const dest = destStopId ? normalizeStopId(destStopId) : null;
  return filterByOriginDest(trips, origin, dest);
}
