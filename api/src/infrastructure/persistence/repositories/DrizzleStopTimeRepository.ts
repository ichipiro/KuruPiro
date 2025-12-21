import { eq, and, asc } from 'drizzle-orm';
import { IStopTimeRepository } from '@/domain/repositories/IStopTimeRepository';
import { StopTime } from '@/domain/entities/StopTime';
import { TripId } from '@/domain/value-objects/TripId';
import { StopId } from '@/domain/value-objects/StopId';
import { getDBClient } from '@/db/client';
import { stopTimes } from '@/db/schema';
import { StopTimeMapper } from '../mappers/StopTimeMapper';

/**
 * Drizzle ORMを使用したStopTimeリポジトリの実装
 */
export class DrizzleStopTimeRepository implements IStopTimeRepository {
  constructor(private readonly d1: D1Database) {}

  /**
   * トリップIDで停車時刻を検索（順序順）
   */
  async findByTripId(tripId: TripId): Promise<StopTime[]> {
    const db = getDBClient(this.d1);

    const results = await db
      .select()
      .from(stopTimes)
      .where(eq(stopTimes.tripId, tripId.value))
      .orderBy(asc(stopTimes.stopSequence));

    return results.map((record) => StopTimeMapper.toDomain(record));
  }

  /**
   * 停留所IDで停車時刻を検索
   */
  async findByStopId(stopId: StopId): Promise<StopTime[]> {
    const db = getDBClient(this.d1);

    const results = await db
      .select()
      .from(stopTimes)
      .where(eq(stopTimes.stopId, stopId.value));

    return results.map((record) => StopTimeMapper.toDomain(record));
  }

  /**
   * トリップIDと停留所IDで停車時刻を検索
   */
  async findByTripAndStop(
    tripId: TripId,
    stopId: StopId
  ): Promise<StopTime | undefined> {
    const db = getDBClient(this.d1);

    const result = await db
      .select()
      .from(stopTimes)
      .where(
        and(
          eq(stopTimes.tripId, tripId.value),
          eq(stopTimes.stopId, stopId.value)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return undefined;
    }

    return StopTimeMapper.toDomain(result[0]);
  }
}
