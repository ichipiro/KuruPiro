import type { Context } from 'hono';
import { StopId } from '@/domain/value-objects/StopId';
import { JSTDateTime } from '@/domain/value-objects/JSTDateTime';
import type { FindNextBusesUseCase } from '@/application/use-cases/FindNextBusesUseCase';
import type { ServiceFactory } from '@/infrastructure/di/ServiceFactory';

/**
 * レスポンスアイテムの型（既存APIとの互換性維持）
 */
interface NextBusResponseItem {
  trip_id: string;
  trip_short_id: string;
  arrival_time: string;
  remaining_time: string;
  delay: string;
  trip_dest: string;
}

/**
 * バス情報のコントローラー
 *
 * 次のバス情報を取得するエンドポイントを提供します。
 */
export class BusController {
  /**
   * 次のバスを取得
   * GET /api/:stop_id/:dest_stop_id
   */
  static async getNextBuses(c: Context): Promise<Response> {
    try {
      // パラメータ取得
      const originId = c.req.param('stop_id');
      const destinationId = c.req.param('dest_stop_id');
      const responseSize = Number.parseInt(c.req.query('response_size') ?? '5', 10);

      // バリデーション
      if (!originId || !destinationId) {
        return c.json({ error: 'stop_id and dest_stop_id are required' }, 400);
      }

      // response_sizeのバリデーション
      const validatedSize = Math.max(1, Math.min(20, responseSize));

      // ServiceFactoryを取得
      const factory = c.get('factory') as ServiceFactory;
      const useCase = factory.getFindNextBusesUseCase();

      // 値オブジェクトに変換
      const originStopId = StopId.fromString(originId);
      const destinationStopId = StopId.fromString(destinationId);
      const currentDateTime = JSTDateTime.now();

      // ユースケース実行
      const buses = await useCase.execute(
        originStopId,
        destinationStopId,
        currentDateTime
      );

      // レスポンスサイズで制限
      const limitedBuses = buses.slice(0, validatedSize);

      // レスポンス形式に変換（既存APIとの互換性）
      const items: NextBusResponseItem[] = limitedBuses.map((bus) => ({
        trip_id: bus.tripId,
        trip_short_id: bus.routeShortName,
        arrival_time: bus.scheduledArrival,
        remaining_time: bus.remainingTime,
        delay: bus.delayDisplay,
        trip_dest: bus.destinationLabel,
      }));

      return c.json(items);
    } catch (error) {
      console.error('Error in BusController.getNextBuses:', error);
      const message = error instanceof Error ? error.message : 'Internal Server Error';
      return c.json({ error: message }, 500);
    }
  }
}
