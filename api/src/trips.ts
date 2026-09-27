import type { Hono } from "hono";
import type { Env, StopTimeUpdate } from "./types";
import { getAllTrips } from "./realtime";
import { getTimetable, type TimetableEntry } from "./timetable";

export type BusService = {
  arrival_time: string;
  delay: string;
  trip_dest: string;
  trip_id: string;
  trip_short_id: string;
  remaining_time: string;
  current_location: string | null;
};

type BusServicesByOrigin = Record<string, BusService[]>;

function todayJST(): string {
  const d = new Date(Date.now() + 9 * 3600 * 1000);
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    String(d.getUTCDate()).padStart(2, "0"),
  ].join("");
}

export function formatTime(unixSec: number): string {
  const jst = new Date((unixSec + 9 * 3600) * 1000);
  return `${String(jst.getUTCHours()).padStart(2, "0")}:${String(jst.getUTCMinutes()).padStart(2, "0")}`;
}

export function formatDelay(delaySec: number | undefined): string {
  if (!delaySec) return "";
  const minutes = Math.round(delaySec / 60);
  return minutes > 0 ? `${minutes}分遅れ` : "";
}

export function formatRemaining(unixSec: number, nowSec: number): string {
  const diffSec = unixSec - nowSec;
  if (diffSec <= 0) return "到着済み";
  if (diffSec < 60) return "まもなく到着";
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  return `あと${hours > 0 ? `${hours}時間` : ""}${minutes}分`;
}

export function filterAndFormat(
  staticMap: Map<string, TimetableEntry>,
  rtByTripAndStop: Map<string, StopTimeUpdate>,
  origin: string,
  nowSec: number,
  limit = 5,
): BusService[] {
  const services: BusService[] = [];

  for (const [tripId, entry] of staticMap) {
    const stu = rtByTripAndStop.get(`${tripId}:${origin}`);
    // 0 はprotobufのデフォルト値（無効）なので || で除外
    const rtTime = (stu?.departureTime || stu?.arrivalTime) ?? null;
    const effectiveTime =
      rtTime ?? (stu?.delay != null ? entry.arrivalTime + stu.delay : entry.arrivalTime);

    if (effectiveTime < nowSec) continue;

    services.push({
      trip_id: tripId,
      trip_short_id: entry.routeShortName,
      trip_dest: entry.destinationLabel,
      arrival_time: formatTime(entry.arrivalTime),
      delay: formatDelay(stu?.delay),
      remaining_time: formatRemaining(effectiveTime, nowSec),
      current_location: null,
    });
  }

  services.sort((a, b) => a.arrival_time.localeCompare(b.arrival_time));
  return services.slice(0, limit);
}

async function buildServices(
  env: Env,
  origin: string,
  dest: string,
  rtByTripAndStop: Map<string, StopTimeUpdate>,
): Promise<BusService[]> {
  const staticMap = await getTimetable(env, origin, dest, todayJST());
  return filterAndFormat(staticMap, rtByTripAndStop, origin, Math.floor(Date.now() / 1000));
}

function buildRtMap(trips: Awaited<ReturnType<typeof getAllTrips>>): Map<string, StopTimeUpdate> {
  const map = new Map<string, StopTimeUpdate>();
  if (!trips) return map;
  for (const trip of trips) {
    for (const stu of trip.stopTimeUpdates) {
      map.set(`${trip.tripId}:${stu.stopId}`, stu);
    }
  }
  return map;
}

type BatchQuery = { origin: string; destination: string; limit?: number };

export function registerTripRoutes(app: Hono<{ Bindings: Env }>) {
  // /api/trips/:origin/:dest → BusService[]
  app.get("/api/trips/:origin/:dest", async (c) => {
    const { origin, dest } = c.req.param();
    const trips = await getAllTrips(c.env);
    if (!trips) return c.json({ error: "No data available" }, 503);

    const services = await buildServices(c.env, origin, dest, buildRtMap(trips));
    return c.json(services);
  });

  // POST /api/trips/batch → BusService[][]
  app.post("/api/trips/batch", async (c) => {
    const queries: BatchQuery[] = await c.req.json();

    const trips = await getAllTrips(c.env);
    const rtMap = buildRtMap(trips ?? []);
    const nowSec = Math.floor(Date.now() / 1000);
    const dateStr = todayJST();

    const results = await Promise.all(
      queries.map(async ({ origin, destination, limit = 5 }) => {
        const dests = destination.split(",").map((s) => s.trim()).filter(Boolean);
        const maps = await Promise.all(dests.map((dest) => getTimetable(c.env, origin, dest, dateStr)));
        const merged = new Map<string, TimetableEntry>();
        for (const m of maps) {
          for (const [k, v] of m) merged.set(k, v);
        }
        return filterAndFormat(merged, rtMap, origin, nowSec, limit);
      }),
    );

    return c.json(results);
  });

  // /api/trips?origin=22030_2,24140_1&destination=51240_ → BusServicesByOrigin
  app.get("/api/trips", async (c) => {
    const originParam = c.req.query("origin") ?? "";
    const dest = c.req.query("destination") ?? "";
    const originIds = originParam.split(",").map((s) => s.trim()).filter(Boolean);

    if (originIds.length === 0) {
      return c.json({ error: "origin is required" }, 400);
    }

    const trips = await getAllTrips(c.env);
    if (!trips) return c.json({ error: "No data available" }, 503);

    const rtMap = buildRtMap(trips);
    const entries = await Promise.all(
      originIds.map(async (o) => [o, await buildServices(c.env, o, dest, rtMap)] as const),
    );

    return c.json(Object.fromEntries(entries) as BusServicesByOrigin);
  });
}
