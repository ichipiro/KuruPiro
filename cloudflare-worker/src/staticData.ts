import { unzipSync, strFromU8 } from 'fflate';
import {
  CalendarRow,
  Env,
  RouteJpRow,
  RouteRow,
  StaticData,
  StopTimeRow,
  TripRow,
} from './types';

const WEEKDAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

let inMemoryCache: StaticData | null = null;

interface CachedStaticData {
  version: number;
  data: StaticData;
}

const CACHE_KEY = 'gtfs:static';
const CACHE_VERSION = 1;

function parseCSV(content: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  if (lines.length === 0) {
    return rows;
  }
  const header = splitCsvLine(lines[0]);
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cols = splitCsvLine(line);
    const row: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = cols[j] ?? '';
    }
    rows.push(row);
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === ',') {
        result.push(current);
        current = '';
      } else if (char === '"') {
        inQuotes = true;
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

function shouldRefresh(data: StaticData | null): boolean {
  if (!data) return true;
  const today = new Date();
  const yyyymmdd =
    today.getFullYear().toString() +
    `${today.getMonth() + 1}`.padStart(2, '0') +
    `${today.getDate()}`.padStart(2, '0');
  if (data.maxEndDate < yyyymmdd) {
    return true;
  }
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  return Date.now() - data.generatedAt > SIX_HOURS;
}

async function loadFromKv(env: Env): Promise<StaticData | null> {
  const stored = await env.GTFS_CACHE.get(CACHE_KEY, 'json');
  if (!stored) return null;
  const parsed = stored as CachedStaticData;
  if (!parsed || parsed.version !== CACHE_VERSION) {
    return null;
  }
  return parsed.data;
}

async function saveToKv(env: Env, data: StaticData): Promise<void> {
  const payload: CachedStaticData = {
    version: CACHE_VERSION,
    data,
  };
  await env.GTFS_CACHE.put(CACHE_KEY, JSON.stringify(payload));
}

function toInt(value: string | undefined, fallback = 0): number {
  if (!value) return fallback;
  const num = Number.parseInt(value, 10);
  return Number.isNaN(num) ? fallback : num;
}

function normalizeStopId(stopId: string): string {
  return stopId.replace(/ /g, '_');
}

function buildStaticData(files: Record<string, Uint8Array>): StaticData {
  const text = (filename: string) => {
    const file = files[filename];
    if (!file) {
      throw new Error(`GTFS file missing: ${filename}`);
    }
    return strFromU8(file);
  };

  const stopTimesRows = parseCSV(text('stop_times.txt'));
  const tripsRows = parseCSV(text('trips.txt'));
  const calendarRows = parseCSV(text('calendar.txt'));
  const routesRows = parseCSV(text('routes.txt'));
  const routesJpRows = parseCSV(text('routes_jp.txt'));
  const stopsRows = parseCSV(text('stops.txt'));

  const stopTimesByTrip: Record<string, StopTimeRow[]> = {};
  for (const row of stopTimesRows) {
    const tripId = row['trip_id'];
    if (!tripId) continue;
    const bucket = stopTimesByTrip[tripId] ?? (stopTimesByTrip[tripId] = []);
    bucket.push({
      tripId,
      arrivalTime: row['arrival_time'] ?? '00:00:00',
      departureTime: row['departure_time'] ?? row['arrival_time'] ?? '00:00:00',
      stopId: normalizeStopId(row['stop_id'] ?? ''),
      stopSequence: toInt(row['stop_sequence']),
    });
  }
  for (const stops of Object.values(stopTimesByTrip)) {
    stops.sort((a, b) => a.stopSequence - b.stopSequence);
  }

  const trips: Record<string, TripRow> = {};
  for (const row of tripsRows) {
    const tripId = row['trip_id'];
    if (!tripId) continue;
    trips[tripId] = {
      tripId,
      routeId: row['route_id'] ?? '',
      serviceId: row['service_id'] ?? '',
      tripHeadsign: row['trip_headsign'] ?? undefined,
      directionId: row['direction_id'] ? toInt(row['direction_id']) : undefined,
    };
  }

  const routes: Record<string, RouteRow & RouteJpRow> = {};
  for (const row of routesRows) {
    const routeId = row['route_id'];
    if (!routeId) continue;
    routes[routeId] = {
      routeId,
      routeShortName: row['route_short_name'] ?? '',
      destinationStop: undefined,
    };
  }
  for (const row of routesJpRows) {
    const routeId = row['route_id'];
    if (!routeId) continue;
    const entry = routes[routeId] ?? {
      routeId,
      routeShortName: '',
      destinationStop: undefined,
    };
    entry.destinationStop = row['destination_stop'] ?? entry.destinationStop;
    routes[routeId] = entry;
  }

  const calendar: Record<string, CalendarRow> = {};
  let maxEndDate = '00000000';
  for (const row of calendarRows) {
    const serviceId = row['service_id'];
    if (!serviceId) continue;
    const weekdays = WEEKDAY_KEYS.map((key) => row[key] === '1');
    const entry: CalendarRow = {
      serviceId,
      startDate: row['start_date'] ?? '00000000',
      endDate: row['end_date'] ?? '00000000',
      weekdays,
    };
    calendar[serviceId] = entry;
    if (entry.endDate > maxEndDate) {
      maxEndDate = entry.endDate;
    }
  }

  const stopNames: Record<string, string> = {};
  for (const row of stopsRows) {
    const stopId = row['stop_id'];
    if (!stopId) continue;
    stopNames[normalizeStopId(stopId)] = row['stop_name'] ?? '';
  }

  return {
    generatedAt: Date.now(),
    maxEndDate,
    stopNames,
    stopTimesByTrip,
    trips,
    routes,
    calendar,
  };
}

async function downloadAndBuild(env: Env): Promise<StaticData> {
  const response = await fetch(env.GTFS_STATIC_URL);
  if (!response.ok) {
    throw new Error(`Failed to download GTFS static data: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();

  // Clear array buffer reference after use to help GC
  const files = unzipSync(new Uint8Array(arrayBuffer));

  // Build data and immediately clear files reference
  const data = buildStaticData(files);

  return data;
}

export async function getStaticData(env: Env, forceRefresh = false): Promise<StaticData> {
  // Always try to use cached data first (memory or KV)
  if (!forceRefresh && inMemoryCache && !shouldRefresh(inMemoryCache)) {
    return inMemoryCache;
  }

  // Load from KV (data is pre-processed by GitHub Actions)
  const data = await loadFromKv(env);
  if (data) {
    inMemoryCache = data;
    return data;
  }

  // If no data in KV, throw error
  // Data should be uploaded via GitHub Actions workflow
  throw new Error(
    'GTFS data not found in cache. Please run the GitHub Actions workflow to initialize the cache.'
  );
}

export async function refreshStaticData(env: Env): Promise<void> {
  // This function is now deprecated - data is updated via GitHub Actions
  // Just reload from KV
  const data = await loadFromKv(env);
  if (data) {
    inMemoryCache = data;
  }
}

export function lookupStopName(data: StaticData, stopId: string): string {
  const normalized = normalizeStopId(stopId);
  return data.stopNames[normalized] ?? '';
}

export function findTripsForStops(
  data: StaticData,
  originStopId: string,
  destinationPattern: string,
  weekday: number,
) {
  const normalizedOrigin = normalizeStopId(originStopId);
  const normalizedDestination = normalizeStopId(destinationPattern);
  const results: {
    tripId: string;
    arrivalTime: string;
    stopSequence: number;
    routeShortName: string;
    destinationStopId: string;
    destinationLabel: string;
    serviceId: string;
  }[] = [];

  const destinationIsPrefix = normalizedDestination.endsWith('_');
  const destinationPrefix = destinationIsPrefix
    ? normalizedDestination.slice(0, -1)
    : normalizedDestination;

  for (const [tripId, stops] of Object.entries(data.stopTimesByTrip)) {
    const tripMeta = data.trips[tripId];
    if (!tripMeta) continue;
    const calendar = data.calendar[tripMeta.serviceId];
    if (!calendar) continue;
    if (!calendar.weekdays[weekday]) continue;

    let originStop: StopTimeRow | undefined;
    let destinationStop: StopTimeRow | undefined;

    for (const stop of stops) {
      if (!originStop && stop.stopId === normalizedOrigin) {
        originStop = stop;
        continue;
      }
      if (!originStop) {
        continue;
      }
      if (destinationIsPrefix) {
        if (stop.stopId.startsWith(destinationPrefix)) {
          destinationStop = stop;
          break;
        }
      } else if (stop.stopId === destinationPrefix) {
        destinationStop = stop;
        break;
      }
    }

    if (!originStop || !destinationStop) {
      continue;
    }

    if (originStop.stopSequence >= destinationStop.stopSequence) {
      continue;
    }

    const route = data.routes[tripMeta.routeId];
    results.push({
      tripId,
      arrivalTime: originStop.arrivalTime,
      stopSequence: originStop.stopSequence,
      routeShortName: route?.routeShortName ?? '',
      destinationStopId: destinationStop.stopId,
      destinationLabel: route?.destinationStop ?? destinationStop.stopId,
      serviceId: tripMeta.serviceId,
    });
  }

  results.sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
  return results;
}
