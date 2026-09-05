import { eq, and, asc, inArray } from 'drizzle-orm';
import { IStopTimeRepository } from '@/domain/repositories';
import { StopTime } from '@/domain/entities/StopTime';
import { TripId, StopId } from '@/domain/value-objects/identifiers';
import { getDBClient } from '@/db/client';
import { stopTimes } from '@/db/schema';
import { StopTimeMapper } from '../mappers';

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
   * 複数のトリップIDの停車時刻をまとめて検索（順序順）
   */
  async findByTripIds(tripIds: TripId[]): Promise<Map<string, StopTime[]>> {
    const byTripId = new Map<string, StopTime[]>();

    const uniqueIds = [...new Set(tripIds.map((id) => id.value))];
    if (uniqueIds.length === 0) {
      return byTripId;
    }

    const db = getDBClient(this.d1);

    const results = await db
      .select()
      .from(stopTimes)
      .where(inArray(stopTimes.tripId, uniqueIds))
      .orderBy(asc(stopTimes.tripId), asc(stopTimes.stopSequence));

    for (const record of results) {
      const stopTime = StopTimeMapper.toDomain(record);
      const existing = byTripId.get(record.tripId);
      if (existing) {
        existing.push(stopTime);
      } else {
        byTripId.set(record.tripId, [stopTime]);
      }
    }

    return byTripId;
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
