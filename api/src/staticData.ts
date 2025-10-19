import { Env } from './types';

function normalizeStopId(stopId: string): string {
  return stopId.replace(/ /g, '_');
}

export async function lookupStopName(env: Env, stopId: string): Promise<string> {
  const normalized = normalizeStopId(stopId);
  const result = await env.DB.prepare(
    'SELECT stop_name FROM gtfs_stops WHERE stop_id = ?'
  )
    .bind(normalized)
    .first<{ stop_name: string }>();

  return result?.stop_name ?? '';
}

export async function findTripsForStops(
  env: Env,
  originStopId: string,
  destinationPattern: string,
  weekday: number,
) {
  const normalizedOrigin = normalizeStopId(originStopId);
  const normalizedDestination = normalizeStopId(destinationPattern);

  // weekday: 0=Monday, 1=Tuesday, ..., 6=Sunday
  const weekdayColumns = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const weekdayColumn = weekdayColumns[weekday];

  const destinationIsPrefix = normalizedDestination.endsWith('_');
  const destinationPrefix = destinationIsPrefix
    ? normalizedDestination.slice(0, -1)
    : normalizedDestination;

  // Query to find trips that stop at both origin and destination
  // Uses CTEs for clarity and performance
  const query = `
    WITH origin_stops AS (
      SELECT trip_id, stop_sequence, arrival_time
      FROM gtfs_stop_times
      WHERE stop_id = ?1
    ),
    dest_stops AS (
      SELECT trip_id, stop_sequence, stop_id
      FROM gtfs_stop_times
      WHERE ${destinationIsPrefix ? 'stop_id LIKE ?2' : 'stop_id = ?2'}
    )
    SELECT
      o.trip_id,
      o.arrival_time,
      o.stop_sequence,
      r.route_short_name,
      d.stop_id as destination_stop_id,
      COALESCE(r.destination_stop, d.stop_id) as destination_label,
      t.service_id
    FROM origin_stops o
    JOIN dest_stops d ON o.trip_id = d.trip_id AND o.stop_sequence < d.stop_sequence
    JOIN gtfs_trips t ON o.trip_id = t.trip_id
    JOIN gtfs_calendar c ON t.service_id = c.service_id
    JOIN gtfs_routes r ON t.route_id = r.route_id
    WHERE c.${weekdayColumn} = 1
    ORDER BY o.arrival_time
  `;

  const bindValue = destinationIsPrefix ? `${destinationPrefix}%` : destinationPrefix;
  const results = await env.DB.prepare(query)
    .bind(normalizedOrigin, bindValue)
    .all<{
      trip_id: string;
      arrival_time: string;
      stop_sequence: number;
      route_short_name: string;
      destination_stop_id: string;
      destination_label: string;
      service_id: string;
    }>();

  if (!results.success) {
    console.error('D1 query failed:', results);
    return [];
  }

  return results.results.map((row) => ({
    tripId: row.trip_id,
    arrivalTime: row.arrival_time,
    stopSequence: row.stop_sequence,
    routeShortName: row.route_short_name,
    destinationStopId: row.destination_stop_id,
    destinationLabel: row.destination_label,
    serviceId: row.service_id,
  }));
}

// Legacy functions no longer needed with D1
export async function getStaticData() {
  throw new Error('getStaticData is deprecated - use D1 queries directly');
}

export async function refreshStaticData() {
  // No-op: D1 data is refreshed by GitHub Actions
}
