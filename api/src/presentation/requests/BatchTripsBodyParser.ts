import type { Context } from 'hono';
import { StopId } from '@/domain/value-objects/identifiers';
import { JSTDateTime } from '@/domain/value-objects/time';
import { BadRequestError } from '@/presentation/errors';
import type { BatchTripQuery } from '@/application/use-cases/BatchTripsUseCase';

/**
 * 1リクエストに詰められるクエリ数の上限
 *
 * クエリごとにD1・KVアクセスが走るため、上限がないと1リクエストで
 * 無料枠を大きく消費できてしまう。実利用（サイネージは2クエリ）に
 * 余裕を持たせた値で打ち切る。
 */
const MAX_QUERIES = 10;

/** destinationに指定できる停留所IDの最大数 */
const MAX_STOP_IDS = 5;

/** viaに指定できる停留所IDの最大数 */
const MAX_VIA_IDS = 3;

function parseStopIds(value: string, name: string): StopId[] {
  const ids = value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  // 「destination: ","」のようにフィルタ後に空になる入力は明示的に400にする
  if (ids.length === 0) {
    throw new BadRequestError(`${name} must contain at least one stop id`);
  }
  if (ids.length > MAX_STOP_IDS) {
    throw new BadRequestError(`${name} accepts at most ${MAX_STOP_IDS} stop ids`);
  }
  return ids.map((id) => StopId.fromString(id));
}

function parseVia(viaParam: string | undefined): StopId[] | undefined {
  if (!viaParam || viaParam.trim().length === 0) return undefined;
  const ids = viaParam
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (ids.length > MAX_VIA_IDS) {
    throw new BadRequestError(`via accepts at most ${MAX_VIA_IDS} stop ids`);
  }
  return ids.length > 0 ? ids.map((id) => StopId.fromString(id)) : undefined;
}

function parseLimit(limit: unknown): number {
  if (limit === undefined) {
    return 5;
  }
  // 数値以外やNaNを素通しするとslice(0, NaN)が常に空配列になり、
  // 便があるのに「運行なし」に見えるため、不正値はデフォルトに落とす
  if (typeof limit !== 'number' || !Number.isFinite(limit)) {
    return 5;
  }
  return Math.max(1, Math.min(20, Math.floor(limit)));
}

export async function parse(c: Context): Promise<BatchTripQuery[]> {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    throw new BadRequestError('Invalid JSON body');
  }

  if (!Array.isArray(body) || body.length === 0) {
    throw new BadRequestError('request body must be a non-empty array');
  }

  if (body.length > MAX_QUERIES) {
    throw new BadRequestError(`a batch accepts at most ${MAX_QUERIES} queries`);
  }

  const currentDateTime = JSTDateTime.now();

  return (body as unknown[]).map((q, i) => {
    if (typeof q !== 'object' || q === null || !('origin' in q) || !('destination' in q)) {
      throw new BadRequestError(`queries[${i}]: origin and destination are required`);
    }
    const item = q as { origin: unknown; destination: unknown; via?: unknown; limit?: unknown };
    if (typeof item.origin !== 'string' || item.origin.trim().length === 0) {
      throw new BadRequestError(`queries[${i}]: origin must be a non-empty string`);
    }
    // GETと違いbatchのoriginは1停留所のみ。カンマ入りを黙って1つのIDとして
    // D1照合すると常に空配列が返り「運行なし」に見えるため、明示的に拒否する
    if (item.origin.includes(',')) {
      throw new BadRequestError(
        `queries[${i}]: origin accepts a single stop id (split into separate queries)`
      );
    }
    if (typeof item.destination !== 'string') {
      throw new BadRequestError(`queries[${i}]: destination must be a string`);
    }
    if (item.via !== undefined && typeof item.via !== 'string') {
      throw new BadRequestError(`queries[${i}]: via must be a string`);
    }
    return {
      originId: StopId.fromString(item.origin),
      destinationIds: parseStopIds(item.destination, `queries[${i}].destination`),
      viaIds: parseVia(item.via),
      limit: parseLimit(item.limit),
      currentDateTime,
    };
  });
}
