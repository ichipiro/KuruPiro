import { describe, it, expect } from 'vitest';
import { Delay } from '@/domain/value-objects/identifiers';

describe('Delay', () => {
  describe('fromSeconds', () => {
    it('秒数から遅延を生成できる', () => {
      const delay = Delay.fromSeconds(180);
      expect(delay.seconds).toBe(180);
    });
  });

  describe('none', () => {
    it('遅延なしを生成できる', () => {
      const delay = Delay.none();
      expect(delay.seconds).toBe(0);
      expect(delay.hasDelay()).toBe(false);
    });
  });

  describe('fromMinutes', () => {
    it('分数から遅延を生成できる', () => {
      const delay = Delay.fromMinutes(3);
      expect(delay.seconds).toBe(180);
      expect(delay.minutes).toBe(3);
    });
  });

  describe('hasDelay', () => {
    it('遅延がある場合はtrueを返す', () => {
      const delay = Delay.fromSeconds(60);
      expect(delay.hasDelay()).toBe(true);
    });

    it('遅延がない場合はfalseを返す', () => {
      const delay = Delay.fromSeconds(0);
      expect(delay.hasDelay()).toBe(false);
    });
  });

  describe('minutes', () => {
    it('秒を分に変換して返す（切り上げ）', () => {
      const delay = Delay.fromSeconds(61);
      expect(delay.minutes).toBe(2); // 61秒 → 2分に切り上げ
    });

    it('ちょうど1分の場合', () => {
      const delay = Delay.fromSeconds(60);
      expect(delay.minutes).toBe(1);
    });
  });

  describe('toDisplayString', () => {
    it('遅延がない場合は空文字を返す', () => {
      const delay = Delay.none();
      expect(delay.toDisplayString()).toBe('');
    });

    it('遅延がある場合は「X分遅れ」を返す', () => {
      const delay = Delay.fromMinutes(5);
      expect(delay.toDisplayString()).toBe('5分遅れ');
    });

    it('秒から分に変換した場合（切り上げ）', () => {
      const delay = Delay.fromSeconds(61);
      expect(delay.toDisplayString()).toBe('2分遅れ');
    });
  });

  describe('equals', () => {
    it('同じ遅延時間の場合はtrueを返す', () => {
      const delay1 = Delay.fromSeconds(180);
      const delay2 = Delay.fromSeconds(180);
      expect(delay1.equals(delay2)).toBe(true);
    });

    it('異なる遅延時間の場合はfalseを返す', () => {
      const delay1 = Delay.fromSeconds(180);
      const delay2 = Delay.fromSeconds(120);
      expect(delay1.equals(delay2)).toBe(false);
    });
  });
});
