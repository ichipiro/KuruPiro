export interface Env {
  GTFS_REALTIME_URL: string;
  TIMETABLE_BUCKET: R2Bucket;
}

type Brand<T, B extends string> = T & { readonly __brand: B };
export type UnixTimeSec = Brand<number, "UnixTimeSec">;
export type DurationSec = Brand<number, "DurationSec">;

// 正規化済みのTripUpdate
// docs/gtfs-quirks.md を参照
export interface StopTimeUpdate {
  stopId: string;
  stopSequence?: number;
  arrivalTime?: UnixTimeSec;
  departureTime?: UnixTimeSec;
  delay?: DurationSec;
}

export interface TripUpdate {
  tripId: string;
  routeId?: string;
  stopTimeUpdates: StopTimeUpdate[];
}
