export interface NextBusResponse {
  trip_id: string;
  trip_short_id: string;
  arrival_time: string;
  remaining_time: string;
  delay: string;
  trip_dest: string;
  current_location: string;
}
