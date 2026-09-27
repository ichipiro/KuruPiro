import type { Env } from "./types";

export type TimetableEntry = {
  tripId: string;
  arrivalTime: number;
  routeShortName: string;
  destinationLabel: string;
};

type TimetableFile = {
  trips: TimetableEntry[];
};

export async function getTimetable(
  env: Env,
  origin: string,
  dest: string,
  date: string,
): Promise<Map<string, TimetableEntry>> {
  const key = `timetable/v1/${origin}/${dest}/${date}.json`;
  const obj = await env.TIMETABLE_BUCKET.get(key);
  if (!obj) return new Map();
  const file: TimetableFile = await obj.json();
  return new Map(file.trips.map((t) => [t.tripId, t]));
}
