import { eq } from 'drizzle-orm';
import { ITripRepository } from '@/domain/repositories';
import { Trip } from '@/domain/entities/Trip';
import { TripId } from '@/domain/value-objects/identifiers';
import { getDBClient } from '@/db/client';
import { trips } from '@/db/schema';
import { TripMapper } from '../mappers';

/**
 * Drizzle ORMを使用したTripリポジトリの実装
 */
export class DrizzleTripRepository implements ITripRepository {
  constructor(private readonly d1: D1Database) {}

  /**
   * IDでトリップを検索
   */
  async findById(id: TripId): Promise<Trip | undefined> {
    const db = getDBClient(this.d1);

    const result = await db
      .select()
      .from(trips)
      .where(eq(trips.tripId, id.value))
      .limit(1);

    if (result.length === 0) {
      return undefined;
    }

    return TripMapper.toDomain(result[0]);
  }

  /**
   * サービスIDでトリップを検索
   */
  async findByServiceId(serviceId: string): Promise<Trip[]> {
    const db = getDBClient(this.d1);

    const results = await db
      .select()
      .from(trips)
      .where(eq(trips.serviceId, serviceId));

    return results.map((record) => TripMapper.toDomain(record));
  }

  /**
   * 路線IDでトリップを検索
   */
  async findByRouteId(routeId: string): Promise<Trip[]> {
    const db = getDBClient(this.d1);

    const results = await db
      .select()
      .from(trips)
      .where(eq(trips.routeId, routeId));

    return results.map((record) => TripMapper.toDomain(record));
  }
}
