/**
 * HTTPコントローラーを集約したファイル
 *
 * コントローラーの責務:
 * - HTTPリクエストのパラメータを解析・バリデーション（入力の境界）
 * - ユースケースを呼び出す
 * - ユースケースの結果をHTTPレスポンス形式に変換（出力の境界）
 *
 * コントローラーに書かないこと:
 * - ビジネスロジック（ドメイン・ユースケース層の責務）
 * - try-catch による500エラーハンドリング（errorHandler ミドルウェアに委譲）
 */

import type { Context } from 'hono';
import type { FindNextBusesUseCase } from '@/application/use-cases/FindNextBusesUseCase';
import type { ServiceFactory } from '@/infrastructure/di/ServiceFactory';
import { JSTDateTime } from '@/domain/value-objects/time';
import { StopId } from '@/domain/value-objects/identifiers';

// ─── レスポンス型 ────────────────────────────────────────────────────────────

interface NextBusResponseItem {
  trip_id: string;
  trip_short_id: string;
  arrival_time: string;
  remaining_time: string;
  delay: string;
  trip_dest: string;
  current_location: string;
}

// ─── 内部ユーティリティ ───────────────────────────────────────────────────────

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

/** limit クエリパラメータを 1〜20 の範囲にクランプして返す */
function parseLimit(limitParam: string | undefined, defaultValue = 5): number {
  return Math.max(1, Math.min(20, Number.parseInt(limitParam ?? String(defaultValue), 10)));
}

// ─── BusController ────────────────────────────────────────────────────────────

export class BusController {
  /**
   * GET /api/trips?origin=STOP_A[,STOP_B]&destination=STOP_C[,STOP_D]&via=STOP_E&limit=5
   *
   * 単一origin → NextBusResponseItem[]
   * 複数origin → { [originId]: NextBusResponseItem[] }
   */
  static async getTrips(c: Context): Promise<Response> {
    const originId = c.req.query('origin');
    const destinationId = c.req.query('destination');

    if (!originId || !destinationId) {
      return c.json({ error: 'origin and destination are required' }, 400);
    }

    const limit = parseLimit(c.req.query('limit'));
    const factory = c.get('factory') as ServiceFactory;
    const useCase = factory.getFindNextBusesUseCase();
    const currentDateTime = JSTDateTime.now();

    const originIds = parseStopIds(originId);
    const destinationStopIds = parseStopIds(destinationId);
    const viaStopIds = parseVia(c.req.query('via'));

    if (originIds.length > 1) {
      const results = await Promise.all(
        originIds.map(async (id) => {
          const buses = await useCase.execute(id, destinationStopIds, currentDateTime, viaStopIds, limit);
          return [id.value, buses.map(toResponseItem)] as const;
        })
      );
      return c.json(Object.fromEntries(results));
    }

    const buses = await useCase.execute(originIds[0], destinationStopIds, currentDateTime, viaStopIds, limit);
    return c.json(buses.map(toResponseItem));
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
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    if (!Array.isArray(body) || body.length === 0) {
      return c.json({ error: 'request body must be a non-empty array' }, 400);
    }

    // バリデーション（全件チェック後に実行）
    for (const [i, q] of (body as unknown[]).entries()) {
      if (typeof q !== 'object' || q === null || !('origin' in q) || !('destination' in q)) {
        return c.json({ error: `queries[${i}]: origin and destination are required` }, 400);
      }
    }

    const factory = c.get('factory') as ServiceFactory;
    const useCase = factory.getFindNextBusesUseCase();
    const currentDateTime = JSTDateTime.now();

    const results = await Promise.all(
      (body as { origin: string; destination: string; via?: string; limit?: number }[]).map(async (q) => {
        const limit = parseLimit(q.limit !== undefined ? String(q.limit) : undefined);
        const buses = await useCase.execute(
          StopId.fromString(q.origin),
          parseStopIds(q.destination),
          currentDateTime,
          parseVia(q.via),
          limit
        );
        return buses.map(toResponseItem);
      })
    );

    return c.json(results);
  }
}

// ─── DebugController ─────────────────────────────────────────────────────────

export class DebugController {
  /**
   * POST /api/debug/update-realtime
   * リアルタイムデータを強制更新
   */
  static async updateRealtime(c: Context): Promise<Response> {
    const factory = c.get('factory') as ServiceFactory;
    await factory.getRealtimeRepository().forceUpdate();
    return c.json({ status: 'updated', timestamp: Date.now() });
  }

  /**
   * GET /api/debug/cache-info
   * キャッシュの最終更新時刻と統計情報を取得
   */
  static async getCacheInfo(c: Context): Promise<Response> {
    const factory = c.get('factory') as ServiceFactory;
    const realtimeRepo = factory.getRealtimeRepository();
    const [lastUpdated, allUpdates] = await Promise.all([
      realtimeRepo.getLastUpdatedAt(),
      realtimeRepo.getAllTripUpdates(),
    ]);

    const now = Date.now();
    const includeTripIds = c.req.query('includeTripIds') === 'true';

    return c.json({
      lastUpdatedAt: new Date(lastUpdated).toISOString(),
      ageSeconds: Math.floor((now - lastUpdated) / 1000),
      totalTrips: allUpdates.length,
      now: new Date(now).toISOString(),
      ...(includeTripIds && { tripIds: allUpdates.map((u) => u.tripId.value) }),
    });
  }

  /**
   * GET /api/debug/realtime/:trip_id
   * 特定トリップのリアルタイムデータ詳細を取得
   */
  static async getRealtimeDetail(c: Context): Promise<Response> {
    const tripId = c.req.param('trip_id');
    const factory = c.get('factory') as ServiceFactory;
    const allUpdates = await factory.getRealtimeRepository().getAllTripUpdates();

    const targetUpdate = allUpdates.find((update) => update.tripId.value === tripId);

    if (!targetUpdate) {
      return c.json({
        found: false,
        totalTrips: allUpdates.length,
        message: `Trip ${tripId} not found in realtime data`,
      });
    }

    return c.json({
      found: true,
      tripId: targetUpdate.tripId.value,
      stopTimeUpdates: targetUpdate.stopTimeUpdates.map((update) => ({
        stopSequence: update.stopSequence,
        stopId: update.stopId?.value,
        arrivalDelay: update.arrivalDelay?.toSeconds(),
        arrivalTime: update.arrivalTime,
        departureDelay: update.departureDelay?.toSeconds(),
        departureTime: update.departureTime,
        representativeDelay: update.getRepresentativeDelay().toSeconds(),
      })),
    });
  }
}

// ─── StopController ───────────────────────────────────────────────────────────

export class StopController {
  /**
   * GET /api/stops/:stop_id
   */
  static async getStopInfo(c: Context): Promise<Response> {
    const stopIdParam = c.req.param('stop_id');

    if (!stopIdParam) {
      return c.json({ error: 'stop_id is required' }, 400);
    }

    const factory = c.get('factory') as ServiceFactory;
    const useCase = factory.getGetStopNameUseCase();
    const stopDto = await useCase.execute(StopId.fromString(stopIdParam));

    if (!stopDto) {
      return c.json({ stop_id: stopIdParam, name: null });
    }

    return c.json({ stop_id: stopIdParam, name: stopDto.stopName });
  }
}
