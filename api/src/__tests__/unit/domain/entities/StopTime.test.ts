import { describe, it, expect } from 'vitest';
import { StopTime } from '@/domain/entities/StopTime';
import { TripId } from '@/domain/value-objects/TripId';
import { StopId } from '@/domain/value-objects/StopId';
import { GTFSTime } from '@/domain/value-objects/GTFSTime';

describe('StopTime', () => {
  describe('create', () => {
    it('正常な値でStopTimeを生成できる', () => {
      const tripId = TripId.fromString('TRIP_001');
      const stopId = StopId.fromString('STOP_001');
      const arrivalTime = GTFSTime.fromString('10:30:00');
      const departureTime = GTFSTime.fromString('10:32:00');

      const stopTime = StopTime.create(tripId, stopId, 1, arrivalTime, departureTime);

      expect(stopTime.tripId.value).toBe('TRIP_001');
      expect(stopTime.stopId.value).toBe('STOP_001');
      expect(stopTime.sequence).toBe(1);
      expect(stopTime.arrivalTime.toString()).toBe('10:30:00');
      expect(stopTime.departureTime.toString()).toBe('10:32:00');
    });

    it('到着時刻と出発時刻が同じでも生成できる', () => {
      const tripId = TripId.fromString('TRIP_001');
      const stopId = StopId.fromString('STOP_001');
      const time = GTFSTime.fromString('10:30:00');

      const stopTime = StopTime.create(tripId, stopId, 1, time, time);

      expect(stopTime.arrivalTime.toString()).toBe('10:30:00');
      expect(stopTime.departureTime.toString()).toBe('10:30:00');
    });

    it('sequenceが0以下の場合はエラーをスローする', () => {
      const tripId = TripId.fromString('TRIP_001');
      const stopId = StopId.fromString('STOP_001');
      const arrivalTime = GTFSTime.fromString('10:30:00');
      const departureTime = GTFSTime.fromString('10:32:00');

      expect(() =>
        StopTime.create(tripId, stopId, 0, arrivalTime, departureTime)
      ).toThrow('Stop sequence must be greater than 0');
    });

    it('sequenceが負の数の場合はエラーをスローする', () => {
      const tripId = TripId.fromString('TRIP_001');
      const stopId = StopId.fromString('STOP_001');
      const arrivalTime = GTFSTime.fromString('10:30:00');
      const departureTime = GTFSTime.fromString('10:32:00');

      expect(() =>
        StopTime.create(tripId, stopId, -1, arrivalTime, departureTime)
      ).toThrow('Stop sequence must be greater than 0');
    });

    it('出発時刻が到着時刻より前の場合はエラーをスローする', () => {
      const tripId = TripId.fromString('TRIP_001');
      const stopId = StopId.fromString('STOP_001');
      const arrivalTime = GTFSTime.fromString('10:30:00');
      const departureTime = GTFSTime.fromString('10:28:00'); // 到着より前

      expect(() =>
        StopTime.create(tripId, stopId, 1, arrivalTime, departureTime)
      ).toThrow('Departure time must be after or equal to arrival time');
    });

    it('24時間超の時刻でも正しく処理できる', () => {
      const tripId = TripId.fromString('TRIP_001');
      const stopId = StopId.fromString('STOP_001');
      const arrivalTime = GTFSTime.fromString('25:30:00');
      const departureTime = GTFSTime.fromString('25:32:00');

      const stopTime = StopTime.create(tripId, stopId, 1, arrivalTime, departureTime);

      expect(stopTime.arrivalTime.toString()).toBe('25:30:00');
      expect(stopTime.departureTime.toString()).toBe('25:32:00');
    });
  });

  describe('equals', () => {
    it('同じtripIdとsequenceのStopTimeはequalsでtrueを返す', () => {
      const tripId1 = TripId.fromString('TRIP_001');
      const tripId2 = TripId.fromString('TRIP_001');
      const stopId1 = StopId.fromString('STOP_001');
      const stopId2 = StopId.fromString('STOP_002');
      const time1 = GTFSTime.fromString('10:30:00');
      const time2 = GTFSTime.fromString('11:00:00');

      const stopTime1 = StopTime.create(tripId1, stopId1, 1, time1, time1);
      const stopTime2 = StopTime.create(tripId2, stopId2, 1, time2, time2);

      expect(stopTime1.equals(stopTime2)).toBe(true);
    });

    it('異なるtripIdのStopTimeはequalsでfalseを返す', () => {
      const tripId1 = TripId.fromString('TRIP_001');
      const tripId2 = TripId.fromString('TRIP_002');
      const stopId = StopId.fromString('STOP_001');
      const time = GTFSTime.fromString('10:30:00');

      const stopTime1 = StopTime.create(tripId1, stopId, 1, time, time);
      const stopTime2 = StopTime.create(tripId2, stopId, 1, time, time);

      expect(stopTime1.equals(stopTime2)).toBe(false);
    });

    it('異なるsequenceのStopTimeはequalsでfalseを返す', () => {
      const tripId = TripId.fromString('TRIP_001');
      const stopId = StopId.fromString('STOP_001');
      const time = GTFSTime.fromString('10:30:00');

      const stopTime1 = StopTime.create(tripId, stopId, 1, time, time);
      const stopTime2 = StopTime.create(tripId, stopId, 2, time, time);

      expect(stopTime1.equals(stopTime2)).toBe(false);
    });
  });

  describe('getDwellTime', () => {
    it('停車時間を分単位で取得できる', () => {
      const tripId = TripId.fromString('TRIP_001');
      const stopId = StopId.fromString('STOP_001');
      const arrivalTime = GTFSTime.fromString('10:30:00');
      const departureTime = GTFSTime.fromString('10:32:00');

      const stopTime = StopTime.create(tripId, stopId, 1, arrivalTime, departureTime);

      expect(stopTime.getDwellTime()).toBe(2); // 2分
    });

    it('到着時刻と出発時刻が同じ場合は停車時間0を返す', () => {
      const tripId = TripId.fromString('TRIP_001');
      const stopId = StopId.fromString('STOP_001');
      const time = GTFSTime.fromString('10:30:00');

      const stopTime = StopTime.create(tripId, stopId, 1, time, time);

      expect(stopTime.getDwellTime()).toBe(0);
    });
  });
});
