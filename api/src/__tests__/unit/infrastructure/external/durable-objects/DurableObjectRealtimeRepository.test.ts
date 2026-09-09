import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DurableObjectRealtimeRepository,
  resetRealtimeIsolateCache,
} from '@/infrastructure/external/durable-objects/DurableObjectRealtimeRepository';
import { TripId } from '@/domain/value-objects/identifiers';
import type { CachedRealtimeData } from '@/infrastructure/external/durable-objects/types';
import type { Env } from '@/types';

describe('DurableObjectRealtimeRepository', () => {
  const feed: CachedRealtimeData = {
    fetchedAt: 1757000000000,
    tripUpdates: [
      {
        tripId: 'trip1',
        stopTimeUpdates: [
          { stopSequence: 3, stopId: 'stop_a', arrivalDelay: 60, arrivalTime: 1757000100 },
        ],
      },
      { tripId: 'trip2', stopTimeUpdates: [] },
    ],
  };

  let doFetch: ReturnType<typeof vi.fn>;
  let env: Env;

  /** DOスタブ: since がキャッシュ済みの版と一致したら304を返す本物の挙動を再現 */
  const makeEnv = (data: CachedRealtimeData) => {
    doFetch = vi.fn(async (url: string) => {
      const parsed = new URL(url);
      if (parsed.pathname === '/data') {
        if (parsed.searchParams.get('since') === String(data.fetchedAt)) {
          return new Response(null, {
            status: 304,
            headers: { 'X-Fetched-At': String(data.fetchedAt) },
          });
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

  beforeEach(() => {
    resetRealtimeIsolateCache();
    env = makeEnv(feed);
  });

  it('should parse the feed and map trip updates to domain entities', async () => {
    const repo = new DurableObjectRealtimeRepository(env);

    const updates = await repo.getAllTripUpdates();

    expect(updates).toHaveLength(2);
    expect(updates[0].tripId.value).toBe('trip1');
    expect(updates[0].findStopTimeUpdate(3)?.getRepresentativeDelay().seconds).toBe(60);
  });

  it('should fetch the DO only once per request scope', async () => {
    const repo = new DurableObjectRealtimeRepository(env);

    await Promise.all([
      repo.getAllTripUpdates(),
      repo.getTripUpdate(TripId.fromString('trip1')),
      repo.getLastUpdatedAt(),
    ]);

    expect(doFetch).toHaveBeenCalledTimes(1);
  });

  it('should reuse the isolate cache via 304 when the feed is unchanged', async () => {
    const first = new DurableObjectRealtimeRepository(env);
    const firstResult = await first.getAllTripUpdates();

    // 別リクエスト（別リポジトリインスタンス）: since付きで問い合わせ304を受ける
    const second = new DurableObjectRealtimeRepository(env);
    const secondResult = await second.getAllTripUpdates();

    expect(doFetch).toHaveBeenCalledTimes(2);
    expect(String(doFetch.mock.calls[1][0])).toContain(`since=${feed.fetchedAt}`);
    // 変換済みエンティティがそのまま再利用される（再パースなし）
    expect(secondResult).toBe(firstResult);
  });

  it('should re-parse when the feed version changes', async () => {
    const first = new DurableObjectRealtimeRepository(env);
    await first.getAllTripUpdates();

    // フィードが更新された（fetchedAtが変わった）
    const newerFeed: CachedRealtimeData = {
      fetchedAt: feed.fetchedAt + 30000,
      tripUpdates: [{ tripId: 'trip3', stopTimeUpdates: [] }],
    };
    env = makeEnv(newerFeed);

    const second = new DurableObjectRealtimeRepository(env);
    const updates = await second.getAllTripUpdates();

    expect(updates).toHaveLength(1);
    expect(updates[0].tripId.value).toBe('trip3');
  });

  it('should invalidate caches on forceUpdate', async () => {
    const repo = new DurableObjectRealtimeRepository(env);
    await repo.getAllTripUpdates();

    await repo.forceUpdate();
    await repo.getAllTripUpdates();

    // data → update → data（sinceなしの完全取得）
    const dataCalls = doFetch.mock.calls.filter(([u]) => String(u).includes('/data'));
    expect(dataCalls).toHaveLength(2);
    expect(String(dataCalls[1][0])).not.toContain('since=');
  });

  it('should return empty updates when the DO has no data yet', async () => {
    doFetch.mockResolvedValueOnce(
      new Response('null', { headers: { 'Content-Type': 'application/json' } })
    );
    const repo = new DurableObjectRealtimeRepository(env);

    const updates = await repo.getAllTripUpdates();

    expect(updates).toEqual([]);
  });
});
