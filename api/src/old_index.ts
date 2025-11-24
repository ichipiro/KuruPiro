import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { findTripsForStops, lookupStopName } from './staticData';
import { getRealtimeDelay } from './realtime';
import { Env, NextBusResponseItem } from './types';

/**
 * Get current time in JST (UTC+9)
 * Returns a Date object representing the current time in JST timezone
 */
function getJSTNow(): Date {
  const now = new Date();
  // Convert to JST by getting UTC time and adding 9 hours
  const jstTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  return jstTime;
}

function formatRemainingTime(minutes: number): string {
  if (minutes <= 0 || minutes > 1440) {
    // 0 minutes or more than 24 hours (likely calculation error)
    return 'まもなく到着';
  }
  if (minutes === 1) {
    return 'まもなく到着';
  }
  return `あと${minutes}分`;
}

function formatDelay(delayMinutes: number): string {
  if (delayMinutes <= 0) {
    return '';
  }
  return `${delayMinutes}分遅れ`;
}

function calculateRemainingMinutes(targetTime: string, delaySeconds = 0): number {
  const now = getJSTNow();
  const [hour, minute, second] = targetTime.split(':').map((part) => Number.parseInt(part, 10));

  // Handle GTFS times that can exceed 24:00 (e.g., 24:30, 25:15 for late night buses)
  const actualHour = hour >= 24 ? hour - 24 : hour;
  const daysToAdd = Math.floor(hour / 24);

  const target = new Date(now);
  target.setHours(actualHour, minute, second || 0, 0);

  // If days need to be added (for times like 24:00, 25:00)
  if (daysToAdd > 0) {
    target.setDate(target.getDate() + daysToAdd);
  }

  // If target time is in the past, assume it's for tomorrow
  if (target.getTime() < now.getTime() && daysToAdd === 0) {
    target.setDate(target.getDate() + 1);
  }

  const diff = target.getTime() + (delaySeconds || 0) * 1000 - now.getTime();
  return Math.max(0, Math.floor(diff / 60000));
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors());

// Health check endpoint
app.get('/', (c) => {
  return c.json({ status: 'healthy' });
});

// Get next buses for a stop
app.get('/api/:stop_id/:dest_stop_id', async (c) => {
  const originId = c.req.param('stop_id');
  const destinationId = c.req.param('dest_stop_id');
  const responseSize = Number.parseInt(c.req.query('response_size') ?? '5', 10);

  const jstNow = getJSTNow();
  const jsDay = jstNow.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const weekday = (jsDay + 6) % 7; // Convert to 0=Monday, 1=Tuesday, ..., 6=Sunday

  // Format current time as HH:MM:SS for SQL comparison
  const currentTimeStr = `${String(jstNow.getHours()).padStart(2, '0')}:${String(jstNow.getMinutes()).padStart(2, '0')}:00`;

  const trips = await findTripsForStops(c.env, originId, destinationId, weekday, currentTimeStr);
  const limitedTrips = trips.slice(0, Math.max(1, Math.min(20, responseSize)));

  const items: NextBusResponseItem[] = [];
  for (const trip of limitedTrips) {
    const realtime = await getRealtimeDelay(c.env, trip.tripId, trip.stopSequence);
    const delayMinutes = realtime.delaySeconds
      ? Math.ceil(realtime.delaySeconds / 60)
      : 0;
    const remainingMinutes = calculateRemainingMinutes(
      trip.arrivalTime,
      realtime.delaySeconds,
    );
    items.push({
      trip_id: trip.tripId,
      trip_short_id: trip.routeShortName,
      arrival_time: trip.arrivalTime.slice(0, 5),
      remaining_time: formatRemainingTime(remainingMinutes),
      delay: formatDelay(delayMinutes),
      trip_dest: trip.destinationLabel,
    });
  }

  return c.json(items);
});

// Get stop name by ID
app.get('/api/stop/:stop_id/name', async (c) => {
  const stopId = c.req.param('stop_id');
  const name = await lookupStopName(c.env, stopId);
  return c.json({ stop_id: stopId, name });
});

// Error handling
app.onError((err, c) => {
  console.error('Worker error', err);
  return c.json({ error: err.message || 'Internal Server Error' }, 500);
});

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, _env: Env, _ctx: ExecutionContext): Promise<void> {
    // No-op: D1 data is refreshed by GitHub Actions
    // This cron job is no longer needed but kept for compatibility
  },
};
