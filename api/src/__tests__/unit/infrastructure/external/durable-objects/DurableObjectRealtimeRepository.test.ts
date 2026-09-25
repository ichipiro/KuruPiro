import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DurableObjectRealtimeRepository,
  resetRealtimeIsolateCache,
} from '@/infrastructure/external/durable-objects/DurableObjectRealtimeRepository';
import { TripId } from '@/domain/value-objects/identifiers';
import type { CachedRealtimeData } from '@/infrastructure/external/durable-objects/types';
import type { Env } from '@/types';

describe('DurableObjectRealtimeRepository', () => {
  const feed: CachedRealtimeData = {
    fetchedAt: 1758000000000,
    tripUpdates: [
      {
        tripId: 'trip1',
        stopTimeUpdates: [
          { stopSequence: 3, stopId: 'stop_a', arrivalDelay: 60, arrivalTime: 1758000100 },
        ],
      },
      { tripId: 'trip2', stopTimeUpdates: [] },
    ],
  };

  let doFetch: ReturnType<typeof vi.fn>;
  let env: Env;
  let waitUntilPromises: Promise<unknown>[];
  let ctx: ExecutionContext;

  /** DOスタブ: since がキャッシュ済みの版と一致したら304を返す本物の挙動を再現 */
  const makeEnv = (data: CachedRealtimeData) => {
    doFetch = vi.fn(async (url: string) => {
      const parsed = new URL(url);
      if (parsed.pathname === '/data') {
        if (parsed.searchParams.get('since') === String(data.fetchedAt)) {
          return new Response(null, { status: 304 });
        }
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ status: 'updated' }));
    });
    return {
      REALTIME_CACHE: {
        idFromName: vi.fn().mockReturnValue('id'),
        get: vi.fn().mockReturnValue({ fetch: doFetch }),
      },
    } as unknown as Env;
  };

  /** シグナルを尊重して永遠に応答しないDO */
  const stallingFetch = () =>
    vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('The operation was aborted', 'AbortError'))
          );
        })
    );

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(feed.fetchedAt);
    resetRealtimeIsolateCache();
    env = makeEnv(feed);
    waitUntilPromises = [];
    ctx = {
      waitUntil: (p: Promise<unknown>) => waitUntilPromises.push(p),
      passThroughOnException: vi.fn(),
    } as unknown as ExecutionContext;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should fetch, map, and cache the feed on first use', async () => {
    const repo = new DurableObjectRealtimeRepository(env, ctx);

    const updates = await repo.getAllTripUpdates();

    expect(updates).toHaveLength(2);
    expect(updates[0].findStopTimeUpdate(3)?.getRepresentativeDelay().seconds).toBe(60);
    expect(doFetch).toHaveBeenCalledTimes(1);
  });

  it('should serve every method from the isolate cache while fresh (no DO calls)', async () => {
    await new DurableObjectRealtimeRepository(env, ctx).getAllTripUpdates();

    // 別リクエスト(別インスタンス)でも30秒以内はDOに触れない
    const repo = new DurableObjectRealtimeRepository(env, ctx);
    const updates = await repo.getTripUpdatesForTrips([
      TripId.fromString('trip1'),
      TripId.fromString('unknown'),
    ]);
    await repo.getLastUpdatedAt();
    await repo.getTripUpdate(TripId.fromString('trip2'));

    expect([...updates.keys()]).toEqual(['trip1']);
    expect(doFetch).toHaveBeenCalledTimes(1);
  });

  it('should serve stale cache immediately and refresh in the background', async () => {
    await new DurableObjectRealtimeRepository(env, ctx).getAllTripUpdates();

    // 30秒経過 → stale
    vi.setSystemTime(feed.fetchedAt + 31_000);
    const repo = new DurableObjectRealtimeRepository(env, ctx);
    const updates = await repo.getAllTripUpdates();

    // 即座にキャッシュから返り、裏更新がwaitUntilに渡される
    expect(updates).toHaveLength(2);
    expect(waitUntilPromises).toHaveLength(1);
    await waitUntilPromises[0];

    // 裏更新は since 付きで問い合わせ、304で同期時刻だけ進む
    expect(String(doFetch.mock.calls[1][0])).toContain(`since=${feed.fetchedAt}`);
    // 同期直後なので次の呼び出しはDOに触れない
    await new DurableObjectRealtimeRepository(env, ctx).getAllTripUpdates();
    expect(doFetch).toHaveBeenCalledTimes(2);
  });

  it('黙るDOを注入しても、staleキャッシュがあれば応答はブロックされない', async () => {
    await new DurableObjectRealtimeRepository(env, ctx).getAllTripUpdates();

    vi.setSystemTime(feed.fetchedAt + 31_000);
    // ここからDOは完全に沈黙する
    doFetch.mockImplementation(stallingFetch());

    const repo = new DurableObjectRealtimeRepository(env, ctx);
    const updates = await repo.getTripUpdatesForTrips([TripId.fromString('trip1')]);

    // タイマーを一切進めずに解決した = DOを待っていない
    expect(updates.get('trip1')).toBeDefined();

    // 裏更新はタイムアウトで静かに失敗し、リクエストに影響しない
    await vi.advanceTimersByTimeAsync(3000);
    await Promise.allSettled(waitUntilPromises);
    // 次のリクエストも引き続きキャッシュから即応答できる
    const again = await new DurableObjectRealtimeRepository(env, ctx).getAllTripUpdates();
    expect(again).toHaveLength(2);
  });

  it('should time out the synchronous path when there is no cache at all', async () => {
    doFetch.mockImplementation(stallingFetch());
    const repo = new DurableObjectRealtimeRepository(env, ctx, 2500);

    const pending = expect(repo.getAllTripUpdates()).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(2600);
    await pending;
  });

  it('should not serve cache older than the staleness limit', async () => {
    await new DurableObjectRealtimeRepository(env, ctx).getAllTripUpdates();

    // 5分超経過 → 同期取得に切り替わる（黙るDOなら失敗してデグレード）
    vi.setSystemTime(feed.fetchedAt + 6 * 60_000);
    doFetch.mockImplementation(stallingFetch());
    const repo = new DurableObjectRealtimeRepository(env, ctx, 1000);

    const pending = expect(repo.getAllTripUpdates()).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(1100);
    await pending;
  });

  it('should share a single in-flight refresh among concurrent requests', async () => {
    const repo = new DurableObjectRealtimeRepository(env, ctx);

    const [a, b, c] = await Promise.all([
      repo.getAllTripUpdates(),
      new DurableObjectRealtimeRepository(env, ctx).getTripUpdatesForTrips([TripId.fromString('trip1')]),
      new DurableObjectRealtimeRepository(env, ctx).getLastUpdatedAt(),
    ]);

    expect(a).toHaveLength(2);
    expect(b.get('trip1')).toBeDefined();
    expect(c).toBe(feed.fetchedAt);
    // 同時に来ても実際のDO通信は1本
    expect(doFetch).toHaveBeenCalledTimes(1);
  });

  it('should re-fetch the full feed when the version changes', async () => {
    await new DurableObjectRealtimeRepository(env, ctx).getAllTripUpdates();

    const newerFeed: CachedRealtimeData = {
      fetchedAt: feed.fetchedAt + 30_000,
      tripUpdates: [{ tripId: 'trip3', stopTimeUpdates: [] }],
    };
    env = makeEnv(newerFeed);
    vi.setSystemTime(feed.fetchedAt + 31_000);

    const repo = new DurableObjectRealtimeRepository(env, ctx);
    await repo.getAllTripUpdates(); // stale → 裏更新をスケジュール
    await Promise.all(waitUntilPromises);

    const updates = await new DurableObjectRealtimeRepository(env, ctx).getAllTripUpdates();
    expect(updates.map((u) => u.tripId.value)).toEqual(['trip3']);
  });

  it('should invalidate the cache on forceUpdate', async () => {
    const repo = new DurableObjectRealtimeRepository(env, ctx);
    await repo.getAllTripUpdates();

    await repo.forceUpdate();
    await repo.getAllTripUpdates();

    // data → update → data（キャッシュ破棄後の取り直し）
    const dataCalls = doFetch.mock.calls.filter(([u]) => String(u).includes('/data'));
    expect(dataCalls).toHaveLength(2);
  });

  it('should return empty updates when the DO has no data yet', async () => {
    doFetch.mockImplementation(async () =>
      new Response('null', { headers: { 'Content-Type': 'application/json' } })
    );
    const repo = new DurableObjectRealtimeRepository(env, ctx);

    await expect(repo.getAllTripUpdates()).resolves.toEqual([]);
  });
});
