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

type NextBusDTO = Awaited<ReturnType<FindNextBusesUseCase['execute']>>[number];

function toResponseItem(bus: NextBusDTO): NextBusResponseItem {
  return {
    trip_id: bus.tripId,
    trip_short_id: bus.routeShortName,
    arrival_time: bus.scheduledArrival,
    remaining_time: bus.remainingTime,
    delay: bus.delayDisplay,
    trip_dest: bus.destinationLabel,
    current_location: bus.currentLocation,
  };
}

function parseStopIds(value: string): StopId[] {
  return value.split(',').map(s => s.trim()).filter(s => s.length > 0).map(id => StopId.fromString(id));
}

function parseVia(viaParam: string | undefined): StopId[] | undefined {
  if (!viaParam || viaParam.trim().length === 0) return undefined;
  const ids = viaParam.split(',').map(s => s.trim()).filter(s => s.length > 0);
  return ids.length > 0 ? ids.map(id => StopId.fromString(id)) : undefined;
}

export class BusController {
  /**
   * GET /api/trips?origin=STOP_A[,STOP_B]&destination=STOP_C[,STOP_D]&via=STOP_E&limit=5
   *
   * 単一origin → NextBusResponseItem[]
   * 複数origin → { [originId]: NextBusResponseItem[] }
   */
  static async getTrips(c: Context): Promise<Response> {
    try {
      const originId = c.req.query('origin');
      const destinationId = c.req.query('destination');
      const viaParam = c.req.query('via');
      const limitParam = c.req.query('limit') ?? '5';

      if (!originId || !destinationId) {
        return c.json({ error: 'origin and destination are required' }, 400);
      }

      const validatedLimit = Math.max(1, Math.min(20, Number.parseInt(limitParam, 10)));
      const factory = c.get('factory') as ServiceFactory;
      const useCase = factory.getFindNextBusesUseCase();
      const currentDateTime = JSTDateTime.now();

      const originIds = parseStopIds(originId);
      const destinationStopIds = parseStopIds(destinationId);
      const viaStopIds = parseVia(viaParam);

      const runQuery = async (originStopId: StopId) => {
        const buses = await useCase.execute(originStopId, destinationStopIds, currentDateTime, viaStopIds);
        return buses.slice(0, validatedLimit).map(toResponseItem);
      };

      if (originIds.length > 1) {
        const results = await Promise.all(originIds.map(async (id) => [id.value, await runQuery(id)] as const));
        return c.json(Object.fromEntries(results));
      }

      return c.json(await runQuery(originIds[0]));
    } catch (error) {
      console.error('Error in BusController.getTrips:', error);
      const message = error instanceof Error ? error.message : 'Internal Server Error';
      return c.json({ error: message }, 500);
    }
  }

  /**
   * POST /api/trips/batch
   *
   * クエリごとに異なる origin / destination / via / limit を指定できるバッチAPI。
   *
   * リクエストボディ:
   * [
   *   { "origin": "22030_2", "destination": "51240_", "limit": 8 },
   *   { "origin": "24140_1", "destination": "51240_", "via": "xxxxx", "limit": 8 }
   * ]
   *
   * レスポンス: リクエストと同順の配列
   * [ NextBusResponseItem[], NextBusResponseItem[] ]
   */
  static async batchTrips(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();

      if (!Array.isArray(body) || body.length === 0) {
        return c.json({ error: 'request body must be a non-empty array' }, 400);
      }

      // バリデーション（全件チェック後に実行）
      for (const [i, q] of body.entries()) {
        if (!q.origin || !q.destination) {
          return c.json({ error: `queries[${i}]: origin and destination are required` }, 400);
        }
      }

      const factory = c.get('factory') as ServiceFactory;
      const useCase = factory.getFindNextBusesUseCase();
      const currentDateTime = JSTDateTime.now();

      const results = await Promise.all(
        body.map(async (q: { origin: string; destination: string; via?: string; limit?: number }) => {
          const validatedLimit = Math.max(1, Math.min(20, q.limit ?? 5));
          const buses = await useCase.execute(
            StopId.fromString(q.origin),
            parseStopIds(q.destination),
            currentDateTime,
            parseVia(q.via)
          );
          return buses.slice(0, validatedLimit).map(toResponseItem);
        })
      );

      return c.json(results);
    } catch (error) {
      console.error('Error in BusController.batchTrips:', error);
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
