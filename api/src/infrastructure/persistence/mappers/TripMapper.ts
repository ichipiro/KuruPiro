import { Trip } from '@/domain/entities/Trip';
import { TripId } from '@/domain/value-objects/TripId';

/**
 * DBレコードからTripエンティティへの変換を行うマッパー
 */
export class TripMapper {
  /**
   * DBレコードからTripエンティティに変換
   */
  static toDomain(record: {
    tripId: string;
    routeId: string;
    serviceId: string;
    tripHeadsign?: string | null;
    directionId?: number | null;
  }): Trip {
    const tripId = TripId.fromString(record.tripId);
    return Trip.create(
      tripId,
      record.routeId,
      record.serviceId,
      record.tripHeadsign ?? undefined,
      record.directionId ?? undefined
    );
  }

  /**
   * TripエンティティからDBレコードに変換
   * （今回は読み取り専用なので使用しないが、完全性のため定義）
   */
  static toPersistence(trip: Trip): {
    trip_id: string;
    route_id: string;
    service_id: string;
    trip_headsign: string | null;
    direction_id: number | null;
  } {
    return {
      trip_id: trip.id.value,
      route_id: trip.routeId,
      service_id: trip.serviceId,
      trip_headsign: trip.headsign ?? null,
      direction_id: trip.directionId ?? null,
    };
  }
}
