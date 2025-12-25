/**
 * HTTPコントローラーを集約したファイル
 *
 * 含まれるコントローラー:
 * - BusController: バス検索API
 * - StopController: 停留所情報API
 */

import type { Context } from 'hono';
import type { FindNextBusesUseCase } from '@/application/use-cases/FindNextBusesUseCase';
import type { GetStopNameUseCase } from '@/application/use-cases/GetStopNameUseCase';
import type { ServiceFactory } from '@/infrastructure/di/ServiceFactory';
import { JSTDateTime } from '@/domain/value-objects/time';
import { StopId } from '@/domain/value-objects/identifiers';

interface NextBusResponseItem {
  trip_id: string;
  trip_short_id: string;
  arrival_time: string;
  remaining_time: string;
  delay: string;
  trip_dest: string;
  current_location: string;
}
export class BusController {
  /**
   * GET /api/trips?origin=STOP_A&destination=STOP_B&via=STOP_C,STOP_D&limit=5
   */
  static async getTrips(c: Context): Promise<Response> {
    try {
      // クエリパラメータ取得
      const originId = c.req.query('origin');
      const destinationId = c.req.query('destination');
      const viaParam = c.req.query('via');
      const limitParam = c.req.query('limit') ?? '5';
      const limit = Number.parseInt(limitParam, 10);

      // バリデーション
      if (!originId || !destinationId) {
        return c.json({ error: 'origin and destination are required' }, 400);
      }

      // limitのバリデーション
      const validatedLimit = Math.max(1, Math.min(20, limit));

      // ServiceFactoryを取得
      const factory = c.get('factory') as ServiceFactory;
      const useCase = factory.getFindNextBusesUseCase();

      // 値オブジェクトに変換
      const originStopId = StopId.fromString(originId);
      const destinationStopId = StopId.fromString(destinationId);
      const currentDateTime = JSTDateTime.now();

      // 経由地をパース（カンマ区切り）
      let viaStopIds: StopId[] | undefined;
      if (viaParam && viaParam.trim().length > 0) {
        const viaStopIdStrings = viaParam.split(',').map(s => s.trim()).filter(s => s.length > 0);
        if (viaStopIdStrings.length > 0) {
          viaStopIds = viaStopIdStrings.map(id => StopId.fromString(id));
        }
      }

      // ユースケース実行
      const buses = await useCase.execute(
        originStopId,
        destinationStopId,
        currentDateTime,
        viaStopIds
      );

      // レスポンスサイズで制限
      const limitedBuses = buses.slice(0, validatedLimit);

      // レスポンス形式に変換
      const items: NextBusResponseItem[] = limitedBuses.map((bus) => ({
        trip_id: bus.tripId,
        trip_short_id: bus.routeShortName,
        arrival_time: bus.scheduledArrival,
        remaining_time: bus.remainingTime,
        delay: bus.delayDisplay,
        trip_dest: bus.destinationLabel,
        current_location: bus.currentLocation,
      }));

      return c.json(items);
    } catch (error) {
      console.error('Error in BusController.getTrips:', error);
      const message = error instanceof Error ? error.message : 'Internal Server Error';
      return c.json({ error: message }, 500);
    }
  }

}

interface StopNameResponse {
  stop_id: string;
  name: string | null;
}

export class StopController {
  /**
   * GET /api/stops/:stop_id
   */
  static async getStopInfo(c: Context): Promise<Response> {
    try {
      const stopIdParam = c.req.param('stop_id');

      if (!stopIdParam) {
        return c.json({ error: 'stop_id is required' }, 400);
      }

      const factory = c.get('factory') as ServiceFactory;
      const useCase = factory.getGetStopNameUseCase();
      const stopId = StopId.fromString(stopIdParam);
      const stopDto = await useCase.execute(stopId);

      if (!stopDto) {
        return c.json({
          stop_id: stopIdParam,
          name: null,
        });
      }

      return c.json({
        stop_id: stopIdParam,
        name: stopDto.stopName,
      });
    } catch (error) {
      console.error('Error in StopController.getStopInfo:', error);
      const message = error instanceof Error ? error.message : 'Internal Server Error';
      return c.json({ error: message }, 500);
    }
  }
}
