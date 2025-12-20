import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSTDateTime } from '@/domain/value-objects/JSTDateTime';
import { GTFSTime } from '@/domain/value-objects/GTFSTime';

describe('JSTDateTime', () => {
  describe('now', () => {
    beforeEach(() => {
      // 2024-01-15 14:30:45 JST にモック
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T14:30:45+09:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('現在のJST時刻を取得できる', () => {
      const now = JSTDateTime.now();
      expect(now.year).toBe(2024);
      expect(now.month).toBe(1);
      expect(now.day).toBe(15);
      expect(now.hour).toBe(14);
      expect(now.minute).toBe(30);
      expect(now.second).toBe(45);
    });
  });

  describe('fromDate', () => {
    it('DateオブジェクトからJSTDateTimeを生成できる', () => {
      const date = new Date('2024-01-15T14:30:45+09:00');
      const jst = JSTDateTime.fromDate(date);

      expect(jst.year).toBe(2024);
      expect(jst.month).toBe(1);
      expect(jst.day).toBe(15);
      expect(jst.hour).toBe(14);
      expect(jst.minute).toBe(30);
      expect(jst.second).toBe(45);
    });

    it('UTC時刻をJSTに変換できる', () => {
      // UTC 2024-01-15 05:30:45 = JST 2024-01-15 14:30:45
      const date = new Date('2024-01-15T05:30:45Z');
      const jst = JSTDateTime.fromDate(date);

      expect(jst.hour).toBe(14);
    });
  });

  describe('fromString', () => {
    it('ISO 8601形式の文字列からJSTDateTimeを生成できる', () => {
      const jst = JSTDateTime.fromString('2024-01-15T14:30:45+09:00');

      expect(jst.year).toBe(2024);
      expect(jst.month).toBe(1);
      expect(jst.day).toBe(15);
      expect(jst.hour).toBe(14);
      expect(jst.minute).toBe(30);
      expect(jst.second).toBe(45);
    });

    it('不正な形式の場合はエラーをスローする', () => {
      expect(() => JSTDateTime.fromString('invalid')).toThrow();
    });
  });

  describe('fromComponents', () => {
    it('年月日時分秒から生成できる', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 15, 14, 30, 45);

      expect(jst.year).toBe(2024);
      expect(jst.month).toBe(1);
      expect(jst.day).toBe(15);
      expect(jst.hour).toBe(14);
      expect(jst.minute).toBe(30);
      expect(jst.second).toBe(45);
    });

    it('秒を省略できる', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);

      expect(jst.second).toBe(0);
    });

    it('不正な値の場合はエラーをスローする', () => {
      expect(() => JSTDateTime.fromComponents(2024, 13, 1)).toThrow(); // 13月
      expect(() => JSTDateTime.fromComponents(2024, 1, 32)).toThrow(); // 32日
      expect(() => JSTDateTime.fromComponents(2024, 1, 1, 24)).toThrow(); // 24時
      expect(() => JSTDateTime.fromComponents(2024, 1, 1, 0, 60)).toThrow(); // 60分
    });
  });

  describe('addDays', () => {
    it('日数を加算できる', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      const next = jst.addDays(1);

      expect(next.day).toBe(16);
      expect(next.month).toBe(1);
    });

    it('月をまたぐ加算ができる', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 31, 14, 30);
      const next = jst.addDays(1);

      expect(next.day).toBe(1);
      expect(next.month).toBe(2);
    });

    it('負の日数で減算できる', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      const prev = jst.addDays(-1);

      expect(prev.day).toBe(14);
    });
  });

  describe('addHours', () => {
    it('時間を加算できる', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      const next = jst.addHours(2);

      expect(next.hour).toBe(16);
    });

    it('日をまたぐ加算ができる', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 15, 23, 30);
      const next = jst.addHours(2);

      expect(next.day).toBe(16);
      expect(next.hour).toBe(1);
    });
  });

  describe('addMinutes', () => {
    it('分を加算できる', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      const next = jst.addMinutes(45);

      expect(next.hour).toBe(15);
      expect(next.minute).toBe(15);
    });
  });

  describe('addSeconds', () => {
    it('秒を加算できる', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 15, 14, 30, 30);
      const next = jst.addSeconds(45);

      expect(next.minute).toBe(31);
      expect(next.second).toBe(15);
    });
  });

  describe('withTime', () => {
    it('GTFSTimeを適用した新しいJSTDateTimeを生成できる', () => {
      const baseDate = JSTDateTime.fromComponents(2024, 1, 15, 10, 0);
      const gtfsTime = GTFSTime.fromString('14:30:00');

      const result = baseDate.withTime(gtfsTime);

      expect(result.year).toBe(2024);
      expect(result.month).toBe(1);
      expect(result.day).toBe(15);
      expect(result.hour).toBe(14);
      expect(result.minute).toBe(30);
      expect(result.second).toBe(0);
    });

    it('24時間超のGTFSTimeで翌日になる', () => {
      const baseDate = JSTDateTime.fromComponents(2024, 1, 15, 10, 0);
      const gtfsTime = GTFSTime.fromString('25:30:00');

      const result = baseDate.withTime(gtfsTime);

      expect(result.day).toBe(16);
      expect(result.hour).toBe(1);
      expect(result.minute).toBe(30);
    });

    it('26時間超のGTFSTimeで翌日になる', () => {
      const baseDate = JSTDateTime.fromComponents(2024, 1, 15, 10, 0);
      const gtfsTime = GTFSTime.fromString('26:15:00');

      const result = baseDate.withTime(gtfsTime);

      expect(result.day).toBe(16);
      expect(result.hour).toBe(2);
      expect(result.minute).toBe(15);
    });
  });

  describe('getWeekday', () => {
    it('月曜日は0を返す', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 15); // 月曜日
      expect(jst.getWeekday()).toBe(0);
    });

    it('日曜日は6を返す', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 21); // 日曜日
      expect(jst.getWeekday()).toBe(6);
    });

    it('火曜日は1を返す', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 16); // 火曜日
      expect(jst.getWeekday()).toBe(1);
    });
  });

  describe('compareTo', () => {
    it('同じ時刻の場合は0を返す', () => {
      const jst1 = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      const jst2 = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      expect(jst1.compareTo(jst2)).toBe(0);
    });

    it('前の時刻の場合は負の値を返す', () => {
      const jst1 = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      const jst2 = JSTDateTime.fromComponents(2024, 1, 15, 15, 30);
      expect(jst1.compareTo(jst2)).toBeLessThan(0);
    });

    it('後の時刻の場合は正の値を返す', () => {
      const jst1 = JSTDateTime.fromComponents(2024, 1, 15, 15, 30);
      const jst2 = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      expect(jst1.compareTo(jst2)).toBeGreaterThan(0);
    });
  });

  describe('isAfter', () => {
    it('後の時刻の場合はtrueを返す', () => {
      const jst1 = JSTDateTime.fromComponents(2024, 1, 15, 15, 30);
      const jst2 = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      expect(jst1.isAfter(jst2)).toBe(true);
    });

    it('前の時刻の場合はfalseを返す', () => {
      const jst1 = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      const jst2 = JSTDateTime.fromComponents(2024, 1, 15, 15, 30);
      expect(jst1.isAfter(jst2)).toBe(false);
    });
  });

  describe('isBefore', () => {
    it('前の時刻の場合はtrueを返す', () => {
      const jst1 = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      const jst2 = JSTDateTime.fromComponents(2024, 1, 15, 15, 30);
      expect(jst1.isBefore(jst2)).toBe(true);
    });

    it('後の時刻の場合はfalseを返す', () => {
      const jst1 = JSTDateTime.fromComponents(2024, 1, 15, 15, 30);
      const jst2 = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      expect(jst1.isBefore(jst2)).toBe(false);
    });
  });

  describe('isBeforeOrEqual', () => {
    it('前の時刻の場合はtrueを返す', () => {
      const jst1 = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      const jst2 = JSTDateTime.fromComponents(2024, 1, 15, 15, 30);
      expect(jst1.isBeforeOrEqual(jst2)).toBe(true);
    });

    it('同じ時刻の場合はtrueを返す', () => {
      const jst1 = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      const jst2 = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      expect(jst1.isBeforeOrEqual(jst2)).toBe(true);
    });

    it('後の時刻の場合はfalseを返す', () => {
      const jst1 = JSTDateTime.fromComponents(2024, 1, 15, 15, 30);
      const jst2 = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      expect(jst1.isBeforeOrEqual(jst2)).toBe(false);
    });
  });

  describe('diff', () => {
    it('時刻の差をミリ秒で返す', () => {
      const jst1 = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      const jst2 = JSTDateTime.fromComponents(2024, 1, 15, 14, 31);

      expect(jst2.diff(jst1)).toBe(60 * 1000); // 1分 = 60000ms
    });

    it('負の差も計算できる', () => {
      const jst1 = JSTDateTime.fromComponents(2024, 1, 15, 14, 31);
      const jst2 = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);

      expect(jst2.diff(jst1)).toBe(-60 * 1000);
    });
  });

  describe('toDate', () => {
    it('JavaScriptのDateオブジェクトに変換できる', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 15, 14, 30, 45);
      const date = jst.toDate();

      // JSTで確認
      expect(date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })).toContain('2024');
      expect(date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })).toContain('14:30');
    });
  });

  describe('toISOString', () => {
    it('ISO 8601形式の文字列を返す', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 15, 14, 30, 45);
      const iso = jst.toISOString();

      expect(iso).toMatch(/2024-01-15T14:30:45/);
    });
  });

  describe('toDisplayString', () => {
    it('YYYY-MM-DD HH:MM形式で表示用文字列を返す', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      expect(jst.toDisplayString()).toBe('2024-01-15 14:30');
    });

    it('1桁の月日時分をゼロパディングする', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 5, 9, 5);
      expect(jst.toDisplayString()).toBe('2024-01-05 09:05');
    });
  });

  describe('toTimeString', () => {
    it('HH:MM形式で時刻文字列を返す', () => {
      const jst = JSTDateTime.fromComponents(2024, 1, 15, 14, 30);
      expect(jst.toTimeString()).toBe('14:30');
    });
  });
});
