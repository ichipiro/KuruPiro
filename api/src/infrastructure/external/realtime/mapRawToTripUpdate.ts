import { TripUpdate, StopTimeUpdate } from '@/domain/entities/TripUpdate';
import { TripId, StopId, Delay } from '@/domain/value-objects/identifiers';
import type { TripUpdateRaw } from '@/infrastructure/external/durable-objects/types';

/**
 * Raw TripUpdate（DO/R2スナップショットの保存形式）をドメインエンティティに変換する
 */
export function mapRawToTripUpdate(raw: TripUpdateRaw): TripUpdate {
  const tripId = TripId.fromString(raw.tripId);

  const stopTimeUpdates = raw.stopTimeUpdates.map((update) => {
    return StopTimeUpdate.create({
      stopSequence: update.stopSequence,
      stopId: update.stopId ? StopId.fromString(update.stopId) : undefined,
      arrivalDelay:
        update.arrivalDelay !== undefined
          ? Delay.fromSeconds(update.arrivalDelay)
          : undefined,
      departureDelay:
        update.departureDelay !== undefined
          ? Delay.fromSeconds(update.departureDelay)
          : undefined,
      arrivalTime: update.arrivalTime,
      departureTime: update.departureTime,
    });
  });

  return TripUpdate.create(tripId, stopTimeUpdates);
}
