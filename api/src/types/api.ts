export interface GetTripsQuery {
  from: string;
  via: string;
  stops?: string;
  limit?: string;
}

export interface StopInfo {
  stopId: string;
  stopName: string;
}

export interface TripInfo {
  tripId: string;
  routeShortName: string;
  tripHeadsign: string;
  arrivalTime: string;
  remainingSeconds: number;
  delaySeconds: number | null;
  specificStops: StopInfo[];
}

export interface GetTripsResponse {
  trips: TripInfo[];
  count: number;
  asOf: string;
}
