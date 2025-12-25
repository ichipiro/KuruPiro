import { describe, it, expect } from 'vitest';
import { StopId } from '@/domain/value-objects/identifiers';

describe('StopId', () => {
  describe('fromString', () => {
    it('文字列から停留所IDを生成できる', () => {
      const stopId = StopId.fromString('STOP_001');
      expect(stopId.value).toBe('STOP_001');
    });

    it('スペースをアンダースコアに正規化する', () => {
      const stopId = StopId.fromString('STOP 001');
      expect(stopId.value).toBe('STOP_001');
    });

    it('複数のスペースをアンダースコアに正規化する', () => {
      const stopId = StopId.fromString('STOP  001  A');
      expect(stopId.value).toBe('STOP_001_A');
    });

    it('空文字列の場合はエラーをスローする', () => {
      expect(() => StopId.fromString('')).toThrow();
    });

    it('空白のみの場合はエラーをスローする', () => {
      expect(() => StopId.fromString('   ')).toThrow();
    });
  });

  describe('equals', () => {
    it('同じ値の場合はtrueを返す', () => {
      const stopId1 = StopId.fromString('STOP_001');
      const stopId2 = StopId.fromString('STOP_001');
      expect(stopId1.equals(stopId2)).toBe(true);
    });

    it('異なる値の場合はfalseを返す', () => {
      const stopId1 = StopId.fromString('STOP_001');
      const stopId2 = StopId.fromString('STOP_002');
      expect(stopId1.equals(stopId2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('文字列表現を返す', () => {
      const stopId = StopId.fromString('STOP_001');
      expect(stopId.toString()).toBe('STOP_001');
    });
  });
});
