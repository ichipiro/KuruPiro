import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  SnapshotRealtimeRepository,
  resetSnapshotCache,
} from '@/infrastructure/external/realtime/SnapshotRealtimeRepository';
import { TripId } from '@/domain/value-objects/identifiers';
import type { CachedRealtimeData } from '@/infrastructure/external/durable-objects/types';
import type { Env } from '@/types';

describe('SnapshotRealtimeRepository', () => {
  const feed: CachedRealtimeData = {
    fetchedAt: 1759000000000,
    tripUpdates: [
      {
        tripId: 'trip1',
        stopTimeUpdates: [
          { stopSequence: 3, stopId: 'stop_a', arrivalDelay: 60, arrivalTime: 1759000100 },
        ],
      },
      { tripId: 'trip2', stopTimeUpdates: [] },
    ],
  };

  let r2Get: ReturnType<typeof vi.fn>;
  let doFetch: ReturnType<typeof vi.fn>;
  let env: Env;
  let waitUntilPromises: Promise<unknown>[];
  let ctx: ExecutionContext;

  /** R2スタブ: onlyIf.etagDoesNotMatch を本物同様に解釈する */
  const makeR2 = (data: CachedRealtimeData | null, etag = 'etag-1') => {
    r2Get = vi.fn(async (_key: string, options?: { onlyIf?: { etagDoesNotMatch?: string } }) => {
      if (data === null) return null;
      if (options?.onlyIf?.etagDoesNotMatch === etag) {
        // 条件不成立（= 変わっていない）: bodyなしのR2Object相当
        return { httpEtag: etag };
      }
      return {
        httpEtag: etag,
        body: {},
        json: async () => data,
      };
    });
    return { get: r2Get, put: vi.fn() };
  };

  const makeEnv = (data: CachedRealtimeData | null, etag?: string) =>
    ({
      REALTIME_BUCKET: makeR2(data, etag),
      REALTIME_CACHE: {
        idFromName: vi.fn().mockReturnValue('id'),
        get: vi.fn().mockReturnValue({
          fetch: (doFetch = vi.fn(async () => new Response('{}'))),
        }),
      },
    }) as unknown as Env;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(feed.fetchedAt);
    resetSnapshotCache();
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

  it('should read the snapshot from R2 and map requested trips lazily', async () => {
    const repo = new SnapshotRealtimeRepository(env, ctx);

    const updates = await repo.getTripUpdatesForTrips([
      TripId.fromString('trip1'),
      TripId.fromString('unknown'),
    ]);

    expect([...updates.keys()]).toEqual(['trip1']);
    expect(updates.get('trip1')?.findStopTimeUpdate(3)?.getRepresentativeDelay().seconds).toBe(60);
    expect(r2Get).toHaveBeenCalledTimes(1);
    // DOには一切触れない（読み取り経路からDO排除）
    expect(doFetch).not.toHaveBeenCalled();
  });

  it('should not touch R2 again while the cache is fresh', async () => {
    await new SnapshotRealtimeRepository(env, ctx).getAllTripUpdates();

    const repo = new SnapshotRealtimeRepository(env, ctx);
    await repo.getTripUpdatesForTrips([TripId.fromString('trip1')]);
    await repo.getLastUpdatedAt();

    expect(r2Get).toHaveBeenCalledTimes(1);
  });

  it('should use a conditional read after freshness expires and keep the cache on etag match', async () => {
    await new SnapshotRealtimeRepository(env, ctx).getAllTripUpdates();

    vi.setSystemTime(feed.fetchedAt + 16_000);
    const updates = await new SnapshotRealtimeRepository(env, ctx).getAllTripUpdates();

    expect(updates).toHaveLength(2);
    expect(r2Get).toHaveBeenCalledTimes(2);
    // 2回目はETag条件付き
    expect(r2Get.mock.calls[1][1]?.onlyIf?.etagDoesNotMatch).toBe('etag-1');
    // 一致（未変更）なので再パースなし。同期時刻だけ進み、次はfresh扱い
    await new SnapshotRealtimeRepository(env, ctx).getAllTripUpdates();
    expect(r2Get).toHaveBeenCalledTimes(2);
  });

  it('should pick up a new snapshot version', async () => {
    await new SnapshotRealtimeRepository(env, ctx).getAllTripUpdates();

    const newerFeed: CachedRealtimeData = {
      fetchedAt: feed.fetchedAt + 15_000,
      tripUpdates: [{ tripId: 'trip3', stopTimeUpdates: [] }],
    };
    env = makeEnv(newerFeed, 'etag-2');
    vi.setSystemTime(feed.fetchedAt + 16_000);

    const updates = await new SnapshotRealtimeRepository(env, ctx).getAllTripUpdates();
    expect(updates.map((u) => u.tripId.value)).toEqual(['trip3']);
  });

  it('should serve the cached snapshot when R2 is slow or failing', async () => {
    await new SnapshotRealtimeRepository(env, ctx).getAllTripUpdates();

    vi.setSystemTime(feed.fetchedAt + 16_000);
    (env.REALTIME_BUCKET.get as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('R2 down')
    );

    const updates = await new SnapshotRealtimeRepository(env, ctx).getTripUpdatesForTrips([
      TripId.fromString('trip1'),
    ]);

    expect(updates.get('trip1')).toBeDefined();
  });

  it('should throw when there is no snapshot and no cache (degrades upstream)', async () => {
    env = makeEnv(feed);
    (env.REALTIME_BUCKET.get as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('R2 down')
    );

    await expect(new SnapshotRealtimeRepository(env, ctx).getAllTripUpdates()).rejects.toThrow();
  });

  it('should return empty when the snapshot object does not exist yet and ping the poller', async () => {
    env = makeEnv(null);

    const updates = await new SnapshotRealtimeRepository(env, ctx).getAllTripUpdates();

    expect(updates).toEqual([]);
    // ポーラーの起動を促す（初回デプロイ直後のブートストラップ）
    expect(doFetch).toHaveBeenCalledWith('https://fake-host/ensure-alarm');
  });

  it('should ping the poller when the snapshot is stale (alarm watchdog)', async () => {
    // fetchedAtが古いスナップショットを配信している状態
    const staleFeed: CachedRealtimeData = { ...feed, fetchedAt: feed.fetchedAt - 60_000 };
    env = makeEnv(staleFeed);

    await new SnapshotRealtimeRepository(env, ctx).getAllTripUpdates();

    expect(doFetch).toHaveBeenCalledWith('https://fake-host/ensure-alarm');
    expect(waitUntilPromises.length).toBeGreaterThan(0);
  });

  it('should share a single in-flight R2 read among concurrent requests', async () => {
    const [a, b] = await Promise.all([
      new SnapshotRealtimeRepository(env, ctx).getAllTripUpdates(),
      new SnapshotRealtimeRepository(env, ctx).getTripUpdatesForTrips([TripId.fromString('trip2')]),
    ]);

    expect(a).toHaveLength(2);
    expect(b.get('trip2')).toBeDefined();
    expect(r2Get).toHaveBeenCalledTimes(1);
  });

  it('should invalidate the cache on forceUpdate', async () => {
    const repo = new SnapshotRealtimeRepository(env, ctx);
    await repo.getAllTripUpdates();

    await repo.forceUpdate();
    await repo.getAllTripUpdates();

    expect(doFetch).toHaveBeenCalledWith('https://fake-host/update');
    expect(r2Get).toHaveBeenCalledTimes(2);
  });
});
