import { describe, it, expect } from 'vitest';
import { RemainingTime } from '@/domain/value-objects/RemainingTime';

describe('RemainingTime', () => {
  describe('fromMinutes', () => {
    it('分数から残り時間を生成できる', () => {
      const time = RemainingTime.fromMinutes(15);
      expect(time.minutes).toBe(15);
    });

    it('負の値の場合は0にする', () => {
      const time = RemainingTime.fromMinutes(-5);
      expect(time.minutes).toBe(0);
    });
  });

  describe('fromMilliseconds', () => {
    it('ミリ秒から残り時間を生成できる', () => {
      const time = RemainingTime.fromMilliseconds(60000); // 1分
      expect(time.minutes).toBe(1);
    });

    it('ミリ秒を分に変換（切り捨て）', () => {
      const time = RemainingTime.fromMilliseconds(90000); // 1分30秒
      expect(time.minutes).toBe(1); // 1分に切り捨て
    });

    it('負の値の場合は0にする', () => {
      const time = RemainingTime.fromMilliseconds(-60000);
      expect(time.minutes).toBe(0);
    });
  });

  describe('isArriving', () => {
    it('0分の場合はtrueを返す', () => {
      const time = RemainingTime.fromMinutes(0);
      expect(time.isArriving()).toBe(true);
    });

    it('1分の場合はtrueを返す', () => {
      const time = RemainingTime.fromMinutes(1);
      expect(time.isArriving()).toBe(true);
    });

    it('2分以上の場合はfalseを返す', () => {
      const time = RemainingTime.fromMinutes(2);
      expect(time.isArriving()).toBe(false);
    });
  });

  describe('toDisplayString', () => {
    it('0分の場合は「まもなく到着」を返す', () => {
      const time = RemainingTime.fromMinutes(0);
      expect(time.toDisplayString()).toBe('まもなく到着');
    });

    it('1分の場合は「まもなく到着」を返す', () => {
      const time = RemainingTime.fromMinutes(1);
      expect(time.toDisplayString()).toBe('まもなく到着');
    });

    it('2分以上の場合は「あとX分」を返す', () => {
      const time = RemainingTime.fromMinutes(5);
      expect(time.toDisplayString()).toBe('あと5分');
    });

    it('24時間以上の異常値の場合は「まもなく到着」を返す', () => {
      const time = RemainingTime.fromMinutes(1500); // 25時間
      expect(time.toDisplayString()).toBe('まもなく到着');
    });
  });

  describe('equals', () => {
    it('同じ残り時間の場合はtrueを返す', () => {
      const time1 = RemainingTime.fromMinutes(15);
      const time2 = RemainingTime.fromMinutes(15);
      expect(time1.equals(time2)).toBe(true);
    });

    it('異なる残り時間の場合はfalseを返す', () => {
      const time1 = RemainingTime.fromMinutes(15);
      const time2 = RemainingTime.fromMinutes(10);
      expect(time1.equals(time2)).toBe(false);
    });
  });
});
