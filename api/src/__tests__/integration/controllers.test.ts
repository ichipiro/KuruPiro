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
      ANALYTICS: {} as any,
      DEBUG_MODE: 'false',
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
    describe('getTrips (new API)', () => {
      it('should return next buses with query parameters', async () => {
        app.get('/api/trips', async (c) => {
          c.set('factory', mockFactory);
          return await BusController.getTrips(c);
        });

        const response = await app.request('/api/trips?origin=origin_stop&destination=dest_stop', {
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

      it('should handle limit parameter', async () => {
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
          currentLocation: '',
        }));

        mockFactory = {
          getFindNextBusesUseCase: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue(multipleBuses),
          }),
        } as any;

        app.get('/api/trips', async (c) => {
          c.set('factory', mockFactory);
          return await BusController.getTrips(c);
        });

        const response = await app.request('/api/trips?origin=origin&destination=dest&limit=3', {
          method: 'GET',
        });

        expect(response.status).toBe(200);

        const data = (await response.json()) as any[];
        expect(data).toHaveLength(3);
      });

      it('should return 400 for missing origin parameter', async () => {
        app.get('/api/trips', async (c) => {
          c.set('factory', mockFactory);
          return await BusController.getTrips(c);
        });

        const response = await app.request('/api/trips?destination=dest');
        expect(response.status).toBe(400);

        const data = (await response.json()) as any;
        expect(data).toHaveProperty('error');
        expect(data.error).toBe('origin and destination are required');
      });

      it('should return 400 for missing destination parameter', async () => {
        app.get('/api/trips', async (c) => {
          c.set('factory', mockFactory);
          return await BusController.getTrips(c);
        });

        const response = await app.request('/api/trips?origin=origin');
        expect(response.status).toBe(400);

        const data = (await response.json()) as any;
        expect(data).toHaveProperty('error');
        expect(data.error).toBe('origin and destination are required');
      });

      it('should handle via parameter', async () => {
        app.get('/api/trips', async (c) => {
          c.set('factory', mockFactory);
          return await BusController.getTrips(c);
        });

        const response = await app.request('/api/trips?origin=origin&destination=dest&via=via1,via2');
        expect(response.status).toBe(200);

        const data = (await response.json()) as any[];
        expect(Array.isArray(data)).toBe(true);
      });
    });
  });

  describe('BusController.batchTrips', () => {
    it('should return array of arrays for each query', async () => {
      app.post('/api/trips/batch', async (c) => {
        c.set('factory', mockFactory);
        return await BusController.batchTrips(c);
      });

      const response = await app.request('/api/trips/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { origin: '22030_2', destination: '51240_', limit: 5 },
          { origin: '24140_1', destination: '51240_', via: 'via1', limit: 5 },
        ]),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as any[][];
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
      expect(Array.isArray(data[0])).toBe(true);
      expect(Array.isArray(data[1])).toBe(true);
      expect(data[0][0]).toMatchObject({ trip_id: 'trip1', trip_short_id: '1' });
    });

    it('should return 400 for non-array body', async () => {
      app.post('/api/trips/batch', async (c) => {
        c.set('factory', mockFactory);
        return await BusController.batchTrips(c);
      });

      const response = await app.request('/api/trips/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: '22030_2', destination: '51240_' }),
      });

      expect(response.status).toBe(400);
      const data = (await response.json()) as any;
      expect(data).toHaveProperty('error');
    });

    it('should return 400 when a query item is missing origin', async () => {
      app.post('/api/trips/batch', async (c) => {
        c.set('factory', mockFactory);
        return await BusController.batchTrips(c);
      });

      const response = await app.request('/api/trips/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ destination: '51240_' }]),
      });

      expect(response.status).toBe(400);
      const data = (await response.json()) as any;
      expect(data.error).toContain('queries[0]');
    });

    it('should apply limit per query', async () => {
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
        currentLocation: '',
      }));

      mockFactory = {
        getFindNextBusesUseCase: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue(multipleBuses),
        }),
      } as any;

      app.post('/api/trips/batch', async (c) => {
        c.set('factory', mockFactory);
        return await BusController.batchTrips(c);
      });

      const response = await app.request('/api/trips/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { origin: '22030_2', destination: '51240_', limit: 3 },
          { origin: '24140_1', destination: '51240_', limit: 2 },
        ]),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as any[][];
      expect(data[0]).toHaveLength(3);
      expect(data[1]).toHaveLength(2);
    });
  });

  describe('StopController', () => {
    describe('getStopInfo', () => {
      it('should return stop info successfully', async () => {
        app.get('/api/stops/:stop_id', async (c) => {
          c.set('factory', mockFactory);
          return await StopController.getStopInfo(c);
        });

        const response = await app.request('/api/stops/test_stop');
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

        app.get('/api/stops/:stop_id', async (c) => {
          c.set('factory', mockFactory);
          return await StopController.getStopInfo(c);
        });

        const response = await app.request('/api/stops/unknown');
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

        app.get('/api/stops/:stop_id', async (c) => {
          c.set('factory', mockFactory);
          return await StopController.getStopInfo(c);
        });

        const response = await app.request('/api/stops/test');
        expect(response.status).toBe(500);

        const data = (await response.json()) as any;
        expect(data).toHaveProperty('error');
      });
    });
  });
});
