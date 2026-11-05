import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CachedFindTripsQuery,
  clearTimetableMemoryCache,
} from '@/infrastructure/persistence/queries/CachedFindTripsQuery';
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
    // メモリキャッシュはモジュールレベルの状態なので、テストごとに空にして独立させる
    clearTimetableMemoryCache();
    inner = { findByStopsAndDate: vi.fn().mockResolvedValue(timetable) };
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

    const first = await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);
    const second = await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);

    expect(inner.findByStopsAndDate).toHaveBeenCalledOnce();
    expect(first).toEqual(timetable);
    // GTFSTime まで含めて復元できていること
    expect(second).toEqual(timetable);
    expect(second[0].arrivalTime.toString()).toBe('10:30:00');
  });

  it('should serve repeat requests from isolate memory without touching KV', async () => {
    const query = new CachedFindTripsQuery(inner, kv);

    await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);
    // 初回で時刻表キー1回 + 組み合わせ記録キー1回のKV読み取りが発生する
    expect(kv.get).toHaveBeenCalledTimes(2);

    const second = await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);

    // 2回目はメモリから返り、KV読み取りが増えない（無料枠対策の本体）
    expect(kv.get).toHaveBeenCalledTimes(2);
    expect(second).toEqual(timetable);
  });

  it('should populate memory from a KV hit so later requests skip KV too', async () => {
    store.set(
      'timetable:v2:origin_stop:dest_stop:20260914',
      JSON.stringify([{ ...timetable[0], arrivalTime: '10:30:00' }])
    );
    const query = new CachedFindTripsQuery(inner, kv);

    const first = await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);
    const second = await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);

    expect(inner.findByStopsAndDate).not.toHaveBeenCalled();
    // KVを読むのは初回の1回だけ（KVヒット時はregisterPairを通らない）
    expect(kv.get).toHaveBeenCalledTimes(1);
    expect(first).toEqual(timetable);
    expect(second).toEqual(timetable);
  });

  describe('空結果の扱い', () => {
    it('結果が空のペアはKVに書かずpairs記録もしない（write枠の防御）', async () => {
      inner = { findByStopsAndDate: vi.fn().mockResolvedValue([]) };
      const query = new CachedFindTripsQuery(inner, kv);

      const result = await query.findByStopsAndDate(
        originStopId,
        destinationStopId,
        '20260914',
        0
      );

      expect(result).toEqual([]);
      expect(kv.put).not.toHaveBeenCalled();
      // registerPairの存在確認getも走らない（時刻表キーの1回のみ）
      expect(kv.get).toHaveBeenCalledTimes(1);
      expect(store.size).toBe(0);
    });

    it('空結果もisolateメモリには載り、再リクエストでD1へ行かない', async () => {
      inner = { findByStopsAndDate: vi.fn().mockResolvedValue([]) };
      const query = new CachedFindTripsQuery(inner, kv);

      await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);
      const second = await query.findByStopsAndDate(
        originStopId,
        destinationStopId,
        '20260914',
        0
      );

      expect(second).toEqual([]);
      expect(inner.findByStopsAndDate).toHaveBeenCalledOnce();
    });
  });

  describe('writesDisabled（プレビューWorker用）', () => {
    it('KVへの書き込み（時刻表put・pairs記録）を一切行わない', async () => {
      const query = new CachedFindTripsQuery(inner, kv, undefined, true);

      await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);

      expect(inner.findByStopsAndDate).toHaveBeenCalledOnce();
      expect(kv.put).not.toHaveBeenCalled();
      // pairs記録の存在確認get(registerPair)も走らない。読むのは時刻表キーの1回だけ
      expect(kv.get).toHaveBeenCalledTimes(1);
      expect(store.size).toBe(0);
    });

    it('KVの読み取りとisolateメモリは通常どおり効く', async () => {
      store.set(
        'timetable:v2:origin_stop:dest_stop:20260914',
        JSON.stringify([{ ...timetable[0], arrivalTime: '10:30:00' }])
      );
      const query = new CachedFindTripsQuery(inner, kv, undefined, true);

      const first = await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);
      const second = await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);

      expect(inner.findByStopsAndDate).not.toHaveBeenCalled();
      expect(kv.get).toHaveBeenCalledTimes(1); // 2回目はメモリヒット
      expect(first).toEqual(timetable);
      expect(second).toEqual(timetable);
    });

    it('D1ミス後の再リクエストはメモリから返る（KVに書けなくても再クエリしない）', async () => {
      const query = new CachedFindTripsQuery(inner, kv, undefined, true);

      await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);
      const second = await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);

      expect(inner.findByStopsAndDate).toHaveBeenCalledOnce();
      expect(second).toEqual(timetable);
    });
  });

  describe('memory TTL', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should fall back to KV after the memory TTL expires', async () => {
      vi.useFakeTimers();
      const query = new CachedFindTripsQuery(inner, kv);

      await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);
      const getsAfterFirst = (kv.get as ReturnType<typeof vi.fn>).mock.calls.length;

      // メモリTTL(10分)を超えると、ダイヤ改正でKVへ直接配信された
      // 新時刻表を拾い直せるようKVまで読みに行く
      vi.advanceTimersByTime(11 * 60 * 1000);
      await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);

      expect((kv.get as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(
        getsAfterFirst
      );
      // KVにはまだ生きたエントリがあるので、D1(inner)までは落ちない
      expect(inner.findByStopsAndDate).toHaveBeenCalledOnce();
    });
  });

  it('should evict the oldest memory entry when the cap is exceeded', async () => {
    const query = new CachedFindTripsQuery(inner, kv);

    // 上限(256)+1件の異なるキーを流し込む
    for (let i = 0; i <= 256; i++) {
      await query.findByStopsAndDate(originStopId, destinationStopId, `2026${String(i).padStart(4, '0')}`, 0);
    }
    const innerCalls = (inner.findByStopsAndDate as ReturnType<typeof vi.fn>).mock.calls.length;

    // KVも空にして、メモリに残っているかどうかだけが結果を左右する状態にする
    store.clear();

    // 最古のキーは追い出されているのでD1まで落ちる
    await query.findByStopsAndDate(originStopId, destinationStopId, '20260000', 0);
    expect(inner.findByStopsAndDate).toHaveBeenCalledTimes(innerCalls + 1);

    // 直近のキーはメモリに残っている
    await query.findByStopsAndDate(originStopId, destinationStopId, '20260256', 0);
    expect(inner.findByStopsAndDate).toHaveBeenCalledTimes(innerCalls + 1);
  });

  it('should not pin a malformed KV entry in memory', async () => {
    const key = 'timetable:v2:origin_stop:dest_stop:20260914';
    // GTFSTimeとして復元できない値がKVに入っている状態
    store.set(key, JSON.stringify([{ ...timetable[0], arrivalTime: 'invalid' }]));
    const query = new CachedFindTripsQuery(inner, kv);

    await expect(
      query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0)
    ).rejects.toThrow();

    // KV側を修復すれば次のリクエストから即復旧する（壊れた値がメモリに固定されない）
    store.set(key, JSON.stringify([{ ...timetable[0], arrivalTime: '10:30:00' }]));
    const recovered = await query.findByStopsAndDate(
      originStopId,
      destinationStopId,
      '20260914',
      0
    );
    expect(recovered).toEqual(timetable);
  });

  it('should keep hot keys in memory under eviction pressure (LRU)', async () => {
    const query = new CachedFindTripsQuery(inner, kv);

    // ホットキーを先頭に入れ、上限ちょうどまで別キーで埋める
    await query.findByStopsAndDate(originStopId, destinationStopId, '20269999', 0);
    for (let i = 0; i < 255; i++) {
      await query.findByStopsAndDate(originStopId, destinationStopId, `2026${String(i).padStart(4, '0')}`, 0);
    }

    // ホットキーに触れてから1件あふれさせる → 追い出されるのは最古の別キー
    await query.findByStopsAndDate(originStopId, destinationStopId, '20269999', 0);
    await query.findByStopsAndDate(originStopId, destinationStopId, '20260255', 0);

    const innerCalls = (inner.findByStopsAndDate as ReturnType<typeof vi.fn>).mock.calls.length;
    store.clear();

    // ホットキーはメモリに残っている（D1まで落ちない）
    await query.findByStopsAndDate(originStopId, destinationStopId, '20269999', 0);
    expect(inner.findByStopsAndDate).toHaveBeenCalledTimes(innerCalls);
  });

  it('should use a separate cache entry per service date', async () => {
    const query = new CachedFindTripsQuery(inner, kv);

    await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);
    await query.findByStopsAndDate(originStopId, destinationStopId, '20260915', 1);

    expect(inner.findByStopsAndDate).toHaveBeenCalledTimes(2);
    // 時刻表2エントリ + 組み合わせ記録1エントリ
    expect(store.size).toBe(3);
  });

  it('should register the requested pair once for the timetable push', async () => {
    const query = new CachedFindTripsQuery(inner, kv);

    // 日付違い・キャッシュヒットを挟んでも、組み合わせ記録は1つだけ
    await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);
    await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);
    await query.findByStopsAndDate(originStopId, destinationStopId, '20260915', 1);

    expect(store.get('pairs:v1:origin_stop:dest_stop')).toBe('1');
    const pairPuts = (kv.put as ReturnType<typeof vi.fn>).mock.calls.filter(
      ([key]) => String(key).startsWith('pairs:v1:')
    );
    expect(pairPuts).toHaveLength(1);
  });

  it('should store entries with an expiration TTL', async () => {
    const query = new CachedFindTripsQuery(inner, kv);

    await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);

    expect(kv.put).toHaveBeenCalledWith(
      expect.stringContaining('timetable:v2:origin_stop:dest_stop:20260914'),
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

    await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);

    expect(waitUntil).toHaveBeenCalledOnce();
  });

  it('should fall back to D1 when no KV namespace is provided', async () => {
    const query = new CachedFindTripsQuery(inner);

    const results = await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);

    expect(results).toEqual(timetable);
    expect(inner.findByStopsAndDate).toHaveBeenCalledOnce();
  });

  it('should treat a KV read failure as a cache miss', async () => {
    kv.get = vi.fn().mockRejectedValue(new Error('kv unavailable'));

    const query = new CachedFindTripsQuery(inner, kv);

    const results = await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);

    expect(results).toEqual(timetable);
    expect(inner.findByStopsAndDate).toHaveBeenCalledOnce();
  });

  it('should not fail the request when the KV write fails', async () => {
    kv.put = vi.fn().mockRejectedValue(new Error('kv write failed'));

    const query = new CachedFindTripsQuery(inner, kv);

    const results = await query.findByStopsAndDate(originStopId, destinationStopId, '20260914', 0);

    expect(results).toEqual(timetable);
  });
});
