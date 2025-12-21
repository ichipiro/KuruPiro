import type { Context } from 'hono';
import { StopId } from '@/domain/value-objects/StopId';
import type { GetStopNameUseCase } from '@/application/use-cases/GetStopNameUseCase';
import type { ServiceFactory } from '@/infrastructure/di/ServiceFactory';

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
