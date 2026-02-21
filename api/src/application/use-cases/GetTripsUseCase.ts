import type { StopId } from '@/domain/value-objects/identifiers';
import type { JSTDateTime } from '@/domain/value-objects/time';
import type { NextBusDTO } from '@/application/dto/NextBusDTO';
import type { FindNextBusesUseCase } from './FindNextBusesUseCase';

export interface GetTripsQuery {
  originIds: StopId[];
  destinationIds: StopId[];
  viaIds?: StopId[];
  limit: number;
  currentDateTime: JSTDateTime;
}

export type GetTripsResult =
  | { type: 'single'; buses: NextBusDTO[] }
  | { type: 'multiple'; busesPerOrigin: Record<string, NextBusDTO[]> };

export class GetTripsUseCase {
  constructor(private readonly findNextBuses: FindNextBusesUseCase) {}

  async execute(query: GetTripsQuery): Promise<GetTripsResult> {
    if (query.originIds.length > 1) {
      const entries = await Promise.all(
        query.originIds.map(async (id) => {
          const buses = await this.findNextBuses.execute(
            id,
            query.destinationIds,
            query.currentDateTime,
            query.viaIds,
            query.limit
          );
          return [id.value, buses] as const;
        })
      );
      return { type: 'multiple', busesPerOrigin: Object.fromEntries(entries) };
    }

    const buses = await this.findNextBuses.execute(
      query.originIds[0],
      query.destinationIds,
      query.currentDateTime,
      query.viaIds,
      query.limit
    );
    return { type: 'single', buses };
  }
}
