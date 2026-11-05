import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSTDateTime } from '@/domain/value-objects/time';
import { GTFSTime } from '@/domain/value-objects/time';

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

  describe('serviceDayStart', () => {
    it('3時以降は当日の0時を返す', () => {
      const morning = JSTDateTime.fromComponents(2026, 11, 4, 3, 0, 0);
      const start = morning.serviceDayStart();
      expect([start.year, start.month, start.day]).toEqual([2026, 11, 4]);
      expect([start.hour, start.minute, start.second]).toEqual([0, 0, 0]);

      const daytime = JSTDateTime.fromComponents(2026, 11, 4, 10, 30, 15);
      const dayStart = daytime.serviceDayStart();
      expect([dayStart.year, dayStart.month, dayStart.day]).toEqual([2026, 11, 4]);
      expect(dayStart.hour).toBe(0);

      const night = JSTDateTime.fromComponents(2026, 11, 4, 23, 59, 59);
      expect(night.serviceDayStart().day).toBe(4);
    });

    it('深夜0〜2時台は前日の0時を返す（GTFSの前日24時以降扱い）', () => {
      const midnight = JSTDateTime.fromComponents(2026, 11, 4, 0, 0, 0);
      expect(midnight.serviceDayStart().day).toBe(3);

      const lateNight = JSTDateTime.fromComponents(2026, 11, 4, 1, 30, 0);
      const start = lateNight.serviceDayStart();
      expect([start.year, start.month, start.day]).toEqual([2026, 11, 3]);
      expect([start.hour, start.minute, start.second]).toEqual([0, 0, 0]);

      const edge = JSTDateTime.fromComponents(2026, 11, 4, 2, 59, 59);
      expect(edge.serviceDayStart().day).toBe(3);
    });

    it('月初・年初の深夜も正しく前日に戻る', () => {
      const monthEdge = JSTDateTime.fromComponents(2026, 11, 1, 1, 0, 0);
      const monthStart = monthEdge.serviceDayStart();
      expect([monthStart.year, monthStart.month, monthStart.day]).toEqual([2026, 10, 31]);

      const yearEdge = JSTDateTime.fromComponents(2027, 1, 1, 0, 30, 0);
      const yearStart = yearEdge.serviceDayStart();
      expect([yearStart.year, yearStart.month, yearStart.day]).toEqual([2026, 12, 31]);
    });

    it('検索規則との整合: サービス日のwithTime(25:30)が実際の深夜1:30になる', () => {
      // 火曜1:00に検索すると前日(月曜)サービスの25:30便が返る。
      // serviceDayStart(月曜0:00)にwithTimeを適用すると火曜1:30になる
      const tuesday1am = JSTDateTime.fromComponents(2026, 11, 3, 1, 0, 0);
      const arrival = tuesday1am.serviceDayStart().withTime(GTFSTime.fromString('25:30:00'));
      expect([arrival.month, arrival.day, arrival.hour, arrival.minute]).toEqual([11, 3, 1, 30]);
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

    it('JST早朝（UTC日付が前日の時間帯）でも正しい曜日を返す', () => {
      // 本番WorkerはUTCで動く。JST月曜5:00はUTCでは日曜20:00なので、
      // ローカルTZのgetDay()を使うと日曜(6)を返してしまう回帰を防ぐ
      // （このバグにより毎朝9時まで前日の時刻表が表示されていた）
      const monday5am = JSTDateTime.fromComponents(2026, 9, 14, 5, 0, 0); // 月曜 5:00 JST
      expect(monday5am.getWeekday()).toBe(0);

      const sundayLate = JSTDateTime.fromComponents(2026, 9, 13, 8, 59, 59); // 日曜 8:59 JST
      expect(sundayLate.getWeekday()).toBe(6);
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
