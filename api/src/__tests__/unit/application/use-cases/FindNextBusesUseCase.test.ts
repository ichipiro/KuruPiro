import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FindNextBusesUseCase } from '@/application/use-cases/FindNextBusesUseCase';
import { TripFinderService } from '@/domain/services/TripFinderService';
import { TimeCalculationService } from '@/domain/services/TimeCalculationService';
import { StopId } from '@/domain/value-objects/identifiers';
import { JSTDateTime } from '@/domain/value-objects/time';
import { GTFSTime } from '@/domain/value-objects/time';
import type { IRealtimeRepository, IStopRepository, IStopTimeRepository } from '@/domain/repositories';
import type { TripSearchResult } from '@/domain/queries';

describe('FindNextBusesUseCase', () => {
  let useCase: FindNextBusesUseCase;
  let mockTripFinder: TripFinderService;
  let mockTimeCalculation: TimeCalculationService;
  let mockStopRepo: IStopRepository;
  let mockStopTimeRepo: IStopTimeRepository;
  let mockRealtimeRepo: IRealtimeRepository;

  beforeEach(() => {
    mockTripFinder = {
      findTrips: vi.fn(),
    } as unknown as TripFinderService;

    mockTimeCalculation = new TimeCalculationService();

    mockStopRepo = {
      findById: vi.fn(),
      findNameById: vi.fn().mockResolvedValue('テスト停留所'),
      findNamesByIds: vi.fn().mockResolvedValue(new Map()),
      findAll: vi.fn(),
    } as unknown as IStopRepository;

    mockStopTimeRepo = {
      findByTripId: vi.fn().mockResolvedValue([]),
      findByTripIds: vi.fn().mockResolvedValue(new Map()),
      findByStopId: vi.fn(),
      findByTripAndStop: vi.fn(),
    } as unknown as IStopTimeRepository;

    mockRealtimeRepo = {
      getAllTripUpdates: vi.fn().mockResolvedValue([]),
      getTripUpdatesForTrips: vi.fn().mockResolvedValue(new Map()),
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
        mockStopRepo,
        mockStopTimeRepo,
        mockRealtimeRepo
      );

      const originStopId = StopId.fromString('origin_stop');
      const destinationStopId = StopId.fromString('dest_stop');
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const result = await useCase.execute(originStopId, [destinationStopId], currentDateTime);

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
              toDisplayString: () => '5分遅れ',
              hasDelay: () => true,
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
                toDisplayString: () => '5分遅れ',
                hasDelay: () => true,
              },
              departureDelay: undefined,
              getRepresentativeDelay: () => ({
                toSeconds: () => 300,
                toDisplayString: () => '5分遅れ',
                hasDelay: () => true,
              }),
              departureTime: undefined,
              arrivalTime: undefined,
            };
          }
          return undefined;
        },
        getCurrentStopId: () => undefined,
        getCurrentStopSequence: () => undefined,
      };

      vi.mocked(mockTripFinder.findTrips).mockResolvedValue(mockResults);
      vi.mocked(mockRealtimeRepo.getTripUpdatesForTrips).mockResolvedValue(
        new Map([['trip1', mockTripUpdate as any]])
      );
      vi.mocked(mockRealtimeRepo.getTripUpdate).mockResolvedValue(mockTripUpdate as any);

      useCase = new FindNextBusesUseCase(
        mockTripFinder,
        mockTimeCalculation,
        mockStopRepo,
        mockStopTimeRepo,
        mockRealtimeRepo
      );

      const originStopId = StopId.fromString('origin_stop');
      const destinationStopId = StopId.fromString('dest_stop');
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const result = await useCase.execute(originStopId, [destinationStopId], currentDateTime);

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
      vi.mocked(mockRealtimeRepo.getTripUpdatesForTrips).mockResolvedValue(new Map());
      vi.mocked(mockRealtimeRepo.getTripUpdate).mockResolvedValue(undefined);

      useCase = new FindNextBusesUseCase(
        mockTripFinder,
        mockTimeCalculation,
        mockStopRepo,
        mockStopTimeRepo,
        mockRealtimeRepo
      );

      const originStopId = StopId.fromString('origin_stop');
      const destinationStopId = StopId.fromString('dest_stop');
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const result = await useCase.execute(originStopId, [destinationStopId], currentDateTime);

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
        mockStopRepo,
        mockStopTimeRepo,
        mockRealtimeRepo
      );

      const originStopId = StopId.fromString('origin_stop');
      const destinationStopId = StopId.fromString('dest_stop');
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const result = await useCase.execute(originStopId, [destinationStopId], currentDateTime);

      expect(result).toEqual([]);
    });

    it('should resolve current locations for all trips in a single query', async () => {
      // 便ごとにD1へ問い合わせず、停留所名は1クエリでまとめて引く
      const buildTripUpdate = (tripId: string, currentStopId: string) => ({
        tripId: { value: tripId },
        stopTimeUpdates: [],
        findStopTimeUpdate: () => ({
          stopSequence: 5,
          getRepresentativeDelay: () => ({
            toSeconds: () => 0,
            toDisplayString: () => '',
            hasDelay: () => false,
          }),
          arrivalTime: undefined,
          departureTime: undefined,
        }),
        getCurrentStopId: () => StopId.fromString(currentStopId),
        getCurrentStopSequence: () => 4,
      });

      const mockResults: TripSearchResult[] = ['trip1', 'trip2'].map((tripId, i) => ({
        tripId,
        arrivalTime: GTFSTime.fromString(`10:3${i}:00`),
        stopSequence: 5,
        routeShortName: '1',
        destinationStopId: 'dest_stop',
        destinationLabel: '終点',
        serviceId: 'weekday',
      }));

      vi.mocked(mockTripFinder.findTrips).mockResolvedValue(mockResults);
      vi.mocked(mockRealtimeRepo.getTripUpdatesForTrips).mockResolvedValue(
        new Map([
          ['trip1', buildTripUpdate('trip1', 'stop_a') as any],
          ['trip2', buildTripUpdate('trip2', 'stop_b') as any],
        ])
      );
      vi.mocked(mockStopRepo.findNamesByIds).mockResolvedValue(
        new Map([
          ['stop_a', '停留所A'],
          ['stop_b', '停留所B'],
        ])
      );

      useCase = new FindNextBusesUseCase(
        mockTripFinder,
        mockTimeCalculation,
        mockStopRepo,
        mockStopTimeRepo,
        mockRealtimeRepo
      );

      const result = await useCase.execute(
        StopId.fromString('origin_stop'),
        [StopId.fromString('dest_stop')],
        JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0)
      );

      expect(mockStopRepo.findNamesByIds).toHaveBeenCalledOnce();
      expect(mockStopRepo.findNameById).not.toHaveBeenCalled();
      expect(result.map((bus) => bus.currentLocation)).toEqual(['停留所A', '停留所B']);
    });

    it('should fetch stop times for all trips in a single query when filtering by via stops', async () => {
      const buildStopTimes = (tripId: string) =>
        ['origin_stop', 'via_stop', 'dest_stop'].map((stopId, index) => ({
          tripId: { value: tripId },
          stopId: { value: stopId },
          sequence: index + 1,
        }));

      const mockResults: TripSearchResult[] = ['trip1', 'trip2'].map((tripId, i) => ({
        tripId,
        arrivalTime: GTFSTime.fromString(`10:3${i}:00`),
        stopSequence: 1,
        routeShortName: '1',
        destinationStopId: 'dest_stop',
        destinationLabel: '終点',
        serviceId: 'weekday',
      }));

      vi.mocked(mockTripFinder.findTrips).mockResolvedValue(mockResults);
      vi.mocked(mockRealtimeRepo.getTripUpdatesForTrips).mockResolvedValue(new Map());
      vi.mocked(mockStopTimeRepo.findByTripIds).mockResolvedValue(
        new Map([
          ['trip1', buildStopTimes('trip1') as any],
          ['trip2', buildStopTimes('trip2') as any],
        ])
      );

      useCase = new FindNextBusesUseCase(
        mockTripFinder,
        mockTimeCalculation,
        mockStopRepo,
        mockStopTimeRepo,
        mockRealtimeRepo
      );

      const result = await useCase.execute(
        StopId.fromString('origin_stop'),
        [StopId.fromString('dest_stop')],
        JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0),
        [StopId.fromString('via_stop')]
      );

      expect(mockStopTimeRepo.findByTripIds).toHaveBeenCalledOnce();
      expect(mockStopTimeRepo.findByTripId).not.toHaveBeenCalled();
      expect(result.map((bus) => bus.tripId)).toEqual(['trip1', 'trip2']);
    });

    it('should exclude trips that do not pass the via stop', async () => {
      const mockResults: TripSearchResult[] = ['trip1', 'trip2'].map((tripId, i) => ({
        tripId,
        arrivalTime: GTFSTime.fromString(`10:3${i}:00`),
        stopSequence: 1,
        routeShortName: '1',
        destinationStopId: 'dest_stop',
        destinationLabel: '終点',
        serviceId: 'weekday',
      }));

      vi.mocked(mockTripFinder.findTrips).mockResolvedValue(mockResults);
      vi.mocked(mockRealtimeRepo.getTripUpdatesForTrips).mockResolvedValue(new Map());
      vi.mocked(mockStopTimeRepo.findByTripIds).mockResolvedValue(
        new Map([
          [
            'trip1',
            ['origin_stop', 'via_stop', 'dest_stop'].map((stopId, index) => ({
              tripId: { value: 'trip1' },
              stopId: { value: stopId },
              sequence: index + 1,
            })) as any,
          ],
          // trip2 は経由地を通らない
          [
            'trip2',
            ['origin_stop', 'dest_stop'].map((stopId, index) => ({
              tripId: { value: 'trip2' },
              stopId: { value: stopId },
              sequence: index + 1,
            })) as any,
          ],
        ])
      );

      useCase = new FindNextBusesUseCase(
        mockTripFinder,
        mockTimeCalculation,
        mockStopRepo,
        mockStopTimeRepo,
        mockRealtimeRepo
      );

      const result = await useCase.execute(
        StopId.fromString('origin_stop'),
        [StopId.fromString('dest_stop')],
        JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0),
        [StopId.fromString('via_stop')]
      );

      expect(result.map((bus) => bus.tripId)).toEqual(['trip1']);
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
        mockTimeCalculation,
        mockStopRepo,
        mockStopTimeRepo
        // No realtime repo
      );

      const originStopId = StopId.fromString('origin_stop');
      const destinationStopId = StopId.fromString('dest_stop');
      const currentDateTime = JSTDateTime.fromComponents(2025, 1, 6, 10, 0, 0);

      const result = await useCase.execute(originStopId, [destinationStopId], currentDateTime);

      expect(result).toHaveLength(1);
      expect(result[0].delaySeconds).toBe(0);
    });
  });
});
