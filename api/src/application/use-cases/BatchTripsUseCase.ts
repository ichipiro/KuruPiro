import type { StopId } from '@/domain/value-objects/identifiers';
import type { JSTDateTime } from '@/domain/value-objects/time';
import type { NextBusDTO } from '@/application/dto/NextBusDTO';
import type { FindNextBusesUseCase } from './FindNextBusesUseCase';

export interface BatchTripQuery {
  originId: StopId;
  destinationIds: StopId[];
  viaIds?: StopId[];
  limit: number;
  currentDateTime: JSTDateTime;
}

export class BatchTripsUseCase {
  constructor(private readonly findNextBuses: FindNextBusesUseCase) {}

  async execute(queries: BatchTripQuery[]): Promise<NextBusDTO[][]> {
    return Promise.all(
      queries.map((q) =>
        this.findNextBuses.execute(
          q.originId,
          q.destinationIds,
          q.currentDateTime,
          q.viaIds,
          q.limit
        )
      )
    );
  }
}
