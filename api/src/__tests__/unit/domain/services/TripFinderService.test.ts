import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TripFinderService } from '@/domain/services/TripFinderService';
import { StopId, TripId } from '@/domain/value-objects/identifiers';
import { JSTDateTime } from '@/domain/value-objects/time';
import { GTFSTime } from '@/domain/value-objects/time';
import { TripUpdate, StopTimeUpdate } from '@/domain/entities/TripUpdate';
import type { IFindTripsQuery, TripSearchResult } from '@/domain/queries';
import type { IRealtimeRepository } from '@/domain/repositories';

describe('TripFinderService', () => {
  let service: TripFinderService;
  let mockQuery: IFindTripsQuery;
  let mockRealtimeRepo: IRealtimeRepository;

  const originStopId = StopId.fromString('origin_stop');
  const destinationStopId = StopId.fromString('dest_stop');

  /**
   * 到着時刻とtripIdだけ差し替えた時刻表エントリを作る
   */
  const tripResult = (tripId: string, arrivalTime: string): TripSearchResult => ({
    tripId,
    arrivalTime: GTFSTime.fromString(arrivalTime),
    stopSequence: 5,
    routeShortName: '1',
    destinationStopId: 'dest_stop',
    destinationLabel: '終点',
    serviceId: 'weekday',
  });

  beforeEach(() => {
    // Mock IFindTripsQuery
    mockQuery = {
      findByStopsAndDate: vi.fn(),
    };

    // Mock IRealtimeRepository
    mockRealtimeRepo = {
      getAllTripUpdates: vi.fn(),
      getTripUpdatesForTrips: vi.fn().mockResolvedValue(new Map()),
      getTripUpdate: vi.fn(),
      getLastUpdatedAt: vi.fn(),
      forceUpdate: vi.fn(),
    } as unknown as IRealtimeRepository;
  });

  describe('findTrips', () => {
    it('should query the timetable by weekday without a time argument', async () => {
      vi.mocked(mockQuery.findByStopsAndDate).mockResolvedValue([]);

      service = new TripFinderService(mockQuery, mockRealtimeRepo);

      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0); // Monday

      await service.findTrips(originStopId, destinationStopId, currentDateTime);

      // 時刻表が空ならリアルタイムの問い合わせ自体が不要
      expect(mockRealtimeRepo.getTripUpdatesForTrips).not.toHaveBeenCalled();
      expect(mockQuery.findByStopsAndDate).toHaveBeenCalledWith(
        originStopId,
        destinationStopId,
        '20250106',
        0 // Monday
      );
    });

    it('should keep only trips arriving at or after the current time', async () => {
      vi.mocked(mockQuery.findByStopsAndDate).mockResolvedValue([
        tripResult('past', '09:59:00'),
        tripResult('now', '10:00:00'),
        tripResult('future', '10:01:00'),
      ]);

      service = new TripFinderService(mockQuery); // No realtime repo

      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const results = await service.findTrips(
        originStopId,
        destinationStopId,
        currentDateTime
      );

      expect(results.map((r) => r.tripId)).toEqual(['now', 'future']);
    });

    it('should keep trips that are past their scheduled time but present in realtime', async () => {
      // 遅延中の便は予定時刻を過ぎていても運行中なので残す
      vi.mocked(mockRealtimeRepo.getTripUpdatesForTrips).mockResolvedValue(
        new Map([
          [
            'delayed',
            TripUpdate.create(TripId.fromString('delayed'), [
              StopTimeUpdate.create({ stopId: originStopId }),
            ]),
          ],
        ])
      );
      vi.mocked(mockQuery.findByStopsAndDate).mockResolvedValue([
        tripResult('delayed', '09:50:00'),
        tripResult('gone', '09:51:00'),
        tripResult('future', '10:30:00'),
      ]);

      service = new TripFinderService(mockQuery, mockRealtimeRepo);

      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const results = await service.findTrips(
        originStopId,
        destinationStopId,
        currentDateTime
      );

      expect(results.map((r) => r.tripId)).toEqual(['delayed', 'future']);
    });

    it('should fall back to timetable-only results when realtime fails', async () => {
      vi.mocked(mockRealtimeRepo.getTripUpdatesForTrips).mockRejectedValue(new Error('DO timeout'));
      vi.mocked(mockQuery.findByStopsAndDate).mockResolvedValue([
        tripResult('gone', '09:50:00'),
        tripResult('future', '10:30:00'),
      ]);

      service = new TripFinderService(mockQuery, mockRealtimeRepo);
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const results = await service.findTrips(originStopId, destinationStopId, currentDateTime);

      // リアルタイム免除は効かないが、時刻表ベースの結果は返る
      expect(results.map((r) => r.tripId)).toEqual(['future']);
    });

    it('should correctly calculate weekday (Sunday = 6)', async () => {
      vi.mocked(mockQuery.findByStopsAndDate).mockResolvedValue([]);

      service = new TripFinderService(mockQuery);

      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 12, 9, 0, 0); // Sunday

      await service.findTrips(originStopId, destinationStopId, currentDateTime);

      expect(mockQuery.findByStopsAndDate).toHaveBeenCalledWith(
        originStopId,
        destinationStopId,
        '20250112',
        6 // Sunday
      );
    });

    it('should handle late-night times (25:30:00 for 01:30 next day)', async () => {
      vi.mocked(mockRealtimeRepo.getTripUpdatesForTrips).mockResolvedValue(new Map());
      vi.mocked(mockQuery.findByStopsAndDate).mockResolvedValue([
        tripResult('before', '25:29:00'),
        tripResult('after', '25:31:00'),
      ]);

      service = new TripFinderService(mockQuery, mockRealtimeRepo);

      // 1:30 AM on Tuesday (should be treated as Monday 25:30:00 in GTFS)
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 7, 1, 30, 0);

      const results = await service.findTrips(
        originStopId,
        destinationStopId,
        currentDateTime
      );

      expect(mockQuery.findByStopsAndDate).toHaveBeenCalledWith(
        originStopId,
        destinationStopId,
        '20250106', // 前日(月曜)のサービス日として扱われる
        0 // Monday (because it's considered late Monday night)
      );
      expect(results.map((r) => r.tripId)).toEqual(['after']);
    });

    it('should return empty array when no trips found', async () => {
      vi.mocked(mockQuery.findByStopsAndDate).mockResolvedValue([]);

      service = new TripFinderService(mockQuery);

      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const results = await service.findTrips(
        originStopId,
        destinationStopId,
        currentDateTime
      );

      expect(results).toEqual([]);
    });

    it('should pass the prefix destination through to the query as-is', async () => {
      const prefixDest = StopId.fromString('dest_');

      vi.mocked(mockQuery.findByStopsAndDate).mockResolvedValue([]);

      service = new TripFinderService(mockQuery);

      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      await service.findTrips(originStopId, prefixDest, currentDateTime);

      expect(mockQuery.findByStopsAndDate).toHaveBeenCalledWith(
        originStopId,
        prefixDest,
        '20250106',
        0
      );
    });
  });
});
