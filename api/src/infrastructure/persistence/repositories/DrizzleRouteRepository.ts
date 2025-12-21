import { eq } from 'drizzle-orm';
import { IRouteRepository } from '@/domain/repositories/IRouteRepository';
import { Route } from '@/domain/entities/Route';
import { getDBClient } from '@/db/client';
import { routes } from '@/db/schema';
import { RouteMapper } from '../mappers/RouteMapper';

/**
 * Drizzle ORMを使用したRouteリポジトリの実装
 */
export class DrizzleRouteRepository implements IRouteRepository {
  constructor(private readonly d1: D1Database) {}

  /**
   * IDで路線を検索
   */
  async findById(routeId: string): Promise<Route | undefined> {
    const db = getDBClient(this.d1);

    const result = await db
      .select()
      .from(routes)
      .where(eq(routes.routeId, routeId))
      .limit(1);

    if (result.length === 0) {
      return undefined;
    }

    return RouteMapper.toDomain(result[0]);
  }

  /**
   * 全ての路線を取得
   */
  async findAll(): Promise<Route[]> {
    const db = getDBClient(this.d1);

    const results = await db.select().from(routes);

    return results.map((record) => RouteMapper.toDomain(record));
  }
}
