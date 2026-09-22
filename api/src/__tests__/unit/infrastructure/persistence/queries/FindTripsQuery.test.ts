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

    await query.findByStopsAndDate(originStopId, StopId.fromString('51240_'), '20260914', 0);

    const { sql, params } = lastCall();
    expect(sql).not.toContain('like');
    expect(sql).not.toContain('LIKE');
    // 末尾の `_` を含めた範囲: '51240_' <= stop_id < '51240_￿'
    // （`_` を削ると '10_' 指定が '1000_1' など別グループに誤マッチするため）
    expect(params).toContain('51240_');
    expect(params).toContain('51240_￿');
    expect(params).not.toContain('51240');
  });

  it('should use an equality predicate when the destination is not a prefix', async () => {
    const { d1, lastCall } = createD1Spy();
    const query = new FindTripsQuery(d1);

    await query.findByStopsAndDate(originStopId, StopId.fromString('51240_5'), '20260914', 0);

    const { sql, params } = lastCall();
    expect(sql).not.toContain('LIKE');
    expect(params).toContain('51240_5');
  });

  it('should order by the origin arrival time so the index can satisfy the sort', async () => {
    const { d1, lastCall } = createD1Spy();
    const query = new FindTripsQuery(d1);

    await query.findByStopsAndDate(originStopId, StopId.fromString('51240_'), '20260914', 0);

    expect(lastCall().sql).toMatch(/order by\s+"origin_stops"\."arrival_time"/i);
  });

  it('should pick the calendar column matching the weekday', async () => {
    const { d1, lastCall } = createD1Spy();
    const query = new FindTripsQuery(d1);

    await query.findByStopsAndDate(originStopId, StopId.fromString('51240_'), '20260920', 6);

    expect(lastCall().sql).toContain('"sunday"');
  });

  it('should evaluate calendar_dates exceptions and the service period', async () => {
    const { d1, lastCall } = createD1Spy();
    const query = new FindTripsQuery(d1);

    await query.findByStopsAndDate(originStopId, StopId.fromString('51240_'), '20260921', 0);

    const { sql, params } = lastCall();
    // 祝日例外: 当日の除外(type=2)がない定常運行、または当日の追加(type=1)
    expect(sql).toContain('gtfs_calendar_dates');
    expect(sql).toMatch(/not exists/i);
    expect(sql).toMatch(/exists/i);
    // 適用期間: start_date <= 日付 <= end_date
    expect(sql).toContain('"start_date"');
    expect(sql).toContain('"end_date"');
    // calendar_dates のみで運行するサービスも拾えるよう calendar は LEFT JOIN
    expect(sql).toMatch(/left join "gtfs_calendar"/i);
    // サービス日が3箇所（除外・追加・期間×2）でバインドされる
    expect(params.filter((p) => p === '20260921').length).toBeGreaterThanOrEqual(3);
  });

  it('should return an empty array for an out-of-range weekday without querying', async () => {
    const { d1 } = createD1Spy();
    const query = new FindTripsQuery(d1);

    await expect(
      query.findByStopsAndDate(originStopId, StopId.fromString('51240_'), '20260921', 7)
    ).resolves.toEqual([]);
  });
});
