import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TripFinderService } from '@/domain/services/TripFinderService';
import { StopId, TripId } from '@/domain/value-objects/identifiers';
import { JSTDateTime } from '@/domain/value-objects/time';
import { GTFSTime } from '@/domain/value-objects/time';
import { TripUpdate, StopTimeUpdate } from '@/domain/entities/TripUpdate';
import type { FindTripsQuery, TripSearchResult } from '@/infrastructure/persistence/queries/FindTripsQuery';
import type { IRealtimeRepository } from '@/domain/repositories';

describe('TripFinderService', () => {
  let service: TripFinderService;
  let mockQuery: FindTripsQuery;
  let mockRealtimeRepo: IRealtimeRepository;

  const originStopId = StopId.fromString('origin_stop');
  const destinationStopId = StopId.fromString('dest_stop');

  const mockTripResults: TripSearchResult[] = [
    {
      tripId: 'trip1',
      arrivalTime: GTFSTime.fromString('10:00:00'),
      stopSequence: 5,
      routeShortName: '1',
      destinationStopId: 'dest_stop',
      destinationLabel: '終点',
      serviceId: 'weekday',
    },
  ];

  beforeEach(() => {
    // Mock FindTripsQuery
    mockQuery = {
      findByStopsAndTimeWithRealtime: vi.fn(),
    } as unknown as FindTripsQuery;

    // Mock IRealtimeRepository
    mockRealtimeRepo = {
      getAllTripUpdates: vi.fn(),
      getTripUpdate: vi.fn(),
      getLastUpdatedAt: vi.fn(),
      forceUpdate: vi.fn(),
    } as unknown as IRealtimeRepository;
  });

  describe('findTrips', () => {
    it('should filter realtimeTripIds by origin and dest, then call findByStopsAndTimeWithRealtime', async () => {
      // trip1 has both origin and dest → should be included
      const tripWithBoth = TripUpdate.create(TripId.fromString('trip1'), [
        StopTimeUpdate.create({ stopId: originStopId }),
        StopTimeUpdate.create({ stopId: destinationStopId }),
      ]);
      // trip2 has only origin → should not be included
      const tripWithOnlyOrigin = TripUpdate.create(TripId.fromString('trip2'), [
        StopTimeUpdate.create({ stopId: originStopId }),
      ]);

      vi.mocked(mockRealtimeRepo.getAllTripUpdates).mockResolvedValue([
        tripWithBoth,
        tripWithOnlyOrigin,
      ]);
      vi.mocked(mockQuery.findByStopsAndTimeWithRealtime).mockResolvedValue(mockTripResults);

      service = new TripFinderService(mockQuery, mockRealtimeRepo);

      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0); // Monday

      const results = await service.findTrips(
        originStopId,
        destinationStopId,
        currentDateTime
      );

      expect(mockRealtimeRepo.getAllTripUpdates).toHaveBeenCalledOnce();
      expect(mockQuery.findByStopsAndTimeWithRealtime).toHaveBeenCalledWith(
        originStopId,
        destinationStopId,
        0, // Monday
        GTFSTime.fromString('10:00:00'),
        ['trip1'] // only trip1 has both origin and dest
      );
      expect(results).toEqual(mockTripResults);
    });

    it('should call findByStopsAndTimeWithRealtime with empty realtimeTripIds when realtimeRepo is not provided', async () => {
      vi.mocked(mockQuery.findByStopsAndTimeWithRealtime).mockResolvedValue(mockTripResults);

      service = new TripFinderService(mockQuery); // No realtime repo

      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 7, 14, 30, 0); // Tuesday

      const results = await service.findTrips(
        originStopId,
        destinationStopId,
        currentDateTime
      );

      expect(mockQuery.findByStopsAndTimeWithRealtime).toHaveBeenCalledWith(
        originStopId,
        destinationStopId,
        1, // Tuesday
        GTFSTime.fromString('14:30:00'),
        [] // no realtime IDs
      );
      expect(results).toEqual(mockTripResults);
    });

    it('should correctly calculate weekday (Sunday = 6)', async () => {
      vi.mocked(mockQuery.findByStopsAndTimeWithRealtime).mockResolvedValue([]);

      service = new TripFinderService(mockQuery);

      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 12, 9, 0, 0); // Sunday

      await service.findTrips(originStopId, destinationStopId, currentDateTime);

      expect(mockQuery.findByStopsAndTimeWithRealtime).toHaveBeenCalledWith(
        originStopId,
        destinationStopId,
        6, // Sunday
        GTFSTime.fromString('09:00:00'),
        []
      );
    });

    it('should handle late-night times (25:30:00 for 01:30 next day)', async () => {
      vi.mocked(mockRealtimeRepo.getAllTripUpdates).mockResolvedValue([]);
      vi.mocked(mockQuery.findByStopsAndTimeWithRealtime).mockResolvedValue([]);

      service = new TripFinderService(mockQuery, mockRealtimeRepo);

      // 1:30 AM on Tuesday (should be treated as Monday 25:30:00 in GTFS)
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 7, 1, 30, 0);

      await service.findTrips(originStopId, destinationStopId, currentDateTime);

      expect(mockQuery.findByStopsAndTimeWithRealtime).toHaveBeenCalledWith(
        originStopId,
        destinationStopId,
        0, // Monday (because it's considered late Monday night)
        GTFSTime.fromString('25:30:00'),
        [] // no matching realtime trips (getAllTripUpdates returned empty)
      );
    });

    it('should return empty array when no trips found', async () => {
      vi.mocked(mockQuery.findByStopsAndTimeWithRealtime).mockResolvedValue([]);

      service = new TripFinderService(mockQuery);

      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const results = await service.findTrips(
        originStopId,
        destinationStopId,
        currentDateTime
      );

      expect(results).toEqual([]);
    });

    it('should handle prefix match for destination stops', async () => {
      const prefixDest = StopId.fromString('dest_');
      const matchingDest1 = StopId.fromString('dest_1');
      const matchingDest2 = StopId.fromString('dest_2');

      const tripWithPrefixDest1 = TripUpdate.create(TripId.fromString('trip1'), [
        StopTimeUpdate.create({ stopId: originStopId }),
        StopTimeUpdate.create({ stopId: matchingDest1 }),
      ]);
      const tripWithPrefixDest2 = TripUpdate.create(TripId.fromString('trip2'), [
        StopTimeUpdate.create({ stopId: originStopId }),
        StopTimeUpdate.create({ stopId: matchingDest2 }),
      ]);

      vi.mocked(mockRealtimeRepo.getAllTripUpdates).mockResolvedValue([
        tripWithPrefixDest1,
        tripWithPrefixDest2,
      ]);
      vi.mocked(mockQuery.findByStopsAndTimeWithRealtime).mockResolvedValue(mockTripResults);

      service = new TripFinderService(mockQuery, mockRealtimeRepo);

      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      await service.findTrips(originStopId, prefixDest, currentDateTime);

      expect(mockQuery.findByStopsAndTimeWithRealtime).toHaveBeenCalledWith(
        originStopId,
        prefixDest,
        0,
        GTFSTime.fromString('10:00:00'),
        ['trip1', 'trip2']
      );
    });
  });
});
