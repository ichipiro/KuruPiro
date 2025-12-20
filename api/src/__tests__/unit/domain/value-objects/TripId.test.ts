import { describe, it, expect } from 'vitest';
import { TripId } from '@/domain/value-objects/TripId';

describe('TripId', () => {
  describe('fromString', () => {
    it('文字列からトリップIDを生成できる', () => {
      const tripId = TripId.fromString('TRIP_001');
      expect(tripId.value).toBe('TRIP_001');
    });

    it('前後の空白をトリムする', () => {
      const tripId = TripId.fromString('  TRIP_001  ');
      expect(tripId.value).toBe('TRIP_001');
    });

    it('空文字列の場合はエラーをスローする', () => {
      expect(() => TripId.fromString('')).toThrow();
    });

    it('空白のみの場合はエラーをスローする', () => {
      expect(() => TripId.fromString('   ')).toThrow();
    });
  });

  describe('equals', () => {
    it('同じ値の場合はtrueを返す', () => {
      const tripId1 = TripId.fromString('TRIP_001');
      const tripId2 = TripId.fromString('TRIP_001');
      expect(tripId1.equals(tripId2)).toBe(true);
    });

    it('異なる値の場合はfalseを返す', () => {
      const tripId1 = TripId.fromString('TRIP_001');
      const tripId2 = TripId.fromString('TRIP_002');
      expect(tripId1.equals(tripId2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('文字列表現を返す', () => {
      const tripId = TripId.fromString('TRIP_001');
      expect(tripId.toString()).toBe('TRIP_001');
    });
  });
});
