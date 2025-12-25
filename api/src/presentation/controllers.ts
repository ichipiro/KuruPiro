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
/**
 * レスポンスの型（既存APIとの互換性維持）
 */
interface StopNameResponse {
  stop_id: string;
  name: string | null;
}
/**
 * 停留所情報のコントローラー
 *
 * 停留所名を取得するエンドポイントを提供します。
 */
export class StopController {
  /**
   * 停留所名を取得
   * GET /api/stop/:stop_id/name
   */
  static async getStopName(c: Context): Promise<Response> {
    try {
      // パラメータ取得
      const stopIdParam = c.req.param('stop_id');
      // バリデーション
      if (!stopIdParam) {
        return c.json({ error: 'stop_id is required' }, 400);
      }
      // ServiceFactoryを取得
      const factory = c.get('factory') as ServiceFactory;
      const useCase = factory.getGetStopNameUseCase();
      // 値オブジェクトに変換
      const stopId = StopId.fromString(stopIdParam);
      // ユースケース実行
      const stopDto = await useCase.execute(stopId);
      // レスポンス形式に変換（既存APIとの互換性）
      const response: StopNameResponse = {
        stop_id: stopIdParam,
        name: stopDto ? stopDto.stopName : null,
      };
      return c.json(response);
    } catch (error) {
      console.error('Error in StopController.getStopName:', error);
      const message = error instanceof Error ? error.message : 'Internal Server Error';
      return c.json({ error: message }, 500);
    }
  }
}
