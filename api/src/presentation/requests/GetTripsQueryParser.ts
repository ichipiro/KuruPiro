import type { Context } from 'hono';
import { StopId } from '@/domain/value-objects/identifiers';
import { JSTDateTime } from '@/domain/value-objects/time';
import { BadRequestError } from '@/presentation/errors';
import type { GetTripsQuery } from '@/application/use-cases/GetTripsUseCase';

function parseStopIds(value: string): StopId[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((id) => StopId.fromString(id));
}

function parseVia(viaParam: string | undefined): StopId[] | undefined {
  if (!viaParam || viaParam.trim().length === 0) return undefined;
  const ids = viaParam
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return ids.length > 0 ? ids.map((id) => StopId.fromString(id)) : undefined;
}

function parseLimit(limitParam: string | undefined, defaultValue = 5): number {
  return Math.max(1, Math.min(20, Number.parseInt(limitParam ?? String(defaultValue), 10)));
}

export function parse(c: Context): GetTripsQuery {
  const originParam = c.req.query('origin');
  const destinationParam = c.req.query('destination');

  if (!originParam || !destinationParam) {
    throw new BadRequestError('origin and destination are required');
  }

  return {
    originIds: parseStopIds(originParam),
    destinationIds: parseStopIds(destinationParam),
    viaIds: parseVia(c.req.query('via')),
    limit: parseLimit(c.req.query('limit')),
    currentDateTime: JSTDateTime.now(),
  };
}
