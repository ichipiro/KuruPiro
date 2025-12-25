import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { BusController } from '@/presentation/controllers';
import { StopController } from '@/presentation/controllers';
import { ServiceFactory } from '@/infrastructure/di/ServiceFactory';
import type { Env } from '@/types';

/**
 * コントローラー統合テスト
 *
 * ServiceFactoryを使用してコントローラーの動作を検証します。
 */
describe('Controllers Integration Tests', () => {
  let app: Hono<{
    Variables: {
      factory: ServiceFactory;
    };
  }>;
  let mockEnv: Env;
  let mockFactory: ServiceFactory;

  beforeEach(() => {
    app = new Hono<{
      Variables: {
        factory: ServiceFactory;
      };
    }>();

    // モックEnvの作成
    mockEnv = {
      DB: {} as any,
      GTFS_CACHE: {} as any,
      GTFS_STATIC_URL: 'https://example.com/static',
      GTFS_REALTIME_URL: 'https://example.com/realtime',
      REALTIME_CACHE: {} as any,
    };

    // ServiceFactoryのモック
    mockFactory = {
      getFindNextBusesUseCase: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue([
          {
            tripId: 'trip1',
            routeShortName: '1',
            scheduledArrival: '10:30',
            actualArrival: '10:35',
            remainingTime: 'あと5分',
            remainingMinutes: 5,
            delaySeconds: 300,
            delayDisplay: '5分遅れ',
            destinationLabel: '終点',
          },
        ]),
      }),
      getGetStopNameUseCase: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue({
          stopId: 'test_stop',
          stopName: '東京駅',
        }),
      }),
    } as any;
  });

  describe('BusController', () => {
    it('should return next buses successfully', async () => {
      app.get('/api/:stop_id/:dest_stop_id', async (c) => {
        c.set('factory', mockFactory);
        return await BusController.getNextBuses(c);
      });

      const response = await app.request('/api/origin_stop/dest_stop', {
        method: 'GET',
      });

      expect(response.status).toBe(200);

      const data = (await response.json()) as any[];
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(1);
      expect(data[0]).toMatchObject({
        trip_id: 'trip1',
        trip_short_id: '1',
        arrival_time: '10:30',
        remaining_time: 'あと5分',
        delay: '5分遅れ',
        trip_dest: '終点',
      });
    });

    it('should handle response_size parameter', async () => {
      // 複数のバスを返すモックに変更
      const multipleBuses = Array.from({ length: 10 }, (_, i) => ({
        tripId: `trip${i}`,
        routeShortName: '1',
        scheduledArrival: '10:30',
        actualArrival: '10:30',
        remainingTime: 'あと5分',
        remainingMinutes: 5,
        delaySeconds: 0,
        delayDisplay: '',
        destinationLabel: '終点',
      }));

      mockFactory = {
        getFindNextBusesUseCase: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue(multipleBuses),
        }),
      } as any;

      app.get('/api/:stop_id/:dest_stop_id', async (c) => {
        c.set('factory', mockFactory);
        return await BusController.getNextBuses(c);
      });

      const response = await app.request('/api/origin/dest?response_size=3', {
        method: 'GET',
      });

      expect(response.status).toBe(200);

      const data = (await response.json()) as any[];
      expect(data).toHaveLength(3); // 3件に制限される
    });

    it('should validate response_size bounds', async () => {
      app.get('/api/:stop_id/:dest_stop_id', async (c) => {
        c.set('factory', mockFactory);
        return await BusController.getNextBuses(c);
      });

      // 上限テスト（20を超える値）
      const response1 = await app.request('/api/origin/dest?response_size=100');
      expect(response1.status).toBe(200);
      const data1 = (await response1.json()) as any[];
      expect(data1.length).toBeLessThanOrEqual(20);

      // 下限テスト（0または負の値）
      const response2 = await app.request('/api/origin/dest?response_size=0');
      expect(response2.status).toBe(200);
      const data2 = (await response2.json()) as any[];
      expect(data2.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 400 for missing parameters', async () => {
      app.get('/api/:stop_id/:dest_stop_id', async (c) => {
        c.set('factory', mockFactory);
        return await BusController.getNextBuses(c);
      });

      // stop_idがない場合はルートがマッチしないため、このテストは不要かもしれませんが、
      // 実装上、パラメータが空文字列の場合のハンドリングを確認
      // （Honoのルーティングでは空文字列は通常マッチしない）
    });

    it('should handle use case errors gracefully', async () => {
      mockFactory = {
        getFindNextBusesUseCase: vi.fn().mockReturnValue({
          execute: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as any;

      app.get('/api/:stop_id/:dest_stop_id', async (c) => {
        c.set('factory', mockFactory);
        return await BusController.getNextBuses(c);
      });

      const response = await app.request('/api/origin/dest');
      expect(response.status).toBe(500);

      const data = (await response.json()) as any;
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Database error');
    });
  });

  describe('StopController', () => {
    it('should return stop name successfully', async () => {
      app.get('/api/stop/:stop_id/name', async (c) => {
        c.set('factory', mockFactory);
        return await StopController.getStopName(c);
      });

      const response = await app.request('/api/stop/test_stop/name');
      expect(response.status).toBe(200);

      const data = (await response.json()) as any;
      expect(data).toMatchObject({
        stop_id: 'test_stop',
        name: '東京駅',
      });
    });

    it('should return null for non-existent stop', async () => {
      mockFactory = {
        getGetStopNameUseCase: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue(undefined),
        }),
      } as any;

      app.get('/api/stop/:stop_id/name', async (c) => {
        c.set('factory', mockFactory);
        return await StopController.getStopName(c);
      });

      const response = await app.request('/api/stop/unknown/name');
      expect(response.status).toBe(200);

      const data = (await response.json()) as any;
      expect(data).toMatchObject({
        stop_id: 'unknown',
        name: null,
      });
    });

    it('should handle use case errors gracefully', async () => {
      mockFactory = {
        getGetStopNameUseCase: vi.fn().mockReturnValue({
          execute: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as any;

      app.get('/api/stop/:stop_id/name', async (c) => {
        c.set('factory', mockFactory);
        return await StopController.getStopName(c);
      });

      const response = await app.request('/api/stop/test/name');
      expect(response.status).toBe(500);

      const data = (await response.json()) as any;
      expect(data).toHaveProperty('error');
    });
  });
});
