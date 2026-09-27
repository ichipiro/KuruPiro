import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./types";
import { getAllTrips, getTripsForStop } from "./realtime";
import { registerTripRoutes } from "./trips";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({ origin: "*", maxAge: 7200 }));

app.get("/", (c) => c.json({ status: "healthy" }));

app.get("/api/trip_update/gtfs-realtime.json", async (c) => {
  const trips = await getAllTrips(c.env);
  if (!trips) return c.json({ error: "No data available" }, 503);
  return c.json(trips);
});

app.get("/api/trip_update/:stop_id/gtfs-realtime.json", async (c) => {
  const { stop_id } = c.req.param();
  const trips = await getTripsForStop(c.env, stop_id, "");
  if (!trips) return c.json({ error: "No data available" }, 503);
  return c.json(trips);
});

app.get(
  "/api/trip_update/:stop_id/:dest_stop_id/gtfs-realtime.json",
  async (c) => {
    const cache = caches.default;

    const cacheKey = new Request(c.req.url, { method: "GET" });

    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const { stop_id, dest_stop_id } = c.req.param();
    const trips = await getTripsForStop(c.env, stop_id, dest_stop_id);
    if (!trips) {
      return c.json({ error: "No data available" }, 503);
    }
    const response = c.json(trips, 200, {
      "Cache-Control": "public, max-age=15",
    });
    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  },
);

// 静的時刻表プロキシ (R2 → クライアント)
app.get("/timetable/v1/:origin/:dest/:date", async (c) => {
  const { origin, dest, date } = c.req.param();
  const obj = await c.env.TIMETABLE_BUCKET.get(
    `timetable/v1/${origin}/${dest}/${date}.json`,
  );
  if (!obj) return c.json({ error: "Not found" }, 404);
  return new Response(obj.body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
});

registerTripRoutes(app);

app.onError((err, c) => {
  console.error("Worker error", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
