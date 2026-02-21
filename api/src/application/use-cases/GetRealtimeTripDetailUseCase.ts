import type { IRealtimeRepository } from '@/domain/repositories';

export type RealtimeTripDetailDTO =
  | { found: false; totalTrips: number; message: string }
  | {
      found: true;
      tripId: string;
      stopTimeUpdates: {
        stopSequence: number | undefined;
        stopId: string | undefined;
        arrivalDelay: number | undefined;
        arrivalTime: number | undefined;
        departureDelay: number | undefined;
        departureTime: number | undefined;
        representativeDelay: number;
      }[];
    };

export class GetRealtimeTripDetailUseCase {
  constructor(private readonly realtimeRepo: IRealtimeRepository) {}

  async execute(tripId: string): Promise<RealtimeTripDetailDTO> {
    const allUpdates = await this.realtimeRepo.getAllTripUpdates();
    const targetUpdate = allUpdates.find((update) => update.tripId.value === tripId);

    if (!targetUpdate) {
      return {
        found: false,
        totalTrips: allUpdates.length,
        message: `Trip ${tripId} not found in realtime data`,
      };
    }

    return {
      found: true,
      tripId: targetUpdate.tripId.value,
      stopTimeUpdates: targetUpdate.stopTimeUpdates.map((update) => ({
        stopSequence: update.stopSequence,
        stopId: update.stopId?.value,
        arrivalDelay: update.arrivalDelay?.toSeconds(),
        arrivalTime: update.arrivalTime,
        departureDelay: update.departureDelay?.toSeconds(),
        departureTime: update.departureTime,
        representativeDelay: update.getRepresentativeDelay().toSeconds(),
      })),
    };
  }
}
