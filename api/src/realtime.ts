import { transit_realtime } from "./gen/gtfs-realtime";
import type { Env, StopTimeUpdate, TripUpdate, UnixTimeSec, DurationSec } from "./types";

const CACHE_TTL = 15;

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
  ctx?: ExecutionContext,
): Promise<TripUpdate[] | null> {
  return getCachedTrips(env, ctx);
}

async function getCachedTrips(
  env: Env,
  ctx?: ExecutionContext,
): Promise<TripUpdate[] | null> {
  const cache = caches.default;
  const key = new Request(env.GTFS_REALTIME_URL);

  const cached = await cache.match(key);
  if (cached) return cached.json<TripUpdate[]>();

  try {
    const trips = await fetchAndDecode(env.GTFS_REALTIME_URL);
    const put = cache.put(
      key,
      new Response(JSON.stringify(trips), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `public, max-age=${CACHE_TTL}`,
        },
      }),
    );
    ctx ? ctx.waitUntil(put) : await put;
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
  ctx?: ExecutionContext,
): Promise<TripUpdate[] | null> {
  const trips = await getCachedTrips(env, ctx);
  if (!trips) return null;

  const origin = normalizeStopId(stopId);
  const dest = destStopId ? normalizeStopId(destStopId) : null;
  return filterByOriginDest(trips, origin, dest);
}
