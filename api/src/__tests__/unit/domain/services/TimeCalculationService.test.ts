import { describe, it, expect } from 'vitest';
import { TimeCalculationService } from '@/domain/services/TimeCalculationService';
import { GTFSTime } from '@/domain/value-objects/time';
import { JSTDateTime } from '@/domain/value-objects/time';
import { Delay } from '@/domain/value-objects/identifiers';

describe('TimeCalculationService', () => {
  const service = new TimeCalculationService();

  describe('calculateActualArrivalTime', () => {
    it('should return scheduled time when no delay', () => {
      const baseDate = JSTDateTime.fromComponents(2025, 1, 6, 0, 0, 0); // Monday 00:00
      const scheduledTime = GTFSTime.fromString('10:30:00');
      const delay = undefined;

      const actualTime = service.calculateActualArrivalTime(
        scheduledTime,
        delay,
        baseDate
      );

      // Expected: Monday 10:30
      expect(actualTime.toISOString()).toBe('2025-01-06T10:30:00+09:00');
    });

    it('should apply positive delay to scheduled time', () => {
      const baseDate = JSTDateTime.fromComponents(2025, 1, 6, 0, 0, 0);
      const scheduledTime = GTFSTime.fromString('10:30:00');
      const delay = Delay.fromSeconds(300); // +5 minutes

      const actualTime = service.calculateActualArrivalTime(
        scheduledTime,
        delay,
        baseDate
      );

      // Expected: Monday 10:35 (10:30 + 5min)
      expect(actualTime.toISOString()).toBe('2025-01-06T10:35:00+09:00');
    });

    it('should apply negative delay to scheduled time', () => {
      const baseDate = JSTDateTime.fromComponents(2025, 1, 6, 0, 0, 0);
      const scheduledTime = GTFSTime.fromString('10:30:00');
      const delay = Delay.fromSeconds(-120); // -2 minutes (early)

      const actualTime = service.calculateActualArrivalTime(
        scheduledTime,
        delay,
        baseDate
      );

      // Expected: Monday 10:28 (10:30 - 2min)
      expect(actualTime.toISOString()).toBe('2025-01-06T10:28:00+09:00');
    });

    it('should handle 24+ hour times (late-night buses)', () => {
      const baseDate = JSTDateTime.fromComponents(2025, 1, 6, 0, 0, 0); // Monday 00:00
      const scheduledTime = GTFSTime.fromString('25:30:00'); // Tuesday 01:30
      const delay = undefined;

      const actualTime = service.calculateActualArrivalTime(
        scheduledTime,
        delay,
        baseDate
      );

      // Expected: Tuesday 01:30 (Monday + 1 day + 1:30)
      expect(actualTime.toISOString()).toBe('2025-01-07T01:30:00+09:00');
    });

    it('should handle 24+ hour times with delay', () => {
      const baseDate = JSTDateTime.fromComponents(2025, 1, 6, 0, 0, 0);
      const scheduledTime = GTFSTime.fromString('25:30:00');
      const delay = Delay.fromSeconds(600); // +10 minutes

      const actualTime = service.calculateActualArrivalTime(
        scheduledTime,
        delay,
        baseDate
      );

      // Expected: Tuesday 01:40 (Monday 25:30 + 10min)
      expect(actualTime.toISOString()).toBe('2025-01-07T01:40:00+09:00');
    });

    it('should handle midnight crossing with delay', () => {
      const baseDate = JSTDateTime.fromComponents(2025, 1, 6, 0, 0, 0);
      const scheduledTime = GTFSTime.fromString('23:55:00');
      const delay = Delay.fromSeconds(600); // +10 minutes

      const actualTime = service.calculateActualArrivalTime(
        scheduledTime,
        delay,
        baseDate
      );

      // Expected: Tuesday 00:05 (23:55 + 10min crosses midnight)
      expect(actualTime.toISOString()).toBe('2025-01-07T00:05:00+09:00');
    });
  });

  describe('calculateRemainingTime', () => {
    it('should calculate remaining time correctly', () => {
      const currentTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);
      const arrivalTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 30, 0);

      const remaining = service.calculateRemainingTime(arrivalTime, currentTime);

      expect(remaining.toMinutes()).toBe(30);
    });

    it('should return "まもなく到着" for <= 1 minute', () => {
      const currentTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);
      const arrivalTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 30); // 30 seconds

      const remaining = service.calculateRemainingTime(arrivalTime, currentTime);

      expect(remaining.toString()).toBe('まもなく到着');
    });

    it('should handle negative remaining time (bus already departed)', () => {
      const currentTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 30, 0);
      const arrivalTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const remaining = service.calculateRemainingTime(arrivalTime, currentTime);

      expect(remaining.toMinutes()).toBe(-30);
    });

    it('should handle >24 hour remaining time', () => {
      const currentTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);
      const arrivalTime = JSTDateTime.fromComponents(2025, 1, 7, 11, 0, 0); // Next day

      const remaining = service.calculateRemainingTime(arrivalTime, currentTime);

      // >24 hours should display as "まもなく到着"
      expect(remaining.toString()).toBe('まもなく到着');
    });
  });
});
