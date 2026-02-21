import { eq, and, gte, lt, or, sql, inArray } from 'drizzle-orm';
import { getDBClient } from '@/db/client';
import { stopTimes, trips, calendar, routes } from '@/db/schema';
import { StopId } from '@/domain/value-objects/identifiers';
import { GTFSTime } from '@/domain/value-objects/time';

/**
 * トリップ検索結果の型
 */
export interface TripSearchResult {
  tripId: string;
  arrivalTime: GTFSTime;
  stopSequence: number;
  routeShortName: string;
  destinationStopId: string;
  destinationLabel: string;
  serviceId: string;
}

/**
 * 複雑なトリップ検索クエリを実行するクラス
 *
 * 出発地と目的地の両方を通過するトリップを検索します。
 */
export class FindTripsQuery {
  constructor(private readonly d1: D1Database) {}

  /**
   * 出発地と目的地を通過するトリップを検索
   *
   * 時刻表ベースの便（currentTime以降）とリアルタイムで遅延中の便（realtimeTripIds）を
   * 1クエリで統合して取得します。
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
    const db = getDBClient(this.d1);

    // 曜日列名を取得
    const weekdayColumns = [
      calendar.monday,
      calendar.tuesday,
      calendar.wednesday,
      calendar.thursday,
      calendar.friday,
      calendar.saturday,
      calendar.sunday,
    ];

    if (weekday < 0 || weekday > 6) {
      return [];
    }

    const weekdayColumn = weekdayColumns[weekday];

    // 目的地がプレフィックスマッチかどうか
    const destValue = destinationStopId.value;
    const isPrefix = destValue.endsWith('_');
    const destPattern = isPrefix ? destValue.slice(0, -1) : destValue;

    // CTEで出発地と目的地の停車時刻を取得
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
            ? sql`${stopTimes.stopId} LIKE ${destPattern + '%'}`
            : eq(stopTimes.stopId, destPattern)
        )
    );

    // 時刻条件：時刻表の便（currentTime以降）またはリアルタイムで遅延中の便
    const timeCondition =
      realtimeTripIds.length > 0
        ? or(
            gte(originStops.arrivalTime, currentTime.toString()),
            inArray(originStops.tripId, realtimeTripIds)
          )
        : gte(originStops.arrivalTime, currentTime.toString());

    const whereConditions = [eq(weekdayColumn, 1), timeCondition];

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
      .where(and(...whereConditions))
      .orderBy(originStops.arrivalTime);

    // 結果をドメイン型に変換
    return results.map((row) => ({
      tripId: row.tripId,
      arrivalTime: GTFSTime.fromString(row.arrivalTime),
      stopSequence: row.stopSequence,
      routeShortName: row.routeShortName,
      destinationStopId: row.destinationStopId,
      destinationLabel: row.destinationLabel,
      serviceId: row.serviceId,
    }));
  }
}
