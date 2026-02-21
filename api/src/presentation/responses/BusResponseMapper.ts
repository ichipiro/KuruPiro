import type { NextBusDTO } from '@/application/dto/NextBusDTO';
import type { GetTripsResult } from '@/application/use-cases/GetTripsUseCase';
import type { NextBusResponse } from './BusResponse';

export function toNextBusResponse(bus: NextBusDTO): NextBusResponse {
  return {
    trip_id: bus.tripId,
    trip_short_id: bus.routeShortName,
    arrival_time: bus.scheduledArrival,
    remaining_time: bus.remainingTime,
    delay: bus.delayDisplay,
    trip_dest: bus.destinationLabel,
    current_location: bus.currentLocation,
  };
}

export function fromGetTripsResult(
  result: GetTripsResult
): NextBusResponse[] | Record<string, NextBusResponse[]> {
  if (result.type === 'single') {
    return result.buses.map(toNextBusResponse);
  }
  return Object.fromEntries(
    Object.entries(result.busesPerOrigin).map(([id, buses]) => [
      id,
      buses.map(toNextBusResponse),
    ])
  );
}
