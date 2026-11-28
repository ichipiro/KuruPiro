import type { Context } from 'hono';
import type { ServiceFactory } from '@/infrastructure/di/ServiceFactory';
import { StopId } from '@/domain/value-objects/identifiers';
import * as GetTripsQueryParser from '@/presentation/requests/GetTripsQueryParser';
import * as BatchTripsBodyParser from '@/presentation/requests/BatchTripsBodyParser';
import * as BusResponseMapper from '@/presentation/responses/BusResponseMapper';

/**
 * リアルタイム鮮度をHTTPヘッダに載せる
 *
 * 配信済みサイネージ端末がボディの配列形状をパースしているため、
 * ボディには手を入れずヘッダのみで鮮度を伝える。
 * リアルタイムなし（未取得・鮮度上限超過での提供停止）のときは両ヘッダとも付けない。
 */
function setRealtimeFreshnessHeaders(c: Context, updatedAt: number | null): void {
  if (updatedAt === null) return;
  c.header('X-Realtime-Updated-At', String(updatedAt));
  c.header('X-Realtime-Age-Seconds', String(Math.max(0, Math.floor((Date.now() - updatedAt) / 1000))));
}

export class BusController {
  static async getTrips(c: Context): Promise<Response> {
    const query = GetTripsQueryParser.parse(c);
    const factory = c.get('factory') as ServiceFactory;
    const result = await factory.getGetTripsUseCase().execute(query);
    // リポジトリがリクエスト内で最初に確定した提供判定（= 応答ボディの検索に
    // 使ったスナップショット）の鮮度が返る。検索後に境界を跨いでもズレない
    setRealtimeFreshnessHeaders(c, await factory.getGetRealtimeFreshnessUseCase().execute());
    return c.json(BusResponseMapper.fromGetTripsResult(result));
  }

  static async batchTrips(c: Context): Promise<Response> {
    const queries = await BatchTripsBodyParser.parse(c);
    const factory = c.get('factory') as ServiceFactory;
    const results = await factory.getBatchTripsUseCase().execute(queries);
    setRealtimeFreshnessHeaders(c, await factory.getGetRealtimeFreshnessUseCase().execute());
    return c.json(results.map((buses) => buses.map(BusResponseMapper.toNextBusResponse)));
  }
}

export class DebugController {
  static async updateRealtime(c: Context): Promise<Response> {
    const factory = c.get('factory') as ServiceFactory;
    const result = await factory.getForceUpdateRealtimeUseCase().execute();
    return c.json({ status: 'updated', timestamp: result.updatedAt });
  }

  static async getCacheInfo(c: Context): Promise<Response> {
    const includeTripIds = c.req.query('includeTripIds') === 'true';
    const factory = c.get('factory') as ServiceFactory;
    const dto = await factory.getGetCacheInfoUseCase().execute(includeTripIds);
    return c.json(dto);
  }

  static async getRealtimeDetail(c: Context): Promise<Response> {
    const tripId = c.req.param('trip_id');
    const factory = c.get('factory') as ServiceFactory;
    const dto = await factory.getGetRealtimeTripDetailUseCase().execute(tripId);
    return c.json(dto);
  }
}

export class StopController {
  static async getStopInfo(c: Context): Promise<Response> {
    const stopId = StopId.fromString(c.req.param('stop_id'));
    const factory = c.get('factory') as ServiceFactory;
    const dto = await factory.getGetStopNameUseCase().execute(stopId);
    return c.json({ stop_id: stopId.value, name: dto.stopName });
  }
}
