import { describe, it, expect } from 'vitest';
import { GTFSTime } from '@/domain/value-objects/time';

describe('GTFSTime', () => {
  describe('fromString', () => {
    it('通常のGTFS時刻形式をパースできる', () => {
      const time = GTFSTime.fromString('14:30:00');
      expect(time.value).toBe('14:30:00');
    });

    it('24時間超の時刻形式をパースできる（深夜バス対応）', () => {
      const time = GTFSTime.fromString('25:15:00');
      expect(time.value).toBe('25:15:00');
    });

    it('0時台の時刻をパースできる', () => {
      const time = GTFSTime.fromString('00:00:00');
      expect(time.value).toBe('00:00:00');
    });

    it('23時台の時刻をパースできる', () => {
      const time = GTFSTime.fromString('23:59:59');
      expect(time.value).toBe('23:59:59');
    });

    it('26時以降の時刻もパースできる', () => {
      const time = GTFSTime.fromString('27:30:00');
      expect(time.value).toBe('27:30:00');
    });

    it('不正な形式の場合はエラーをスローする', () => {
      expect(() => GTFSTime.fromString('invalid')).toThrow();
    });

    it('HH:MM形式（秒なし）の場合はエラーをスローする', () => {
      expect(() => GTFSTime.fromString('14:30')).toThrow();
    });

    it('負の値の場合はエラーをスローする', () => {
      expect(() => GTFSTime.fromString('-01:00:00')).toThrow();
    });

    it('60分以上の場合はエラーをスローする', () => {
      expect(() => GTFSTime.fromString('14:60:00')).toThrow();
    });

    it('60秒以上の場合はエラーをスローする', () => {
      expect(() => GTFSTime.fromString('14:30:60')).toThrow();
    });
  });

  describe('fromComponents', () => {
    it('時・分・秒からGTFSTimeを生成できる', () => {
      const time = GTFSTime.fromComponents(14, 30, 0);
      expect(time.value).toBe('14:30:00');
    });

    it('24時間超の時刻を生成できる', () => {
      const time = GTFSTime.fromComponents(25, 30, 0);
      expect(time.value).toBe('25:30:00');
    });

    it('0時台の時刻を生成できる', () => {
      const time = GTFSTime.fromComponents(0, 0, 0);
      expect(time.value).toBe('00:00:00');
    });

    it('秒が59の時刻を生成できる', () => {
      const time = GTFSTime.fromComponents(10, 30, 59);
      expect(time.value).toBe('10:30:59');
    });

    it('負の時の場合はエラーをスローする', () => {
      expect(() => GTFSTime.fromComponents(-1, 0, 0)).toThrow();
    });

    it('負の分の場合はエラーをスローする', () => {
      expect(() => GTFSTime.fromComponents(10, -1, 0)).toThrow();
    });

    it('負の秒の場合はエラーをスローする', () => {
      expect(() => GTFSTime.fromComponents(10, 30, -1)).toThrow();
    });

    it('60分以上の場合はエラーをスローする', () => {
      expect(() => GTFSTime.fromComponents(10, 60, 0)).toThrow();
    });

    it('60秒以上の場合はエラーをスローする', () => {
      expect(() => GTFSTime.fromComponents(10, 30, 60)).toThrow();
    });
  });

  describe('toMinutes', () => {
    it('通常の時刻を分に変換できる', () => {
      const time = GTFSTime.fromString('14:30:00');
      expect(time.toMinutes()).toBe(14 * 60 + 30);
    });

    it('24時間超の時刻を分に変換できる', () => {
      const time = GTFSTime.fromString('25:15:00');
      expect(time.toMinutes()).toBe(25 * 60 + 15);
    });

    it('0時台の時刻を分に変換できる', () => {
      const time = GTFSTime.fromString('00:15:00');
      expect(time.toMinutes()).toBe(15);
    });
  });

  describe('isAfterMidnight', () => {
    it('24時間未満の場合はfalseを返す', () => {
      const time = GTFSTime.fromString('23:59:59');
      expect(time.isAfterMidnight()).toBe(false);
    });

    it('24時間以上の場合はtrueを返す', () => {
      const time = GTFSTime.fromString('24:00:00');
      expect(time.isAfterMidnight()).toBe(true);
    });

    it('25時台の場合はtrueを返す', () => {
      const time = GTFSTime.fromString('25:30:00');
      expect(time.isAfterMidnight()).toBe(true);
    });
  });

  describe('getActualHour', () => {
    it('通常の時刻の場合はそのまま時を返す', () => {
      const time = GTFSTime.fromString('14:30:00');
      expect(time.getActualHour()).toBe(14);
    });

    it('24時台の場合は0を返す', () => {
      const time = GTFSTime.fromString('24:30:00');
      expect(time.getActualHour()).toBe(0);
    });

    it('25時台の場合は1を返す', () => {
      const time = GTFSTime.fromString('25:30:00');
      expect(time.getActualHour()).toBe(1);
    });

    it('26時台の場合は2を返す', () => {
      const time = GTFSTime.fromString('26:15:00');
      expect(time.getActualHour()).toBe(2);
    });
  });

  describe('getDaysOffset', () => {
    it('24時間未満の場合は0を返す', () => {
      const time = GTFSTime.fromString('23:59:59');
      expect(time.getDaysOffset()).toBe(0);
    });

    it('24時台の場合は1を返す', () => {
      const time = GTFSTime.fromString('24:30:00');
      expect(time.getDaysOffset()).toBe(1);
    });

    it('25時台の場合は1を返す', () => {
      const time = GTFSTime.fromString('25:30:00');
      expect(time.getDaysOffset()).toBe(1);
    });

    it('48時台の場合は2を返す', () => {
      const time = GTFSTime.fromString('48:00:00');
      expect(time.getDaysOffset()).toBe(2);
    });
  });

  describe('getHour', () => {
    it('時間部分を返す', () => {
      const time = GTFSTime.fromString('14:30:45');
      expect(time.getHour()).toBe(14);
    });

    it('24時間超の場合もそのまま返す', () => {
      const time = GTFSTime.fromString('25:30:00');
      expect(time.getHour()).toBe(25);
    });
  });

  describe('getMinute', () => {
    it('分部分を返す', () => {
      const time = GTFSTime.fromString('14:30:45');
      expect(time.getMinute()).toBe(30);
    });
  });

  describe('getSecond', () => {
    it('秒部分を返す', () => {
      const time = GTFSTime.fromString('14:30:45');
      expect(time.getSecond()).toBe(45);
    });
  });

  describe('compareTo', () => {
    it('同じ時刻の場合は0を返す', () => {
      const time1 = GTFSTime.fromString('14:30:00');
      const time2 = GTFSTime.fromString('14:30:00');
      expect(time1.compareTo(time2)).toBe(0);
    });

    it('前の時刻の場合は負の値を返す', () => {
      const time1 = GTFSTime.fromString('14:30:00');
      const time2 = GTFSTime.fromString('15:00:00');
      expect(time1.compareTo(time2)).toBeLessThan(0);
    });

    it('後の時刻の場合は正の値を返す', () => {
      const time1 = GTFSTime.fromString('15:00:00');
      const time2 = GTFSTime.fromString('14:30:00');
      expect(time1.compareTo(time2)).toBeGreaterThan(0);
    });

    it('24時間超の時刻も正しく比較できる', () => {
      const time1 = GTFSTime.fromString('25:00:00');
      const time2 = GTFSTime.fromString('24:30:00');
      expect(time1.compareTo(time2)).toBeGreaterThan(0);
    });
  });

  describe('isAfter', () => {
    it('後の時刻の場合はtrueを返す', () => {
      const time1 = GTFSTime.fromString('15:00:00');
      const time2 = GTFSTime.fromString('14:30:00');
      expect(time1.isAfter(time2)).toBe(true);
    });

    it('前の時刻の場合はfalseを返す', () => {
      const time1 = GTFSTime.fromString('14:30:00');
      const time2 = GTFSTime.fromString('15:00:00');
      expect(time1.isAfter(time2)).toBe(false);
    });

    it('同じ時刻の場合はfalseを返す', () => {
      const time1 = GTFSTime.fromString('14:30:00');
      const time2 = GTFSTime.fromString('14:30:00');
      expect(time1.isAfter(time2)).toBe(false);
    });
  });

  describe('isBefore', () => {
    it('前の時刻の場合はtrueを返す', () => {
      const time1 = GTFSTime.fromString('14:30:00');
      const time2 = GTFSTime.fromString('15:00:00');
      expect(time1.isBefore(time2)).toBe(true);
    });

    it('後の時刻の場合はfalseを返す', () => {
      const time1 = GTFSTime.fromString('15:00:00');
      const time2 = GTFSTime.fromString('14:30:00');
      expect(time1.isBefore(time2)).toBe(false);
    });

    it('同じ時刻の場合はfalseを返す', () => {
      const time1 = GTFSTime.fromString('14:30:00');
      const time2 = GTFSTime.fromString('14:30:00');
      expect(time1.isBefore(time2)).toBe(false);
    });
  });

  describe('equals', () => {
    it('同じ時刻の場合はtrueを返す', () => {
      const time1 = GTFSTime.fromString('14:30:00');
      const time2 = GTFSTime.fromString('14:30:00');
      expect(time1.equals(time2)).toBe(true);
    });

    it('異なる時刻の場合はfalseを返す', () => {
      const time1 = GTFSTime.fromString('14:30:00');
      const time2 = GTFSTime.fromString('15:00:00');
      expect(time1.equals(time2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('HH:MM:SS形式で文字列を返す', () => {
      const time = GTFSTime.fromString('14:30:00');
      expect(time.toString()).toBe('14:30:00');
    });

    it('24時間超でもそのまま返す', () => {
      const time = GTFSTime.fromString('25:15:00');
      expect(time.toString()).toBe('25:15:00');
    });
  });

  describe('toDisplayString', () => {
    it('HH:MM形式で表示用文字列を返す', () => {
      const time = GTFSTime.fromString('14:30:45');
      expect(time.toDisplayString()).toBe('14:30');
    });

    it('24時間超の場合は実際の時刻に変換して表示', () => {
      const time = GTFSTime.fromString('25:15:00');
      expect(time.toDisplayString()).toBe('01:15');
    });
  });
});
