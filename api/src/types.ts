export interface Env {
  DB: D1Database;
  GTFS_CACHE: KVNamespace;
  GTFS_STATIC_URL: string;
  GTFS_REALTIME_URL: string;
  REALTIME_UPDATE_INTERVAL?: string;
  REALTIME_CACHE: DurableObjectNamespace;
  ANALYTICS: AnalyticsEngineDataset;
  DEBUG_MODE?: string;
}

export interface StopTimeRow {
  tripId: string;
  arrivalTime: string;
  departureTime: string;
  stopId: string;
  stopSequence: number;
}

export interface TripRow {
  tripId: string;
  routeId: string;
  serviceId: string;
  tripHeadsign?: string;
  directionId?: number;
}

export interface RouteRow {
  routeId: string;
  routeShortName: string;
}

export interface RouteJpRow {
  routeId: string;
  destinationStop?: string;
}

export interface CalendarRow {
  serviceId: string;
  startDate: string;
  endDate: string;
  weekdays: boolean[];
}

export interface StaticData {
  generatedAt: number;
  maxEndDate: string;
  stopNames: Record<string, string>;
  stopTimesByTrip: Record<string, StopTimeRow[]>;
  trips: Record<string, TripRow>;
  routes: Record<string, RouteRow & RouteJpRow>;
  calendar: Record<string, CalendarRow>;
}

export interface NextBusResponseItem {
  trip_id: string;
  trip_short_id: string;
  arrival_time: string;
  remaining_time: string;
  delay: string;
  trip_dest: string;
}

export interface RealtimeDelayResult {
  delaySeconds?: number;
  timestampSeconds?: number;
}

export interface TripUpdateEntity {
  tripId: string;
  stopTimeUpdates: {
    stopSequence?: number;
    stopId?: string;
    arrivalDelay?: number;
    arrivalTime?: number;
    departureDelay?: number;
    departureTime?: number;
  }[];
}

export interface CachedRealtimeData {
  fetchedAt: number;
  tripUpdates: TripUpdateEntity[];
}
