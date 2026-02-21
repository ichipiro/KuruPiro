import type { IRealtimeRepository } from '@/domain/repositories';

export interface CacheInfoDTO {
  lastUpdatedAt: string;
  ageSeconds: number;
  totalTrips: number;
  now: string;
  tripIds?: string[];
}

export class GetCacheInfoUseCase {
  constructor(private readonly realtimeRepo: IRealtimeRepository) {}

  async execute(includeTripIds: boolean): Promise<CacheInfoDTO> {
    const [lastUpdated, allUpdates] = await Promise.all([
      this.realtimeRepo.getLastUpdatedAt(),
      this.realtimeRepo.getAllTripUpdates(),
    ]);

    const now = Date.now();
    const dto: CacheInfoDTO = {
      lastUpdatedAt: new Date(lastUpdated).toISOString(),
      ageSeconds: Math.floor((now - lastUpdated) / 1000),
      totalTrips: allUpdates.length,
      now: new Date(now).toISOString(),
    };

    if (includeTripIds) {
      dto.tripIds = allUpdates.map((u) => u.tripId.value);
    }

    return dto;
  }
}
