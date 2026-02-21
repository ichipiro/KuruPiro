import type { Context } from 'hono';
import { StopId } from '@/domain/value-objects/identifiers';
import { JSTDateTime } from '@/domain/value-objects/time';
import { BadRequestError } from '@/presentation/errors';
import type { BatchTripQuery } from '@/application/use-cases/BatchTripsUseCase';

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

function parseLimit(limit: number | undefined): number {
  return Math.max(1, Math.min(20, limit ?? 5));
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

  const currentDateTime = JSTDateTime.now();

  return (body as unknown[]).map((q, i) => {
    if (typeof q !== 'object' || q === null || !('origin' in q) || !('destination' in q)) {
      throw new BadRequestError(`queries[${i}]: origin and destination are required`);
    }
    const item = q as { origin: string; destination: string; via?: string; limit?: number };
    return {
      originId: StopId.fromString(item.origin),
      destinationIds: parseStopIds(item.destination),
      viaIds: parseVia(item.via),
      limit: parseLimit(item.limit),
      currentDateTime,
    };
  });
}
