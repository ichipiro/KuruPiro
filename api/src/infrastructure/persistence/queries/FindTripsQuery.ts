import { eq, and, gte, lt, sql, inArray } from 'drizzle-orm';
import { getDBClient } from '@/db/client';
import { stopTimes, trips, calendar, routes } from '@/db/schema';
import { StopId, TripId } from '@/domain/value-objects/identifiers';
import { GTFSTime } from '@/domain/value-objects/time';
import { IRealtimeRepository } from '@/domain/repositories';

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
  constructor(
    private readonly d1: D1Database,
    private readonly realtimeRepo?: IRealtimeRepository
  ) {}

  /**
   * 出発地と目的地を通過するトリップを検索（静的データベース）
   *
   * @param originStopId 出発地停留所ID
   * @param destinationStopId 目的地停留所ID（末尾に_があるとプレフィックスマッチ）
   * @param weekday 曜日（0=Monday, 6=Sunday）
   * @param currentTime 現在時刻（この時刻以降の便のみ）
   */
  async findByStopsAndTime(
    originStopId: StopId,
    destinationStopId: StopId,
    weekday: number,
    currentTime?: GTFSTime
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

    // メインクエリ：origin→destの順で停車するトリップを検索
    // WHERE条件を構築
    const whereConditions = [eq(weekdayColumn, 1)];
    if (currentTime) {
      whereConditions.push(gte(originStops.arrivalTime, currentTime.toString()));
    }

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

  /**
   * リアルタイムデータから運行中の便を取得し、静的データを補完（新アプローチ）
   *
   * @param originStopId 出発地停留所ID
   * @param destinationStopId 目的地停留所ID
   * @param weekday 曜日（0=Monday, 6=Sunday）
   * @param currentTime 現在時刻（この時刻以降の便のみ）
   */
  async findByRealtimeTrips(
    originStopId: StopId,
    destinationStopId: StopId,
    weekday: number,
    currentTime?: GTFSTime
  ): Promise<TripSearchResult[]> {
    // リアルタイムリポジトリがない場合は空配列を返す（フォールバックは呼び出し側で制御）
    if (!this.realtimeRepo) {
      return [];
    }

    // 1. リアルタイムから全TripUpdateを取得
    const tripUpdates = await this.realtimeRepo.getAllTripUpdates();

    if (tripUpdates.length === 0) {
      // リアルタイムデータがない場合は空配列を返す（フォールバックは呼び出し側で制御）
      return [];
    }

    // 2. 各TripUpdateが出発地・目的地の両方を通過するかチェック
    const candidateTripIds: TripId[] = [];

    for (const tripUpdate of tripUpdates) {
      const hasOrigin = tripUpdate.stopTimeUpdates.some(
        (update) =>
          update.stopId !== undefined && update.stopId.equals(originStopId)
      );
      const hasDestination = tripUpdate.stopTimeUpdates.some((update) => {
        if (update.stopId === undefined) return false;
        // プレフィックスマッチ対応
        if (destinationStopId.value.endsWith('_')) {
          const prefix = destinationStopId.value.slice(0, -1);
          return update.stopId.value.startsWith(prefix);
        }
        return update.stopId.equals(destinationStopId);
      });

      if (hasOrigin && hasDestination) {
        candidateTripIds.push(tripUpdate.tripId);
      }
    }

    if (candidateTripIds.length === 0) {
      // リアルタイムデータから候補が見つからない場合は空配列を返す（フォールバックは呼び出し側で制御）
      return [];
    }

    // 3. 該当するトリップの静的情報を取得
    const db = getDBClient(this.d1);
    const tripIdValues = candidateTripIds.map((id) => id.value);

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

    // CTEで出発地と目的地の停車時刻を取得（リアルタイムで該当したトリップのみ）
    const originStops = db.$with('origin_stops').as(
      db
        .select({
          tripId: stopTimes.tripId,
          stopSequence: stopTimes.stopSequence,
          arrivalTime: stopTimes.arrivalTime,
        })
        .from(stopTimes)
        .where(
          and(
            eq(stopTimes.stopId, originStopId.value),
            inArray(stopTimes.tripId, tripIdValues)
          )
        )
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
          and(
            isPrefix
              ? sql`${stopTimes.stopId} LIKE ${destPattern + '%'}`
              : eq(stopTimes.stopId, destPattern),
            inArray(stopTimes.tripId, tripIdValues)
          )
        )
    );

    // WHERE条件を構築（リアルタイム検索では時刻フィルタなし、遅延便も取得するため）
    const whereConditions = [eq(weekdayColumn, 1)];

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

    // 結果をドメイン型に変換（空配列の場合もそのまま返す、フォールバックは呼び出し側で制御）
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
