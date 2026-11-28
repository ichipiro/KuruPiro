import type { IRealtimeRepository } from '@/domain/repositories';

export interface CacheInfoDTO {
  /** 提供中リアルタイムデータの取得時刻。リアルタイムなし（stale落ち含む）の場合はnull */
  lastUpdatedAt: string | null;
  /** 取得からの経過秒数。リアルタイムなしの場合はnull */
  ageSeconds: number | null;
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
      lastUpdatedAt: lastUpdated !== null ? new Date(lastUpdated).toISOString() : null,
      ageSeconds: lastUpdated !== null ? Math.floor((now - lastUpdated) / 1000) : null,
      totalTrips: allUpdates.length,
      now: new Date(now).toISOString(),
    };

    if (includeTripIds) {
      dto.tripIds = allUpdates.map((u) => u.tripId.value);
    }

    return dto;
  }
}
