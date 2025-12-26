import { FindTripsQuery } from '@/infrastructure/persistence/queries/FindTripsQuery';
import { DrizzleStopRepository } from '@/infrastructure/persistence/repositories/DrizzleStopRepository';
import { DrizzleRouteRepository } from '@/infrastructure/persistence/repositories/DrizzleRouteRepository';
import { DrizzleTripRepository } from '@/infrastructure/persistence/repositories/DrizzleTripRepository';
import { DrizzleStopTimeRepository } from '@/infrastructure/persistence/repositories/DrizzleStopTimeRepository';
import { DrizzleCalendarRepository } from '@/infrastructure/persistence/repositories/DrizzleCalendarRepository';
import { DurableObjectRealtimeRepository } from '@/infrastructure/external/durable-objects/DurableObjectRealtimeRepository';
import { TripFinderService } from '@/domain/services/TripFinderService';
import { TimeCalculationService } from '@/domain/services/TimeCalculationService';
import { FindNextBusesUseCase } from '@/application/use-cases/FindNextBusesUseCase';
import { GetStopNameUseCase } from '@/application/use-cases/GetStopNameUseCase';
import type { IStopRepository } from '@/domain/repositories';
import type { IRouteRepository } from '@/domain/repositories';
import type { ITripRepository } from '@/domain/repositories';
import type { IStopTimeRepository } from '@/domain/repositories';
import type { ICalendarRepository } from '@/domain/repositories';
import type { IRealtimeRepository } from '@/domain/repositories';
import type { Env } from '@/types';

/**
 * サービスファクトリー
 *
 * Cloudflare Workers環境に適したDIコンテナ。
 * 各リクエストごとに新しいインスタンスを生成します。
 */
export class ServiceFactory {
  // リポジトリのキャッシュ（1リクエスト内で再利用）
  private stopRepo?: IStopRepository;
  private routeRepo?: IRouteRepository;
  private tripRepo?: ITripRepository;
  private stopTimeRepo?: IStopTimeRepository;
  private calendarRepo?: ICalendarRepository;
  private realtimeRepo?: IRealtimeRepository;

  // クエリのキャッシュ
  private findTripsQuery?: FindTripsQuery;

  // サービスのキャッシュ
  private tripFinderService?: TripFinderService;
  private timeCalculationService?: TimeCalculationService;

  constructor(private readonly env: Env) {}

  // ========================================
  // リポジトリの取得
  // ========================================

  getStopRepository(): IStopRepository {
    if (!this.stopRepo) {
      this.stopRepo = new DrizzleStopRepository(this.env.DB);
    }
    return this.stopRepo;
  }

  getRouteRepository(): IRouteRepository {
    if (!this.routeRepo) {
      this.routeRepo = new DrizzleRouteRepository(this.env.DB);
    }
    return this.routeRepo;
  }

  getTripRepository(): ITripRepository {
    if (!this.tripRepo) {
      this.tripRepo = new DrizzleTripRepository(this.env.DB);
    }
    return this.tripRepo;
  }

  getStopTimeRepository(): IStopTimeRepository {
    if (!this.stopTimeRepo) {
      this.stopTimeRepo = new DrizzleStopTimeRepository(this.env.DB);
    }
    return this.stopTimeRepo;
  }

  getCalendarRepository(): ICalendarRepository {
    if (!this.calendarRepo) {
      this.calendarRepo = new DrizzleCalendarRepository(this.env.DB);
    }
    return this.calendarRepo;
  }

  getRealtimeRepository(): IRealtimeRepository {
    if (!this.realtimeRepo) {
      this.realtimeRepo = new DurableObjectRealtimeRepository(this.env);
    }
    return this.realtimeRepo;
  }

  // ========================================
  // クエリの取得
  // ========================================

  getFindTripsQuery(): FindTripsQuery {
    if (!this.findTripsQuery) {
      this.findTripsQuery = new FindTripsQuery(
        this.env.DB,
        this.getRealtimeRepository()
      );
    }
    return this.findTripsQuery;
  }

  // ========================================
  // ドメインサービスの取得
  // ========================================

  getTripFinderService(): TripFinderService {
    if (!this.tripFinderService) {
      this.tripFinderService = new TripFinderService(
        this.getFindTripsQuery(),
        this.getRealtimeRepository()
      );
    }
    return this.tripFinderService;
  }

  getTimeCalculationService(): TimeCalculationService {
    if (!this.timeCalculationService) {
      this.timeCalculationService = new TimeCalculationService();
    }
    return this.timeCalculationService;
  }

  // ========================================
  // ユースケースの取得
  // ========================================

  getFindNextBusesUseCase(): FindNextBusesUseCase {
    return new FindNextBusesUseCase(
      this.getTripFinderService(),
      this.getTimeCalculationService(),
      this.getStopRepository(),
      this.getStopTimeRepository(),
      this.getRealtimeRepository()
    );
  }

  getGetStopNameUseCase(): GetStopNameUseCase {
    return new GetStopNameUseCase(this.getStopRepository());
  }
}
