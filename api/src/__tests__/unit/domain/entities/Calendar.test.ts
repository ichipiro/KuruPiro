import { describe, it, expect } from 'vitest';
import { Calendar } from '@/domain/entities/Calendar';
import { JSTDateTime } from '@/domain/value-objects/JSTDateTime';

describe('Calendar', () => {
  describe('create', () => {
    it('正常な値でCalendarを生成できる', () => {
      const startDate = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const endDate = JSTDateTime.fromComponents(2024, 12, 31, 23, 59, 59);
      const weekdays = [true, true, true, true, true, false, false]; // 平日のみ

      const calendar = Calendar.create('SERVICE_WEEKDAY', startDate, endDate, weekdays);

      expect(calendar.serviceId).toBe('SERVICE_WEEKDAY');
      expect(calendar.startDate).toBe(startDate);
      expect(calendar.endDate).toBe(endDate);
      expect(calendar.weekdays).toEqual(weekdays);
    });

    it('serviceIdが空文字列の場合はエラーをスローする', () => {
      const startDate = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const endDate = JSTDateTime.fromComponents(2024, 12, 31, 23, 59, 59);
      const weekdays = [true, true, true, true, true, false, false];

      expect(() => Calendar.create('', startDate, endDate, weekdays)).toThrow(
        'Service ID cannot be empty'
      );
    });

    it('serviceIdが空白のみの場合はエラーをスローする', () => {
      const startDate = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const endDate = JSTDateTime.fromComponents(2024, 12, 31, 23, 59, 59);
      const weekdays = [true, true, true, true, true, false, false];

      expect(() => Calendar.create('   ', startDate, endDate, weekdays)).toThrow(
        'Service ID cannot be empty'
      );
    });

    it('endDateがstartDateより前の場合はエラーをスローする', () => {
      const startDate = JSTDateTime.fromComponents(2024, 12, 31, 0, 0, 0);
      const endDate = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const weekdays = [true, true, true, true, true, false, false];

      expect(() =>
        Calendar.create('SERVICE_WEEKDAY', startDate, endDate, weekdays)
      ).toThrow('End date must be after or equal to start date');
    });

    it('weekdaysが7要素でない場合はエラーをスローする', () => {
      const startDate = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const endDate = JSTDateTime.fromComponents(2024, 12, 31, 23, 59, 59);
      const weekdays = [true, true, true]; // 3要素のみ

      expect(() =>
        Calendar.create('SERVICE_WEEKDAY', startDate, endDate, weekdays)
      ).toThrow('Weekdays must have exactly 7 elements');
    });

    it('startDateとendDateが同じでも生成できる', () => {
      const date = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const weekdays = [true, true, true, true, true, false, false];

      const calendar = Calendar.create('SERVICE_WEEKDAY', date, date, weekdays);

      expect(calendar.startDate).toBe(date);
      expect(calendar.endDate).toBe(date);
    });
  });

  describe('equals', () => {
    it('同じserviceIdのカレンダーはequalsでtrueを返す', () => {
      const startDate1 = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const endDate1 = JSTDateTime.fromComponents(2024, 12, 31, 23, 59, 59);
      const startDate2 = JSTDateTime.fromComponents(2024, 2, 1, 0, 0, 0);
      const endDate2 = JSTDateTime.fromComponents(2024, 11, 30, 23, 59, 59);
      const weekdays1 = [true, true, true, true, true, false, false];
      const weekdays2 = [false, false, false, false, false, true, true];

      const calendar1 = Calendar.create('SERVICE_WEEKDAY', startDate1, endDate1, weekdays1);
      const calendar2 = Calendar.create('SERVICE_WEEKDAY', startDate2, endDate2, weekdays2);

      expect(calendar1.equals(calendar2)).toBe(true);
    });

    it('異なるserviceIdのカレンダーはequalsでfalseを返す', () => {
      const startDate = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const endDate = JSTDateTime.fromComponents(2024, 12, 31, 23, 59, 59);
      const weekdays = [true, true, true, true, true, false, false];

      const calendar1 = Calendar.create('SERVICE_WEEKDAY', startDate, endDate, weekdays);
      const calendar2 = Calendar.create('SERVICE_HOLIDAY', startDate, endDate, weekdays);

      expect(calendar1.equals(calendar2)).toBe(false);
    });
  });

  describe('isActiveOnWeekday', () => {
    it('月曜日が運行される場合はtrueを返す', () => {
      const startDate = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const endDate = JSTDateTime.fromComponents(2024, 12, 31, 23, 59, 59);
      const weekdays = [true, true, true, true, true, false, false];

      const calendar = Calendar.create('SERVICE_WEEKDAY', startDate, endDate, weekdays);

      expect(calendar.isActiveOnWeekday(0)).toBe(true); // Monday
    });

    it('土曜日が運行されない場合はfalseを返す', () => {
      const startDate = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const endDate = JSTDateTime.fromComponents(2024, 12, 31, 23, 59, 59);
      const weekdays = [true, true, true, true, true, false, false];

      const calendar = Calendar.create('SERVICE_WEEKDAY', startDate, endDate, weekdays);

      expect(calendar.isActiveOnWeekday(5)).toBe(false); // Saturday
    });

    it('日曜日が運行されない場合はfalseを返す', () => {
      const startDate = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const endDate = JSTDateTime.fromComponents(2024, 12, 31, 23, 59, 59);
      const weekdays = [true, true, true, true, true, false, false];

      const calendar = Calendar.create('SERVICE_WEEKDAY', startDate, endDate, weekdays);

      expect(calendar.isActiveOnWeekday(6)).toBe(false); // Sunday
    });

    it('weekdayが0-6の範囲外の場合はfalseを返す', () => {
      const startDate = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const endDate = JSTDateTime.fromComponents(2024, 12, 31, 23, 59, 59);
      const weekdays = [true, true, true, true, true, false, false];

      const calendar = Calendar.create('SERVICE_WEEKDAY', startDate, endDate, weekdays);

      expect(calendar.isActiveOnWeekday(-1)).toBe(false);
      expect(calendar.isActiveOnWeekday(7)).toBe(false);
    });
  });

  describe('isActiveOnDate', () => {
    it('運行期間内の日付の場合はtrueを返す', () => {
      const startDate = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const endDate = JSTDateTime.fromComponents(2024, 12, 31, 23, 59, 59);
      const weekdays = [true, true, true, true, true, false, false];

      const calendar = Calendar.create('SERVICE_WEEKDAY', startDate, endDate, weekdays);
      const testDate = JSTDateTime.fromComponents(2024, 6, 15, 12, 0, 0);

      expect(calendar.isActiveOnDate(testDate)).toBe(true);
    });

    it('運行期間より前の日付の場合はfalseを返す', () => {
      const startDate = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const endDate = JSTDateTime.fromComponents(2024, 12, 31, 23, 59, 59);
      const weekdays = [true, true, true, true, true, false, false];

      const calendar = Calendar.create('SERVICE_WEEKDAY', startDate, endDate, weekdays);
      const testDate = JSTDateTime.fromComponents(2023, 12, 31, 12, 0, 0);

      expect(calendar.isActiveOnDate(testDate)).toBe(false);
    });

    it('運行期間より後の日付の場合はfalseを返す', () => {
      const startDate = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const endDate = JSTDateTime.fromComponents(2024, 12, 31, 23, 59, 59);
      const weekdays = [true, true, true, true, true, false, false];

      const calendar = Calendar.create('SERVICE_WEEKDAY', startDate, endDate, weekdays);
      const testDate = JSTDateTime.fromComponents(2025, 1, 1, 0, 0, 0);

      expect(calendar.isActiveOnDate(testDate)).toBe(false);
    });

    it('startDateと同じ日付の場合はtrueを返す', () => {
      const startDate = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const endDate = JSTDateTime.fromComponents(2024, 12, 31, 23, 59, 59);
      const weekdays = [true, true, true, true, true, false, false];

      const calendar = Calendar.create('SERVICE_WEEKDAY', startDate, endDate, weekdays);

      expect(calendar.isActiveOnDate(startDate)).toBe(true);
    });

    it('endDateと同じ日付の場合はtrueを返す', () => {
      const startDate = JSTDateTime.fromComponents(2024, 1, 1, 0, 0, 0);
      const endDate = JSTDateTime.fromComponents(2024, 12, 31, 23, 59, 59);
      const weekdays = [true, true, true, true, true, false, false];

      const calendar = Calendar.create('SERVICE_WEEKDAY', startDate, endDate, weekdays);

      expect(calendar.isActiveOnDate(endDate)).toBe(true);
    });
  });
});
