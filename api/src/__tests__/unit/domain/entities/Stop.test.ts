import { describe, it, expect } from 'vitest';
import { Stop } from '@/domain/entities/Stop';
import { StopId } from '@/domain/value-objects/StopId';

describe('Stop', () => {
  describe('create', () => {
    it('正常な値でStopを生成できる', () => {
      const stopId = StopId.fromString('STOP_001');
      const stop = Stop.create(stopId, '三島駅');

      expect(stop.id.value).toBe('STOP_001');
      expect(stop.name).toBe('三島駅');
    });

    it('名前が空文字列の場合はエラーをスローする', () => {
      const stopId = StopId.fromString('STOP_001');
      expect(() => Stop.create(stopId, '')).toThrow('Stop name cannot be empty');
    });

    it('名前が空白のみの場合はエラーをスローする', () => {
      const stopId = StopId.fromString('STOP_001');
      expect(() => Stop.create(stopId, '   ')).toThrow('Stop name cannot be empty');
    });

    it('名前の前後の空白はトリムされる', () => {
      const stopId = StopId.fromString('STOP_001');
      const stop = Stop.create(stopId, '  三島駅  ');

      expect(stop.name).toBe('三島駅');
    });
  });

  describe('equals', () => {
    it('同じIDの停留所はequalsでtrueを返す', () => {
      const stopId1 = StopId.fromString('STOP_001');
      const stopId2 = StopId.fromString('STOP_001');
      const stop1 = Stop.create(stopId1, '三島駅');
      const stop2 = Stop.create(stopId2, '三島駅（北口）');

      expect(stop1.equals(stop2)).toBe(true);
    });

    it('異なるIDの停留所はequalsでfalseを返す', () => {
      const stopId1 = StopId.fromString('STOP_001');
      const stopId2 = StopId.fromString('STOP_002');
      const stop1 = Stop.create(stopId1, '三島駅');
      const stop2 = Stop.create(stopId2, '三島駅');

      expect(stop1.equals(stop2)).toBe(false);
    });
  });

  describe('getDisplayInfo', () => {
    it('表示用の情報を返す', () => {
      const stopId = StopId.fromString('MISHIMA_STA');
      const stop = Stop.create(stopId, '三島駅');
      const info = stop.getDisplayInfo();

      expect(info).toEqual({
        id: 'MISHIMA_STA',
        name: '三島駅',
      });
    });
  });
});
