import { eq, and, gte, lt, sql } from 'drizzle-orm';
import { getDBClient } from '@/db/client';
import { stopTimes, trips, calendar, routes } from '@/db/schema';
import { StopId } from '@/domain/value-objects/identifiers';
import { GTFSTime } from '@/domain/value-objects/time';
import type { IFindTripsQuery, TripSearchResult } from '@/domain/queries';

export type { TripSearchResult };

/** GTFS Static は1日1回更新なので、曜日単位の時刻表を数時間キャッシュする */
const TIMETABLE_CACHE_TTL_SECONDS = 6 * 60 * 60;
const TIMETABLE_CACHE_PREFIX = 'gtfs:trips:v1';

type CachedTripRow = {
  tripId: string;
  arrivalTime: string;
  stopSequence: number;
  routeShortName: string;
  destinationStopId: string;
  destinationLabel: string;
  serviceId: string;
};

/**
 * 複雑なトリップ検索クエリを実行するクラス
 *
 * 出発地と目的地の両方を通過するトリップを検索します。
 * 曜日ごとの時刻表は KV にキャッシュし、現在時刻・遅延便のフィルタはメモリ上で行います。
 */
export class FindTripsQuery implements IFindTripsQuery {
  private readonly memoryCache = new Map<string, TripSearchResult[]>();

  constructor(
    private readonly d1: D1Database,
    private readonly kv?: KVNamespace
  ) {}

  /**
   * 出発地と目的地を通過するトリップを検索
   *
   * 時刻表ベースの便（currentTime以降）とリアルタイムで遅延中の便（realtimeTripIds）を
   * 統合して取得します。
   *
   * @param originStopId 出発地停留所ID
   * @param destinationStopId 目的地停留所ID（末尾に_があるとプレフィックスマッチ）
   * @param weekday 曜日（0=Monday, 6=Sunday）
   * @param currentTime 現在時刻（この時刻以降の便のみ）
   * @param realtimeTripIds リアルタイムで運行中のtripId一覧（時刻フィルタを免除）
   */
  async findByStopsAndTimeWithRealtime(
    originStopId: StopId,
    destinationStopId: StopId,
    weekday: number,
    currentTime: GTFSTime,
    realtimeTripIds: string[]
  ): Promise<TripSearchResult[]> {
    const timetable = await this.loadTimetable(
      originStopId,
      destinationStopId,
      weekday
    );
    const realtimeSet = new Set(realtimeTripIds);

    return timetable.filter(
      (trip) =>
        trip.arrivalTime.compareTo(currentTime) >= 0 ||
        realtimeSet.has(trip.tripId)
    );
  }

  private cacheKey(
    originStopId: StopId,
    destinationStopId: StopId,
    weekday: number
  ): string {
    return `${TIMETABLE_CACHE_PREFIX}:${originStopId.value}:${destinationStopId.value}:${weekday}`;
  }

  private async loadTimetable(
    originStopId: StopId,
    destinationStopId: StopId,
    weekday: number
  ): Promise<TripSearchResult[]> {
    if (weekday < 0 || weekday > 6) {
      return [];
    }

    const key = this.cacheKey(originStopId, destinationStopId, weekday);
    const fromMemory = this.memoryCache.get(key);
    if (fromMemory) {
      return fromMemory;
    }

    const fromKv = await this.readCache(key);
    if (fromKv) {
      this.memoryCache.set(key, fromKv);
      return fromKv;
    }

    const results = await this.queryTimetable(
      originStopId,
      destinationStopId,
      weekday
    );
    this.memoryCache.set(key, results);
    await this.writeCache(key, results);
    return results;
  }

  private async readCache(key: string): Promise<TripSearchResult[] | null> {
    if (!this.kv) {
      return null;
    }

    try {
      const cached = await this.kv.get<CachedTripRow[]>(key, 'json');
      if (!cached) {
        return null;
      }
      return cached.map((row) => this.toDomain(row));
    } catch (error) {
      console.warn('Failed to read timetable cache', error);
      return null;
    }
  }

