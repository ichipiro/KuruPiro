/**
 * DBモデル ⇔ ドメインモデル変換マッパーを集約したファイル
 *
 * 含まれるマッパー:
 * - CalendarMapper: カレンダーデータの変換
 * - RouteMapper: 路線データの変換
 * - StopMapper: 停留所データの変換
 * - StopTimeMapper: 停車時刻データの変換
 * - TripMapper: トリップデータの変換
 */

import { Calendar } from '@/domain/entities/Calendar';
import { Route } from '@/domain/entities/Route';
import { Stop } from '@/domain/entities/Stop';
import { StopTime } from '@/domain/entities/StopTime';
import { Trip } from '@/domain/entities/Trip';
import { GTFSTime, JSTDateTime } from '@/domain/value-objects/time';
import { StopId, TripId } from '@/domain/value-objects/identifiers';

/**
 * DBレコードからCalendarエンティティへの変換を行うマッパー
 */
export class CalendarMapper {
  /**
   * DBレコードからCalendarエンティティに変換
   */
  static toDomain(record: {
    serviceId: string;
    startDate: string;
    endDate: string;
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  }): Calendar {
    // GTFS date format: YYYYMMDD (e.g., "20240101")
    const startDate = this.parseGTFSDate(record.startDate);
    const endDate = this.parseGTFSDate(record.endDate);
    // GTFSのweekdaysは1=運行、0=運行なし
    // Calendarのweekdaysは[Monday, Tuesday, ..., Sunday]の順
    const weekdays = [
      record.monday === 1,
      record.tuesday === 1,
      record.wednesday === 1,
      record.thursday === 1,
      record.friday === 1,
      record.saturday === 1,
      record.sunday === 1,
    ];
    return Calendar.create(record.serviceId, startDate, endDate, weekdays);
  }
  /**
   * GTFS形式の日付文字列（YYYYMMDD）をJSTDateTimeに変換
   */
  private static parseGTFSDate(dateString: string): JSTDateTime {
    // "20240101" -> 2024, 01, 01
    const year = Number.parseInt(dateString.substring(0, 4), 10);
    const month = Number.parseInt(dateString.substring(4, 6), 10);
    const day = Number.parseInt(dateString.substring(6, 8), 10);
    return JSTDateTime.fromComponents(year, month, day, 0, 0, 0);
  }
  /**
   * CalendarエンティティからDBレコードに変換
   * （今回は読み取り専用なので使用しないが、完全性のため定義）
   */
  static toPersistence(calendar: Calendar): {
    service_id: string;
    start_date: string;
    end_date: string;
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  } {
    const weekdays = calendar.weekdays;
    return {
      service_id: calendar.serviceId,
      start_date: this.formatGTFSDate(calendar.startDate),
      end_date: this.formatGTFSDate(calendar.endDate),
      monday: weekdays[0] ? 1 : 0,
      tuesday: weekdays[1] ? 1 : 0,
      wednesday: weekdays[2] ? 1 : 0,
      thursday: weekdays[3] ? 1 : 0,
      friday: weekdays[4] ? 1 : 0,
      saturday: weekdays[5] ? 1 : 0,
      sunday: weekdays[6] ? 1 : 0,
    };
  }
  /**
   * JSTDateTimeをGTFS形式の日付文字列（YYYYMMDD）に変換
   */
  private static formatGTFSDate(date: JSTDateTime): string {
    const year = date.year.toString().padStart(4, '0');
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }
}
/**
 * DBレコードからRouteエンティティへの変換を行うマッパー
 */
export class RouteMapper {
  /**
   * DBレコードからRouteエンティティに変換
   */
  static toDomain(record: {
    routeId: string;
    routeShortName: string;
    destinationStop?: string | null;
  }): Route {
    return Route.create(
      record.routeId,
      record.routeShortName,
      record.destinationStop ?? undefined
    );
  }
  /**
   * RouteエンティティからDBレコードに変換
   * （今回は読み取り専用なので使用しないが、完全性のため定義）
   */
  static toPersistence(route: Route): {
    route_id: string;
    route_short_name: string;
    destination_stop: string | null;
  } {
    return {
      route_id: route.routeId,
      route_short_name: route.shortName,
      destination_stop: route.destinationStop ?? null,
    };
  }
}
/**
 * DBレコードからStopエンティティへの変換を行うマッパー
 */
export class StopMapper {
  /**
   * DBレコードからStopエンティティに変換
   */
  static toDomain(record: { stopId: string; stopName: string }): Stop {
    const stopId = StopId.fromString(record.stopId);
    return Stop.create(stopId, record.stopName);
  }
  /**
   * StopエンティティからDBレコードに変換
   * （今回は読み取り専用なので使用しないが、完全性のため定義）
   */
  static toPersistence(stop: Stop): { stop_id: string; stop_name: string } {
    return {
      stop_id: stop.id.value,
      stop_name: stop.name,
    };
  }
}
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
