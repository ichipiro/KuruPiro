import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TripFinderService } from '@/domain/services/TripFinderService';
import { StopId } from '@/domain/value-objects/identifiers';
import { JSTDateTime } from '@/domain/value-objects/time';
import { GTFSTime } from '@/domain/value-objects/time';
import type { FindTripsQuery, TripSearchResult } from '@/infrastructure/persistence/queries/FindTripsQuery';
import type { IRealtimeRepository } from '@/domain/repositories';

describe('TripFinderService', () => {
  let service: TripFinderService;
  let mockQuery: FindTripsQuery;
  let mockRealtimeRepo: IRealtimeRepository;

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
      findByStopsAndTime: vi.fn(),
      findByRealtimeTrips: vi.fn(),
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
    it('should call findByRealtimeTrips when realtimeRepo is provided', async () => {
      vi.mocked(mockQuery.findByStopsAndTime).mockResolvedValue([]);
      vi.mocked(mockQuery.findByRealtimeTrips).mockResolvedValue(mockTripResults);

      service = new TripFinderService(mockQuery, mockRealtimeRepo);

      const originStopId = StopId.fromString('origin_stop');
      const destinationStopId = StopId.fromString('dest_stop');
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0); // Monday

      const results = await service.findTrips(
        originStopId,
        destinationStopId,
        currentDateTime
      );

      expect(mockQuery.findByRealtimeTrips).toHaveBeenCalledWith(
        originStopId,
        destinationStopId,
        0, // Monday
        GTFSTime.fromString('10:00:00')
      );
      expect(mockQuery.findByStopsAndTime).toHaveBeenCalledWith(
        originStopId,
        destinationStopId,
        0, // Monday
        GTFSTime.fromString('10:00:00')
      );
      expect(results).toEqual(mockTripResults);
    });

    it('should call findByStopsAndTime when realtimeRepo is not provided', async () => {
      vi.mocked(mockQuery.findByStopsAndTime).mockResolvedValue(mockTripResults);

      service = new TripFinderService(mockQuery); // No realtime repo

      const originStopId = StopId.fromString('origin_stop');
      const destinationStopId = StopId.fromString('dest_stop');
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 7, 14, 30, 0); // Tuesday

      const results = await service.findTrips(
        originStopId,
        destinationStopId,
        currentDateTime
      );

      expect(mockQuery.findByStopsAndTime).toHaveBeenCalledWith(
        originStopId,
        destinationStopId,
        1, // Tuesday
        GTFSTime.fromString('14:30:00')
      );
      expect(mockQuery.findByRealtimeTrips).not.toHaveBeenCalled();
      expect(results).toEqual(mockTripResults);
    });

    it('should correctly calculate weekday (Sunday = 6)', async () => {
      vi.mocked(mockQuery.findByStopsAndTime).mockResolvedValue([]);

      service = new TripFinderService(mockQuery);

      const originStopId = StopId.fromString('origin_stop');
      const destinationStopId = StopId.fromString('dest_stop');
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 12, 9, 0, 0); // Sunday

      await service.findTrips(originStopId, destinationStopId, currentDateTime);

      expect(mockQuery.findByStopsAndTime).toHaveBeenCalledWith(
        originStopId,
        destinationStopId,
        6, // Sunday
        GTFSTime.fromString('09:00:00')
      );
    });

    it('should handle late-night times (25:30:00 for 01:30 next day)', async () => {
      vi.mocked(mockQuery.findByStopsAndTime).mockResolvedValue([]);
      vi.mocked(mockQuery.findByRealtimeTrips).mockResolvedValue([]);

      service = new TripFinderService(mockQuery, mockRealtimeRepo);

      const originStopId = StopId.fromString('origin_stop');
      const destinationStopId = StopId.fromString('dest_stop');
      // 1:30 AM on Tuesday (should be treated as Monday 25:30:00 in GTFS)
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 7, 1, 30, 0);

      await service.findTrips(originStopId, destinationStopId, currentDateTime);

      // Weekday should be Monday (1), not Tuesday (2)
      // Time should be 25:30:00
      expect(mockQuery.findByRealtimeTrips).toHaveBeenCalledWith(
        originStopId,
        destinationStopId,
        0, // Monday (because it's considered late Monday night)
        GTFSTime.fromString('25:30:00')
      );
      expect(mockQuery.findByStopsAndTime).toHaveBeenCalledWith(
        originStopId,
        destinationStopId,
        0, // Monday (because it's considered late Monday night)
        GTFSTime.fromString('25:30:00')
      );
    });

    it('should return empty array when no trips found', async () => {
      vi.mocked(mockQuery.findByStopsAndTime).mockResolvedValue([]);

      service = new TripFinderService(mockQuery);

      const originStopId = StopId.fromString('origin_stop');
      const destinationStopId = StopId.fromString('dest_stop');
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const results = await service.findTrips(
        originStopId,
        destinationStopId,
        currentDateTime
      );

      expect(results).toEqual([]);
    });
  });
});
