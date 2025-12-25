import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FindNextBusesUseCase } from '@/application/use-cases/FindNextBusesUseCase';
import { TripFinderService } from '@/domain/services/TripFinderService';
import { TimeCalculationService } from '@/domain/services/TimeCalculationService';
import { StopId } from '@/domain/value-objects/identifiers';
import { JSTDateTime } from '@/domain/value-objects/time';
import { GTFSTime } from '@/domain/value-objects/time';
import type { IRealtimeRepository } from '@/domain/repositories';
import type { TripSearchResult } from '@/infrastructure/persistence/queries/FindTripsQuery';

describe('FindNextBusesUseCase', () => {
  let useCase: FindNextBusesUseCase;
  let mockTripFinder: TripFinderService;
  let mockTimeCalculation: TimeCalculationService;
  let mockRealtimeRepo: IRealtimeRepository;

  beforeEach(() => {
    mockTripFinder = {
      findTrips: vi.fn(),
    } as unknown as TripFinderService;

    mockTimeCalculation = new TimeCalculationService();

    mockRealtimeRepo = {
      getAllTripUpdates: vi.fn().mockResolvedValue([]),
      getTripUpdate: vi.fn(),
      getLastUpdatedAt: vi.fn(),
      forceUpdate: vi.fn(),
    } as unknown as IRealtimeRepository;
  });

  describe('execute', () => {
    it('should return next buses without realtime delay', async () => {
      const mockResults: TripSearchResult[] = [
        {
          tripId: 'trip1',
          arrivalTime: GTFSTime.fromString('10:30:00'),
          stopSequence: 5,
          routeShortName: '1',
          destinationStopId: 'dest_stop',
          destinationLabel: '終点',
          serviceId: 'weekday',
        },
      ];

      vi.mocked(mockTripFinder.findTrips).mockResolvedValue(mockResults);
      vi.mocked(mockRealtimeRepo.getTripUpdate).mockResolvedValue(undefined); // No realtime data

      useCase = new FindNextBusesUseCase(
        mockTripFinder,
        mockTimeCalculation,
        mockRealtimeRepo
      );

      const originStopId = StopId.fromString('origin_stop');
      const destinationStopId = StopId.fromString('dest_stop');
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const result = await useCase.execute(originStopId, destinationStopId, currentDateTime);

      expect(result).toHaveLength(1);
      expect(result[0].tripId).toBe('trip1');
      expect(result[0].routeShortName).toBe('1');
      expect(result[0].destinationLabel).toBe('終点');
      expect(result[0].scheduledArrival).toBe('10:30');
      expect(result[0].actualArrival).toBe('10:30');
      expect(result[0].remainingMinutes).toBe(30);
      expect(result[0].delaySeconds).toBe(0);
      expect(result[0].delayDisplay).toBe('');
    });

    it('should apply realtime delay when available', async () => {
      const mockResults: TripSearchResult[] = [
        {
          tripId: 'trip1',
          arrivalTime: GTFSTime.fromString('10:30:00'),
          stopSequence: 5,
          routeShortName: '1',
          destinationStopId: 'dest_stop',
          destinationLabel: '終点',
          serviceId: 'weekday',
        },
      ];

      const mockTripUpdate = {
        tripId: { value: 'trip1' },
        stopTimeUpdates: [
          {
            stopSequence: 5,
            arrivalDelay: {
              toSeconds: () => 300,
              toDisplayString: () => '5分遅れ'
            }, // 5 minutes delay
            departureDelay: undefined,
          },
        ],
        findStopTimeUpdate: (seq: number) => {
          if (seq === 5) {
            return {
              stopSequence: 5,
              arrivalDelay: {
                toSeconds: () => 300,
                toDisplayString: () => '5分遅れ'
              },
              departureDelay: undefined,
            };
          }
          return undefined;
        },
      };

      vi.mocked(mockTripFinder.findTrips).mockResolvedValue(mockResults);
      vi.mocked(mockRealtimeRepo.getAllTripUpdates).mockResolvedValue([mockTripUpdate as any]);
      vi.mocked(mockRealtimeRepo.getTripUpdate).mockResolvedValue(mockTripUpdate as any);

      useCase = new FindNextBusesUseCase(
        mockTripFinder,
        mockTimeCalculation,
        mockRealtimeRepo
      );

      const originStopId = StopId.fromString('origin_stop');
      const destinationStopId = StopId.fromString('dest_stop');
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const result = await useCase.execute(originStopId, destinationStopId, currentDateTime);

      expect(result).toHaveLength(1);
      expect(result[0].scheduledArrival).toBe('10:30');
      expect(result[0].actualArrival).toBe('10:35'); // 10:30 + 5 minutes
      expect(result[0].remainingMinutes).toBe(35);
      expect(result[0].delaySeconds).toBe(300);
      expect(result[0].delayDisplay).toBe('5分遅れ');
    });

    it('should sort results by remaining time', async () => {
      const mockResults: TripSearchResult[] = [
        {
          tripId: 'trip1',
          arrivalTime: GTFSTime.fromString('10:40:00'),
          stopSequence: 5,
          routeShortName: '1',
          destinationStopId: 'dest_stop',
          destinationLabel: '終点',
          serviceId: 'weekday',
        },
        {
          tripId: 'trip2',
          arrivalTime: GTFSTime.fromString('10:20:00'),
          stopSequence: 3,
          routeShortName: '2',
          destinationStopId: 'dest_stop',
          destinationLabel: '終点',
          serviceId: 'weekday',
        },
      ];

      vi.mocked(mockTripFinder.findTrips).mockResolvedValue(mockResults);
      vi.mocked(mockRealtimeRepo.getAllTripUpdates).mockResolvedValue([]);
      vi.mocked(mockRealtimeRepo.getTripUpdate).mockResolvedValue(undefined);

      useCase = new FindNextBusesUseCase(
        mockTripFinder,
        mockTimeCalculation,
        mockRealtimeRepo
      );

      const originStopId = StopId.fromString('origin_stop');
      const destinationStopId = StopId.fromString('dest_stop');
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const result = await useCase.execute(originStopId, destinationStopId, currentDateTime);

      expect(result).toHaveLength(2);
      // Should be sorted by remaining time (trip2: 20min, trip1: 40min)
      expect(result[0].tripId).toBe('trip2');
      expect(result[0].remainingMinutes).toBe(20);
      expect(result[1].tripId).toBe('trip1');
      expect(result[1].remainingMinutes).toBe(40);
    });

    it('should return empty array when no trips found', async () => {
      vi.mocked(mockTripFinder.findTrips).mockResolvedValue([]);

      useCase = new FindNextBusesUseCase(
        mockTripFinder,
        mockTimeCalculation,
        mockRealtimeRepo
      );

      const originStopId = StopId.fromString('origin_stop');
      const destinationStopId = StopId.fromString('dest_stop');
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const result = await useCase.execute(originStopId, destinationStopId, currentDateTime);

      expect(result).toEqual([]);
    });

    it('should work without realtime repository', async () => {
      const mockResults: TripSearchResult[] = [
        {
          tripId: 'trip1',
          arrivalTime: GTFSTime.fromString('10:30:00'),
          stopSequence: 5,
          routeShortName: '1',
          destinationStopId: 'dest_stop',
          destinationLabel: '終点',
          serviceId: 'weekday',
        },
      ];

      vi.mocked(mockTripFinder.findTrips).mockResolvedValue(mockResults);

      useCase = new FindNextBusesUseCase(
        mockTripFinder,
        mockTimeCalculation
        // No realtime repo
      );

      const originStopId = StopId.fromString('origin_stop');
      const destinationStopId = StopId.fromString('dest_stop');
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const result = await useCase.execute(originStopId, destinationStopId, currentDateTime);

      expect(result).toHaveLength(1);
      expect(result[0].delaySeconds).toBe(0);
    });
  });
});
