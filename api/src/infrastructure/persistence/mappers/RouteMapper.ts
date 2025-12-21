import { Route } from '@/domain/entities/Route';

/**
 * DBレコードからRouteエンティティへの変換を行うマッパー
 */
export class RouteMapper {
  /**
   * DBレコードからRouteエンティティに変換
   */
  static toDomain(record: {
    routeId: string;
    routeShortName: string;
    destinationStop?: string | null;
  }): Route {
    return Route.create(
      record.routeId,
      record.routeShortName,
      record.destinationStop ?? undefined
    );
  }

  /**
   * RouteエンティティからDBレコードに変換
   * （今回は読み取り専用なので使用しないが、完全性のため定義）
   */
  static toPersistence(route: Route): {
    route_id: string;
    route_short_name: string;
    destination_stop: string | null;
  } {
    return {
      route_id: route.routeId,
      route_short_name: route.shortName,
      destination_stop: route.destinationStop ?? null,
    };
  }
}
