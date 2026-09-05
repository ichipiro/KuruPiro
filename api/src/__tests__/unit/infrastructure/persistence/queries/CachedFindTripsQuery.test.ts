import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CachedFindTripsQuery } from '@/infrastructure/persistence/queries/CachedFindTripsQuery';
import { StopId } from '@/domain/value-objects/identifiers';
import { GTFSTime } from '@/domain/value-objects/time';
import type { IFindTripsQuery, TripSearchResult } from '@/domain/queries';

describe('CachedFindTripsQuery', () => {
  const originStopId = StopId.fromString('origin_stop');
  const destinationStopId = StopId.fromString('dest_stop');

  const timetable: TripSearchResult[] = [
    {
      tripId: 'trip1',
      arrivalTime: GTFSTime.fromString('10:30:00'),
      stopSequence: 5,
      routeShortName: '1',
      destinationStopId: 'dest_stop',
      destinationLabel: '終点',
      serviceId: 'weekday',
    },
  ];

  let inner: IFindTripsQuery;
  /** KVキー → 保存済みJSON文字列 */
  let store: Map<string, string>;
  let kv: KVNamespace;

  beforeEach(() => {
    inner = { findByStopsAndWeekday: vi.fn().mockResolvedValue(timetable) };
    store = new Map();

    kv = {
      get: vi.fn(async (key: string, type?: string) => {
        const value = store.get(key);
        if (value === undefined) return null;
        return type === 'json' ? JSON.parse(value) : value;
      }),
      put: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
    } as unknown as KVNamespace;
  });

  it('should query D1 on a cache miss and serve the second call from the cache', async () => {
    const query = new CachedFindTripsQuery(inner, kv);

    const first = await query.findByStopsAndWeekday(originStopId, destinationStopId, 0);
    const second = await query.findByStopsAndWeekday(originStopId, destinationStopId, 0);

    expect(inner.findByStopsAndWeekday).toHaveBeenCalledOnce();
    expect(first).toEqual(timetable);
    // GTFSTime まで含めて復元できていること
    expect(second).toEqual(timetable);
    expect(second[0].arrivalTime.toString()).toBe('10:30:00');
  });

  it('should use a separate cache entry per weekday', async () => {
    const query = new CachedFindTripsQuery(inner, kv);

    await query.findByStopsAndWeekday(originStopId, destinationStopId, 0);
    await query.findByStopsAndWeekday(originStopId, destinationStopId, 1);

    expect(inner.findByStopsAndWeekday).toHaveBeenCalledTimes(2);
    // 時刻表2エントリ + 組み合わせ記録1エントリ
    expect(store.size).toBe(3);
  });

  it('should register the requested pair once for the timetable push', async () => {
    const query = new CachedFindTripsQuery(inner, kv);

    // 曜日違い・キャッシュヒットを挟んでも、組み合わせ記録は1つだけ
    await query.findByStopsAndWeekday(originStopId, destinationStopId, 0);
    await query.findByStopsAndWeekday(originStopId, destinationStopId, 0);
    await query.findByStopsAndWeekday(originStopId, destinationStopId, 1);

    expect(store.get('pairs:v1:origin_stop:dest_stop')).toBe('1');
    const pairPuts = (kv.put as ReturnType<typeof vi.fn>).mock.calls.filter(
      ([key]) => String(key).startsWith('pairs:v1:')
    );
    expect(pairPuts).toHaveLength(1);
  });

  it('should store entries with an expiration TTL', async () => {
    const query = new CachedFindTripsQuery(inner, kv);

    await query.findByStopsAndWeekday(originStopId, destinationStopId, 0);

    expect(kv.put).toHaveBeenCalledWith(
      expect.stringContaining('timetable:v1:origin_stop:dest_stop:0'),
      expect.any(String),
      expect.objectContaining({ expirationTtl: expect.any(Number) })
    );
  });

  it('should hand the cache write to waitUntil when an ExecutionContext is available', async () => {
    const waitUntil = vi.fn();
    const query = new CachedFindTripsQuery(inner, kv, {
      waitUntil,
      passThroughOnException: vi.fn(),
    } as unknown as ExecutionContext);

    await query.findByStopsAndWeekday(originStopId, destinationStopId, 0);

    expect(waitUntil).toHaveBeenCalledOnce();
  });

  it('should fall back to D1 when no KV namespace is provided', async () => {
    const query = new CachedFindTripsQuery(inner);

    const results = await query.findByStopsAndWeekday(originStopId, destinationStopId, 0);

    expect(results).toEqual(timetable);
    expect(inner.findByStopsAndWeekday).toHaveBeenCalledOnce();
  });

  it('should treat a KV read failure as a cache miss', async () => {
    kv.get = vi.fn().mockRejectedValue(new Error('kv unavailable'));

    const query = new CachedFindTripsQuery(inner, kv);

    const results = await query.findByStopsAndWeekday(originStopId, destinationStopId, 0);

    expect(results).toEqual(timetable);
    expect(inner.findByStopsAndWeekday).toHaveBeenCalledOnce();
  });

  it('should not fail the request when the KV write fails', async () => {
    kv.put = vi.fn().mockRejectedValue(new Error('kv write failed'));

    const query = new CachedFindTripsQuery(inner, kv);

    const results = await query.findByStopsAndWeekday(originStopId, destinationStopId, 0);

    expect(results).toEqual(timetable);
  });
});
