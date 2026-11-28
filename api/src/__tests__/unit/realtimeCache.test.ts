import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtimeCache } from '@/realtimeCache';
import { ProtobufDecoder } from '@/infrastructure/external/gtfs/ProtobufDecoder';
import type { Env } from '@/types';

vi.mock('@/infrastructure/external/gtfs/ProtobufDecoder', () => ({
  ProtobufDecoder: {
    decodeTripUpdates: vi.fn(),
  },
}));

describe('RealtimeCache', () => {
  const tripUpdates = [
    {
      tripId: 'trip1',
      stopTimeUpdates: [{ stopSequence: 3, stopId: 'stop_a', arrivalDelay: 60 }],
    },
  ];

  let storage: {
    get: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    setAlarm: ReturnType<typeof vi.fn>;
    getAlarm: ReturnType<typeof vi.fn>;
  };
  let r2Put: ReturnType<typeof vi.fn>;
  let env: Env;
  let cache: RealtimeCache;

  const makeCache = (overrides: Partial<Record<keyof Env, string>> = {}) => {
    storage = {
      get: vi.fn(async () => null),
      put: vi.fn(async () => undefined),
      setAlarm: vi.fn(async () => undefined),
      getAlarm: vi.fn(async () => null),
    };
    r2Put = vi.fn(async () => undefined);
    env = {
      GTFS_REALTIME_URL: 'https://example.com/trip_updates.bin',
      REALTIME_UPDATE_INTERVAL: '15',
      REALTIME_BUCKET: { put: r2Put },
      ...overrides,
    } as unknown as Env;
    return new RealtimeCache({ storage } as unknown as DurableObjectState, env);
  };

  beforeEach(() => {
    vi.mocked(ProtobufDecoder.decodeTripUpdates).mockResolvedValue(tripUpdates);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(new ArrayBuffer(8)))
    );
    cache = makeCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('/update はR2スナップショットのみに書き、DOストレージには書かない', async () => {
    const response = await cache.fetch(new Request('https://fake-host/update'));

    expect(await response.json()).toEqual({ status: 'updated' });
    expect(r2Put).toHaveBeenCalledTimes(1);
    const [key, body] = r2Put.mock.calls[0];
    expect(key).toBe('realtime/trip-updates.json');
    expect(JSON.parse(body as string).tripUpdates).toEqual(tripUpdates);
    // 二重書き込みの撤去: DOストレージへは一切書かない
    expect(storage.put).not.toHaveBeenCalled();
  });

  it('/update はalarmチェーンが死んでいれば復活させる（alarm管理のストレージAPIは残す）', async () => {
    storage.getAlarm.mockResolvedValue(null);

    await cache.fetch(new Request('https://fake-host/update'));

    expect(storage.setAlarm).toHaveBeenCalledTimes(1);
  });

  it('alarm() は更新後に次のalarmを予約し、ストレージには書かない', async () => {
    await cache.alarm();

    expect(r2Put).toHaveBeenCalledTimes(1);
    expect(storage.setAlarm).toHaveBeenCalledTimes(1);
    expect(storage.put).not.toHaveBeenCalled();
  });

  it('更新失敗時もストレージには書かず、alarmは60秒退避で予約する', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 500 }))
    );

    await cache.alarm();

    expect(r2Put).not.toHaveBeenCalled();
    expect(storage.put).not.toHaveBeenCalled();
    expect(storage.setAlarm).toHaveBeenCalledTimes(1);
  });

  it('旧読み取りルート /data・/updates は存在しない（404）', async () => {
    const dataResponse = await cache.fetch(new Request('https://fake-host/data'));
    const updatesResponse = await cache.fetch(
      new Request('https://fake-host/updates', {
        method: 'POST',
        body: JSON.stringify({ tripIds: ['trip1'] }),
      })
    );

    expect(dataResponse.status).toBe(404);
    expect(updatesResponse.status).toBe(404);
    expect(storage.get).not.toHaveBeenCalled();
  });

  it('/ensure-alarm はalarmが生きていれば何もしない', async () => {
    storage.getAlarm.mockResolvedValue(Date.now() + 5000);

    const response = await cache.fetch(new Request('https://fake-host/ensure-alarm'));

    expect(await response.json()).toEqual({ alarmScheduled: true });
    expect(storage.setAlarm).not.toHaveBeenCalled();
  });

  it('ポーラー無効環境では /update を403で拒否しR2にも書かない', async () => {
    cache = makeCache({ REALTIME_POLLER_ENABLED: 'false' });

    const response = await cache.fetch(new Request('https://fake-host/update'));

    expect(response.status).toBe(403);
    expect(r2Put).not.toHaveBeenCalled();
    expect(storage.put).not.toHaveBeenCalled();
  });
});
