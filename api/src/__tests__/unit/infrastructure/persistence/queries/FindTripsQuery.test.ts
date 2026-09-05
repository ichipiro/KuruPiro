import { describe, it, expect } from 'vitest';
import { FindTripsQuery } from '@/infrastructure/persistence/queries/FindTripsQuery';
import { StopId } from '@/domain/value-objects/identifiers';

/**
 * 実行されたSQLとバインド値を記録するだけのD1スタブ
 */
function createD1Spy(rows: Record<string, unknown>[] = []) {
  const calls: { sql: string; params: unknown[] }[] = [];

  const d1 = {
    prepare(sql: string) {
      const statement = {
        bind(...params: unknown[]) {
          calls.push({ sql, params });
          return statement;
        },
        all: async () => ({ results: rows, success: true, meta: {} }),
        raw: async () => rows.map((row) => Object.values(row)),
      };
      calls.push({ sql, params: [] });
      return statement;
    },
  } as unknown as D1Database;

  return { d1, lastCall: () => calls[calls.length - 1] };
}

describe('FindTripsQuery', () => {
  const originStopId = StopId.fromString('22030_2');

  it('should search the destination by range instead of LIKE for prefix matches', async () => {
    // LIKE 'xxx%' は BINARY照合のインデックスを使えず全表走査になるため、
    // 範囲条件になっていることを保証する
    const { d1, lastCall } = createD1Spy();
    const query = new FindTripsQuery(d1);

    await query.findByStopsAndWeekday(originStopId, StopId.fromString('51240_'), 0);

    const { sql, params } = lastCall();
    expect(sql).not.toContain('like');
    expect(sql).not.toContain('LIKE');
    expect(params).toContain('51240');
    expect(params).toContain('51240￿');
  });

  it('should use an equality predicate when the destination is not a prefix', async () => {
    const { d1, lastCall } = createD1Spy();
    const query = new FindTripsQuery(d1);

    await query.findByStopsAndWeekday(originStopId, StopId.fromString('51240_5'), 0);

    const { sql, params } = lastCall();
    expect(sql).not.toContain('LIKE');
    expect(params).toContain('51240_5');
  });

  it('should order by the origin arrival time so the index can satisfy the sort', async () => {
    const { d1, lastCall } = createD1Spy();
    const query = new FindTripsQuery(d1);

    await query.findByStopsAndWeekday(originStopId, StopId.fromString('51240_'), 0);

    expect(lastCall().sql).toMatch(/order by\s+"origin_stops"\."arrival_time"/i);
  });

  it('should pick the calendar column matching the weekday', async () => {
    const { d1, lastCall } = createD1Spy();
    const query = new FindTripsQuery(d1);

    await query.findByStopsAndWeekday(originStopId, StopId.fromString('51240_'), 6);

    expect(lastCall().sql).toContain('"sunday"');
  });

  it('should return an empty array for an out-of-range weekday without querying', async () => {
    const { d1 } = createD1Spy();
    const query = new FindTripsQuery(d1);

    await expect(
      query.findByStopsAndWeekday(originStopId, StopId.fromString('51240_'), 7)
    ).resolves.toEqual([]);
  });
});
