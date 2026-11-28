import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetRealtimeFreshnessUseCase } from '@/application/use-cases/GetRealtimeFreshnessUseCase';
import type { IRealtimeRepository } from '@/domain/repositories';

describe('GetRealtimeFreshnessUseCase', () => {
  let mockRealtimeRepo: IRealtimeRepository;

  beforeEach(() => {
    mockRealtimeRepo = {
      getAllTripUpdates: vi.fn(),
      getTripUpdate: vi.fn(),
      getTripUpdatesForTrips: vi.fn(),
      getLastUpdatedAt: vi.fn(),
      forceUpdate: vi.fn(),
    } as unknown as IRealtimeRepository;
  });

  it('should return the last updated timestamp while realtime is served', async () => {
    vi.mocked(mockRealtimeRepo.getLastUpdatedAt).mockResolvedValue(1759000000000);

    const result = await new GetRealtimeFreshnessUseCase(mockRealtimeRepo).execute();

    expect(result).toBe(1759000000000);
  });

  it('should return null when realtime is unavailable', async () => {
    vi.mocked(mockRealtimeRepo.getLastUpdatedAt).mockResolvedValue(null);

    const result = await new GetRealtimeFreshnessUseCase(mockRealtimeRepo).execute();

    expect(result).toBeNull();
  });

  it('should return null instead of failing the response when the repository throws', async () => {
    vi.mocked(mockRealtimeRepo.getLastUpdatedAt).mockRejectedValue(new Error('R2 down'));

    const result = await new GetRealtimeFreshnessUseCase(mockRealtimeRepo).execute();

    expect(result).toBeNull();
  });
});
