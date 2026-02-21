export type BusService = {
  arrival_time: string;
  delay: string;
  trip_dest: string;
  trip_id: string;
  trip_short_id: string;
  remaining_time: string;
};

export type BusServicesByOrigin = {
  [originId: string]: BusService[];
};
