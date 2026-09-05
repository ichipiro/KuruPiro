import { eq, inArray } from 'drizzle-orm';
import { IStopRepository } from '@/domain/repositories';
import { Stop } from '@/domain/entities/Stop';
import { StopId } from '@/domain/value-objects/identifiers';
import { getDBClient } from '@/db/client';
import { stops } from '@/db/schema';
import { StopMapper } from '../mappers';

/**
 * Drizzle ORMを使用したStopリポジトリの実装
 */
export class DrizzleStopRepository implements IStopRepository {
  constructor(private readonly d1: D1Database) {}

  /**
   * IDで停留所を検索
   */
  async findById(id: StopId): Promise<Stop | undefined> {
    const db = getDBClient(this.d1);

    const result = await db
      .select()
      .from(stops)
      .where(eq(stops.stopId, id.value))
      .limit(1);

    if (result.length === 0) {
      return undefined;
    }

    return StopMapper.toDomain(result[0]);
  }

  /**
   * 停留所名で検索
   */
  async findNameById(id: StopId): Promise<string> {
    const stop = await this.findById(id);
    return stop?.name ?? '';
  }

  /**
   * 複数の停留所名をまとめて検索
   */
  async findNamesByIds(ids: StopId[]): Promise<Map<string, string>> {
    const names = new Map<string, string>();

    const uniqueIds = [...new Set(ids.map((id) => id.value))];
    if (uniqueIds.length === 0) {
      return names;
    }

    const db = getDBClient(this.d1);

    const results = await db
      .select({ stopId: stops.stopId, stopName: stops.stopName })
      .from(stops)
      .where(inArray(stops.stopId, uniqueIds));

    for (const record of results) {
      names.set(record.stopId, record.stopName);
    }

    return names;
  }

  /**
   * 全ての停留所を取得
   */
  async findAll(): Promise<Stop[]> {
    const db = getDBClient(this.d1);

    const results = await db.select().from(stops);

    return results.map((record) => StopMapper.toDomain(record));
  }
}
