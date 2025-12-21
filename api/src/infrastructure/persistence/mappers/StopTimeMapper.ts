import { StopTime } from '@/domain/entities/StopTime';
import { TripId } from '@/domain/value-objects/TripId';
import { StopId } from '@/domain/value-objects/StopId';
import { GTFSTime } from '@/domain/value-objects/GTFSTime';

/**
 * DBレコードからStopTimeエンティティへの変換を行うマッパー
 */
export class StopTimeMapper {
  /**
   * DBレコードからStopTimeエンティティに変換
   */
  static toDomain(record: {
    tripId: string;
    stopId: string;
    stopSequence: number;
    arrivalTime: string;
    departureTime: string;
  }): StopTime {
    const tripId = TripId.fromString(record.tripId);
    const stopId = StopId.fromString(record.stopId);
    const arrivalTime = GTFSTime.fromString(record.arrivalTime);
    const departureTime = GTFSTime.fromString(record.departureTime);

    return StopTime.create(
      tripId,
      stopId,
      record.stopSequence,
      arrivalTime,
      departureTime
    );
  }

  /**
   * StopTimeエンティティからDBレコードに変換
   * （今回は読み取り専用なので使用しないが、完全性のため定義）
   */
  static toPersistence(stopTime: StopTime): {
    trip_id: string;
    stop_id: string;
    stop_sequence: number;
    arrival_time: string;
    departure_time: string;
  } {
    return {
      trip_id: stopTime.tripId.value,
      stop_id: stopTime.stopId.value,
      stop_sequence: stopTime.sequence,
      arrival_time: stopTime.arrivalTime.toString(),
      departure_time: stopTime.departureTime.toString(),
    };
  }
}
