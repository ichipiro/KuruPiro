import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GetCacheInfoUseCase } from '@/application/use-cases/GetCacheInfoUseCase';
import type { IRealtimeRepository } from '@/domain/repositories';

describe('GetCacheInfoUseCase', () => {
  let mockRealtimeRepo: IRealtimeRepository;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1759000060000);
    mockRealtimeRepo = {
      getAllTripUpdates: vi.fn().mockResolvedValue([]),
      getTripUpdate: vi.fn(),
      getTripUpdatesForTrips: vi.fn(),
      getLastUpdatedAt: vi.fn(),
      forceUpdate: vi.fn(),
    } as unknown as IRealtimeRepository;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should report the actual age while realtime is served', async () => {
    vi.mocked(mockRealtimeRepo.getLastUpdatedAt).mockResolvedValue(1759000000000);

    const dto = await new GetCacheInfoUseCase(mockRealtimeRepo).execute(false);

    expect(dto.lastUpdatedAt).toBe(new Date(1759000000000).toISOString());
    expect(dto.ageSeconds).toBe(60);
  });

  it('should report null instead of pretending to be fresh when realtime is unavailable', async () => {
    vi.mocked(mockRealtimeRepo.getLastUpdatedAt).mockResolvedValue(null);

    const dto = await new GetCacheInfoUseCase(mockRealtimeRepo).execute(false);

    expect(dto.lastUpdatedAt).toBeNull();
    expect(dto.ageSeconds).toBeNull();
    expect(dto.totalTrips).toBe(0);
  });
});