  private async writeCache(
    key: string,
    results: TripSearchResult[]
  ): Promise<void> {
    if (!this.kv) {
      return;
    }

    const payload: CachedTripRow[] = results.map((trip) => ({
      tripId: trip.tripId,
      arrivalTime: trip.arrivalTime.toString(),
      stopSequence: trip.stopSequence,
      routeShortName: trip.routeShortName,
      destinationStopId: trip.destinationStopId,
      destinationLabel: trip.destinationLabel,
      serviceId: trip.serviceId,
    }));

    try {
      await this.kv.put(key, JSON.stringify(payload), {
        expirationTtl: TIMETABLE_CACHE_TTL_SECONDS,
      });
    } catch (error) {
      console.warn('Failed to write timetable cache', error);
    }
  }

  private toDomain(row: CachedTripRow): TripSearchResult {
    return {
      tripId: row.tripId,
      arrivalTime: GTFSTime.fromString(row.arrivalTime),
      stopSequence: row.stopSequence,
      routeShortName: row.routeShortName,
      destinationStopId: row.destinationStopId,
      destinationLabel: row.destinationLabel,
      serviceId: row.serviceId,
    };
  }

  /**
   * 曜日の時刻表を D1 から全件取得する（現在時刻では絞らない）
   */
  private async queryTimetable(
    originStopId: StopId,
    destinationStopId: StopId,
    weekday: number
  ): Promise<TripSearchResult[]> {
    const db = getDBClient(this.d1);

    const weekdayColumns = [
      calendar.monday,
      calendar.tuesday,
      calendar.wednesday,
      calendar.thursday,
      calendar.friday,
      calendar.saturday,
      calendar.sunday,
    ];
    const weekdayColumn = weekdayColumns[weekday];

    const destValue = destinationStopId.value;
    const isPrefix = destValue.endsWith('_');
    const destPattern = isPrefix ? destValue.slice(0, -1) : destValue;

    const originStops = db.$with('origin_stops').as(
      db
        .select({
          tripId: stopTimes.tripId,
          stopSequence: stopTimes.stopSequence,
          arrivalTime: stopTimes.arrivalTime,
        })
        .from(stopTimes)
        .where(eq(stopTimes.stopId, originStopId.value))
    );

    // LIKE は SQLite デフォルトでインデックスを使えないため、プレフィックスは範囲検索にする
    const destStops = db.$with('dest_stops').as(
      db
        .select({
          tripId: stopTimes.tripId,
          stopSequence: stopTimes.stopSequence,
          stopId: stopTimes.stopId,
        })
        .from(stopTimes)
        .where(
          isPrefix
            ? and(
                gte(stopTimes.stopId, destPattern),
                lt(stopTimes.stopId, destPattern + '\uffff')
              )
            : eq(stopTimes.stopId, destPattern)
        )
    );

    const results = await db
      .with(originStops, destStops)
      .select({
        tripId: originStops.tripId,
        arrivalTime: originStops.arrivalTime,
        stopSequence: originStops.stopSequence,
        routeShortName: routes.routeShortName,
        destinationStopId: destStops.stopId,
        destinationLabel: sql<string>`COALESCE(${routes.destinationStop}, ${destStops.stopId})`,
        serviceId: trips.serviceId,
      })
      .from(originStops)
      .innerJoin(
        destStops,
        and(
          eq(originStops.tripId, destStops.tripId),
          lt(originStops.stopSequence, destStops.stopSequence)
        )
      )
      .innerJoin(trips, eq(originStops.tripId, trips.tripId))
      .innerJoin(calendar, eq(trips.serviceId, calendar.serviceId))
      .innerJoin(routes, eq(trips.routeId, routes.routeId))
      .where(eq(weekdayColumn, 1))
      .orderBy(originStops.arrivalTime);

    return results.map((row) => this.toDomain(row));
  }
}
