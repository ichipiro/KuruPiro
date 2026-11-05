import type { Context } from 'hono';
import { StopId } from '@/domain/value-objects/identifiers';
import { JSTDateTime } from '@/domain/value-objects/time';
import { BadRequestError } from '@/presentation/errors';
import type { GetTripsQuery } from '@/application/use-cases/GetTripsUseCase';

/**
 * origin/destinationに指定できる停留所IDの最大数
 *
 * 検索はorigin×destinationの直積で走り、未知の組み合わせは
 * それぞれD1クエリになる。個数に上限がないと1リクエストで
 * D1・KVの無料枠を大きく消費できてしまうため、実利用
 * （フロント・サイネージとも2×2以下）に余裕を持たせた値で打ち切る。
 */
const MAX_STOP_IDS = 5;

/** viaに指定できる停留所IDの最大数 */
const MAX_VIA_IDS = 3;

function parseStopIds(value: string, name: string): StopId[] {
  const ids = value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  // 「origin=,」のようにパラメータは存在するがフィルタ後に空になる入力を
  // 素通しすると、後段で originIds[0] が undefined になり500で落ちる
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

function parseLimit(limitParam: string | undefined, defaultValue = 5): number {
  const parsed = Number.parseInt(limitParam ?? String(defaultValue), 10);
  // parseInt失敗(NaN)を素通しするとslice(0, NaN)が常に空配列になり、
  // 便があるのに「運行なし」に見えるため、不正値はデフォルトに落とす
  if (!Number.isFinite(parsed)) {
    return defaultValue;
  }
  return Math.max(1, Math.min(20, parsed));
}

export function parse(c: Context): GetTripsQuery {
  const originParam = c.req.query('origin');
  const destinationParam = c.req.query('destination');

  if (!originParam || !destinationParam) {
    throw new BadRequestError('origin and destination are required');
  }

  return {
    originIds: parseStopIds(originParam, 'origin'),
    destinationIds: parseStopIds(destinationParam, 'destination'),
    viaIds: parseVia(c.req.query('via')),
    limit: parseLimit(c.req.query('limit')),
    currentDateTime: JSTDateTime.now(),
  };
}
