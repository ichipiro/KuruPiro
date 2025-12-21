import { describe, it, expect } from 'vitest';
import { Trip } from '@/domain/entities/Trip';
import { TripId } from '@/domain/value-objects/TripId';

describe('Trip', () => {
  describe('create', () => {
    it('正常な値でTripを生成できる', () => {
      const tripId = TripId.fromString('TRIP_001');
      const trip = Trip.create(tripId, 'ROUTE_01', 'SERVICE_WEEKDAY', '三島駅行き', 0);

      expect(trip.id.value).toBe('TRIP_001');
      expect(trip.routeId).toBe('ROUTE_01');
      expect(trip.serviceId).toBe('SERVICE_WEEKDAY');
      expect(trip.headsign).toBe('三島駅行き');
      expect(trip.directionId).toBe(0);
    });

    it('headsignとdirectionIdが未指定の場合はundefinedになる', () => {
      const tripId = TripId.fromString('TRIP_001');
      const trip = Trip.create(tripId, 'ROUTE_01', 'SERVICE_WEEKDAY');

      expect(trip.id.value).toBe('TRIP_001');
      expect(trip.routeId).toBe('ROUTE_01');
      expect(trip.serviceId).toBe('SERVICE_WEEKDAY');
      expect(trip.headsign).toBeUndefined();
      expect(trip.directionId).toBeUndefined();
    });

    it('routeIdが空文字列の場合はエラーをスローする', () => {
      const tripId = TripId.fromString('TRIP_001');
      expect(() => Trip.create(tripId, '', 'SERVICE_WEEKDAY')).toThrow(
        'Route ID cannot be empty'
      );
    });

    it('routeIdが空白のみの場合はエラーをスローする', () => {
      const tripId = TripId.fromString('TRIP_001');
      expect(() => Trip.create(tripId, '   ', 'SERVICE_WEEKDAY')).toThrow(
        'Route ID cannot be empty'
      );
    });

    it('serviceIdが空文字列の場合はエラーをスローする', () => {
      const tripId = TripId.fromString('TRIP_001');
      expect(() => Trip.create(tripId, 'ROUTE_01', '')).toThrow(
        'Service ID cannot be empty'
      );
    });

    it('serviceIdが空白のみの場合はエラーをスローする', () => {
      const tripId = TripId.fromString('TRIP_001');
      expect(() => Trip.create(tripId, 'ROUTE_01', '   ')).toThrow(
        'Service ID cannot be empty'
      );
    });

    it('routeIdとserviceIdの前後の空白はトリムされる', () => {
      const tripId = TripId.fromString('TRIP_001');
      const trip = Trip.create(
        tripId,
        '  ROUTE_01  ',
        '  SERVICE_WEEKDAY  ',
        '  三島駅行き  '
      );

      expect(trip.routeId).toBe('ROUTE_01');
      expect(trip.serviceId).toBe('SERVICE_WEEKDAY');
      expect(trip.headsign).toBe('三島駅行き');
    });

    it('headsignが空文字列の場合はundefinedになる', () => {
      const tripId = TripId.fromString('TRIP_001');
      const trip = Trip.create(tripId, 'ROUTE_01', 'SERVICE_WEEKDAY', '');

      expect(trip.headsign).toBeUndefined();
    });

    it('headsignが空白のみの場合はundefinedになる', () => {
      const tripId = TripId.fromString('TRIP_001');
      const trip = Trip.create(tripId, 'ROUTE_01', 'SERVICE_WEEKDAY', '   ');

      expect(trip.headsign).toBeUndefined();
    });
  });

  describe('equals', () => {
    it('同じIDのトリップはequalsでtrueを返す', () => {
      const tripId1 = TripId.fromString('TRIP_001');
      const tripId2 = TripId.fromString('TRIP_001');
      const trip1 = Trip.create(tripId1, 'ROUTE_01', 'SERVICE_WEEKDAY');
      const trip2 = Trip.create(tripId2, 'ROUTE_02', 'SERVICE_HOLIDAY');

      expect(trip1.equals(trip2)).toBe(true);
    });

    it('異なるIDのトリップはequalsでfalseを返す', () => {
      const tripId1 = TripId.fromString('TRIP_001');
      const tripId2 = TripId.fromString('TRIP_002');
      const trip1 = Trip.create(tripId1, 'ROUTE_01', 'SERVICE_WEEKDAY');
      const trip2 = Trip.create(tripId2, 'ROUTE_01', 'SERVICE_WEEKDAY');

      expect(trip1.equals(trip2)).toBe(false);
    });
  });

  describe('getDirection', () => {
    it('directionIdが0の場合は「往路」を返す', () => {
      const tripId = TripId.fromString('TRIP_001');
      const trip = Trip.create(tripId, 'ROUTE_01', 'SERVICE_WEEKDAY', undefined, 0);

      expect(trip.getDirection()).toBe('往路');
    });

    it('directionIdが1の場合は「復路」を返す', () => {
      const tripId = TripId.fromString('TRIP_001');
      const trip = Trip.create(tripId, 'ROUTE_01', 'SERVICE_WEEKDAY', undefined, 1);

      expect(trip.getDirection()).toBe('復路');
    });

    it('directionIdがundefinedの場合は「不明」を返す', () => {
      const tripId = TripId.fromString('TRIP_001');
      const trip = Trip.create(tripId, 'ROUTE_01', 'SERVICE_WEEKDAY');

      expect(trip.getDirection()).toBe('不明');
    });

    it('directionIdが0または1以外の場合は「不明」を返す', () => {
      const tripId = TripId.fromString('TRIP_001');
      const trip = Trip.create(tripId, 'ROUTE_01', 'SERVICE_WEEKDAY', undefined, 2);

      expect(trip.getDirection()).toBe('不明');
    });
  });
});
