import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetStopNameUseCase } from '@/application/use-cases/GetStopNameUseCase';
import { StopId } from '@/domain/value-objects/StopId';
import { Stop } from '@/domain/entities/Stop';
import type { IStopRepository } from '@/domain/repositories/IStopRepository';

describe('GetStopNameUseCase', () => {
  let useCase: GetStopNameUseCase;
  let mockStopRepo: IStopRepository;

  beforeEach(() => {
    mockStopRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
    } as unknown as IStopRepository;

    useCase = new GetStopNameUseCase(mockStopRepo);
  });

  describe('execute', () => {
    it('should return stop name when stop exists', async () => {
      const stopId = StopId.fromString('test_stop');
      const stop = Stop.create(stopId, '東京駅');

      vi.mocked(mockStopRepo.findById).mockResolvedValue(stop);

      const result = await useCase.execute(stopId);

      expect(result).toEqual({
        stopId: 'test_stop',
        stopName: '東京駅',
      });
      expect(mockStopRepo.findById).toHaveBeenCalledWith(stopId);
    });

    it('should return undefined when stop does not exist', async () => {
      const stopId = StopId.fromString('unknown_stop');

      vi.mocked(mockStopRepo.findById).mockResolvedValue(undefined);

      const result = await useCase.execute(stopId);

      expect(result).toBeUndefined();
      expect(mockStopRepo.findById).toHaveBeenCalledWith(stopId);
    });

    it('should normalize stop id with spaces', async () => {
      const stopId = StopId.fromString('test stop'); // Will be normalized to test_stop
      const stop = Stop.create(stopId, '東京駅');

      vi.mocked(mockStopRepo.findById).mockResolvedValue(stop);

      const result = await useCase.execute(stopId);

      expect(result).toEqual({
        stopId: 'test_stop',
        stopName: '東京駅',
      });
    });
  });
});
