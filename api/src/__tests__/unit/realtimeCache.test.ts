import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtimeCache } from '@/realtimeCache';
import { ProtobufDecoder } from '@/infrastructure/external/gtfs/ProtobufDecoder';
import type { Env } from '@/types';

vi.mock('@/infrastructure/external/gtfs/ProtobufDecoder', () => ({
  ProtobufDecoder: {
    decodeTripUpdates: vi.fn(),
  },
}));

vi.mock('@sentry/cloudflare', () => ({
  captureCheckIn: vi.fn(),
}));

import { captureCheckIn } from '@sentry/cloudflare';

describe('RealtimeCache', () => {
  const NOW = Date.parse('2026-11-28T00:00:00Z');
  const tripUpdates = [
    {
      tripId: 'trip1',
      stopTimeUpdates: [{ stopSequence: 3, stopId: 'stop_a', arrivalDelay: 60 }],
    },
  ];

  let storage: {
    get: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
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
      delete: vi.fn(async () => true),
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
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.mocked(ProtobufDecoder.decodeTripUpdates).mockResolvedValue(tripUpdates);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(new ArrayBuffer(8)))
    );
    cache = makeCache();
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it('alarm() は更新後に次のalarmを更新間隔(15秒)後に予約し、ストレージには書かない', async () => {
    await cache.alarm();

    expect(r2Put).toHaveBeenCalledTimes(1);
    expect(storage.setAlarm).toHaveBeenCalledTimes(1);
    expect(storage.setAlarm).toHaveBeenCalledWith(NOW + 15_000);
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
    expect(storage.setAlarm).toHaveBeenCalledWith(NOW + 60_000);
  });

  it('初回更新時に旧キー realtimeData を掃除する（isolateにつき1回だけ）', async () => {
    await cache.alarm();
    await cache.alarm();

    expect(storage.delete).toHaveBeenCalledTimes(1);
    expect(storage.delete).toHaveBeenCalledWith('realtimeData');
  });

  it('旧キーの掃除に失敗しても更新は続行する', async () => {
    storage.delete.mockRejectedValue(new Error('storage down'));

    const response = await cache.fetch(new Request('https://fake-host/update'));

    expect(await response.json()).toEqual({ status: 'updated' });
    expect(r2Put).toHaveBeenCalledTimes(1);
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
  describe('Sentry Cronsハートビート', () => {
    it('SENTRY_DSN設定時、更新成功でcheck-inを送り、1分以内は間引く', async () => {
      cache = makeCache({ SENTRY_DSN: 'https://key@example.ingest.sentry.io/1' });

      await cache.alarm();
      expect(captureCheckIn).toHaveBeenCalledTimes(1);
      expect(vi.mocked(captureCheckIn).mock.calls[0][0]).toEqual({
        monitorSlug: 'realtime-poller',
        status: 'ok',
      });

      // 15秒後の次アラームでは送らない（1分間引き）
      vi.setSystemTime(NOW + 15_000);
      await cache.alarm();
      expect(captureCheckIn).toHaveBeenCalledTimes(1);

      // 60秒経過後は再送する
      vi.setSystemTime(NOW + 61_000);
      await cache.alarm();
      expect(captureCheckIn).toHaveBeenCalledTimes(2);
    });

    it('SENTRY_DSN未設定ならcheck-inを送らない', async () => {
      await cache.alarm();
      expect(captureCheckIn).not.toHaveBeenCalled();
    });

    it('更新失敗時はcheck-inを送らない（missed check-inとして検知させる）', async () => {
      cache = makeCache({ SENTRY_DSN: 'https://key@example.ingest.sentry.io/1' });
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response(null, { status: 500 }))
      );

      await cache.alarm();

      expect(captureCheckIn).not.toHaveBeenCalled();
      // 失敗退避(60秒)は通常通り
      expect(storage.setAlarm).toHaveBeenCalledWith(NOW + 60_000);
    });

    it('check-in送信の失敗はポーラー本務に影響しない', async () => {
      cache = makeCache({ SENTRY_DSN: 'https://key@example.ingest.sentry.io/1' });
      vi.mocked(captureCheckIn).mockImplementation(() => {
        throw new Error('sentry down');
      });

      await cache.alarm();

      expect(r2Put).toHaveBeenCalledTimes(1);
      // 成功扱いのまま15秒間隔で次を予約する
      expect(storage.setAlarm).toHaveBeenCalledWith(NOW + 15_000);
    });
  });
});
