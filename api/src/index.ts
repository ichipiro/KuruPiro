import { findTripsForStops, lookupStopName } from './staticData';
import { getRealtimeDelay } from './realtime';
import { Env, NextBusResponseItem } from './types';

/**
 * Get current time in JST (UTC+9)
 */
function getJSTNow(): Date {
  const now = new Date();
  const utcTime = now.getTime();
  const jstOffset = 9 * 60 * 60 * 1000; // 9 hours in milliseconds
  return new Date(utcTime + jstOffset);
}

function formatRemainingTime(minutes: number): string {
  if (minutes <= 1) {
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
  const target = new Date(now);
  target.setUTCHours(hour, minute, second, 0);
  const diff = target.getTime() + delaySeconds * 1000 - now.getTime();
  return Math.max(0, Math.floor(diff / 60000));
}

async function handleNextBus(
  request: Request,
  env: Env,
  params: Record<string, string>,
): Promise<Response> {
  const originId = params.stop_id;
  const destinationId = params.dest_stop_id;
  const url = new URL(request.url);
  const responseSize = Number.parseInt(url.searchParams.get('response_size') ?? '5', 10);

  const jstNow = getJSTNow();
  const jsDay = jstNow.getUTCDay();
  const weekday = (jsDay + 6) % 7;

  const trips = await findTripsForStops(env, originId, destinationId, weekday);
  const limitedTrips = trips.slice(0, Math.max(1, Math.min(20, responseSize)));

  const items: NextBusResponseItem[] = [];
  for (const trip of limitedTrips) {
    const realtime = await getRealtimeDelay(env, trip.tripId, trip.stopSequence);
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

  return Response.json(items, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

async function handleStopName(env: Env, params: Record<string, string>): Promise<Response> {
  const stopId = params.stop_id;
  const name = await lookupStopName(env, stopId);
  return Response.json({ stop_id: stopId, name }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

async function handleHealth(): Promise<Response> {
  return Response.json({ status: 'healthy' }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function matchRoute(pathname: string): { handler: string; params: Record<string, string> } | null {
  const nextBusMatch = pathname.match(/^\/api\/([^\/]+)\/([^\/]+)/);
  if (nextBusMatch) {
    return {
      handler: 'nextBus',
      params: { stop_id: decodeURIComponent(nextBusMatch[1]), dest_stop_id: decodeURIComponent(nextBusMatch[2]) },
    };
  }
  const stopNameMatch = pathname.match(/^\/api\/stop\/([^\/]+)\/name/);
  if (stopNameMatch) {
    return {
      handler: 'stopName',
      params: { stop_id: decodeURIComponent(stopNameMatch[1]) },
    };
  }
  if (pathname === '/' || pathname === '') {
    return {
      handler: 'health',
      params: {},
    };
  }
  return null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      const url = new URL(request.url);
      const match = matchRoute(url.pathname);
      if (!match) {
        return new Response('Not Found', { status: 404 });
      }

      switch (match.handler) {
        case 'nextBus':
          return await handleNextBus(request, env, match.params);
        case 'stopName':
          return await handleStopName(env, match.params);
        case 'health':
          return await handleHealth();
        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('Worker error', error);
      const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
      return Response.json({ error: errorMessage }, {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },

  async scheduled(_event: ScheduledEvent, _env: Env, _ctx: ExecutionContext): Promise<void> {
    // No-op: D1 data is refreshed by GitHub Actions
    // This cron job is no longer needed but kept for compatibility
  },
};
