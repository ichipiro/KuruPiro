import { eq, and, or, gt, gte, lt, lte, sql, exists, notExists, isNotNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { getDBClient } from '@/db/client';
import { stopTimes, trips, calendar, calendarDates, routes } from '@/db/schema';
import { StopId } from '@/domain/value-objects/identifiers';
import { GTFSTime } from '@/domain/value-objects/time';
import type { IFindTripsQuery, TripSearchResult } from '@/domain/queries';

export type { TripSearchResult };

/**
 * プレフィックスマッチを範囲条件に変換したときの上限値を作る
 *
 * `LIKE 'xxx%'` は BINARY 照合のインデックスを使えず全表走査になるため、
 * `stop_id >= prefix AND stop_id < prefix + PREFIX_UPPER_BOUND` の範囲シークに置き換える。
 * 停留所IDは数字とアンダースコアのみなので、U+FFFF を番兵に使えば必ず全候補を含む。
 */
const PREFIX_UPPER_BOUND = '￿';

/**
 * 複雑なトリップ検索クエリを実行するクラス
 *
 * 出発地と目的地の両方を通過するトリップを検索します。
 */
export class FindTripsQuery implements IFindTripsQuery {
  constructor(private readonly d1: D1Database) {}

  /**
   * 出発地と目的地を通過するトリップを、そのサービス日の1日分まとめて取得
   *
   * 運行判定は次のGTFS仕様に従う:
   * - calendar: 曜日フラグ + 適用期間(start_date <= 日付 <= end_date)
   * - calendar_dates: type=2ならその日の運行を除外、type=1なら追加
   *   （祝日は「平日サービス除外＋日祝サービス追加」で表現される）
   * - calendarに載らずcalendar_datesの追加のみで運行するサービスにも
   *   対応するため、calendarはLEFT JOINにする
   *
   * インデックス `idx_stop_times_stop_arrival` / `idx_stop_times_trip_stop` を
   * 前提に、CTEを使わず直接JOINすることで両側ともカバリングインデックスで解決させ、
   * ORDER BY のための一時B-treeも不要にしています。
   *
   * @param originStopId 出発地停留所ID
   * @param destinationStopId 目的地停留所ID（末尾に_があるとプレフィックスマッチ）
   * @param serviceDate サービス日（YYYYMMDD）
   * @param weekday serviceDateの曜日（0=Monday, 6=Sunday）
   */
  async findByStopsAndDate(
    originStopId: StopId,
    destinationStopId: StopId,
    serviceDate: string,
    weekday: number
  ): Promise<TripSearchResult[]> {
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

    const db = getDBClient(this.d1);

    // 出発地側と目的地側で同じテーブルを2度参照するためエイリアスを張る
    const originStops = alias(stopTimes, 'origin_stops');
    const destStops = alias(stopTimes, 'dest_stops');

    // 目的地がプレフィックスマッチかどうか
    // プレフィックスは末尾の `_` を含めて照合する。停留所IDは
    // 「グループ番号_乗り場番号」形式のため、`_` を削って '10' で前方一致
    // させると別グループ（1000_1 玖波分れ 等）まで誤マッチしてしまう
    const destValue = destinationStopId.value;
    const isPrefix = destValue.endsWith('_');
    const destPattern = destValue;

    // プレフィックスマッチも範囲条件にしてインデックスシークに乗せる
    const destCondition = isPrefix
      ? and(
          gte(destStops.stopId, destPattern),
          lt(destStops.stopId, destPattern + PREFIX_UPPER_BOUND)
        )
      : eq(destStops.stopId, destPattern);

    // calendar_dates による当日例外（除外・追加）
    const removedOnDate = db
      .select({ one: sql`1` })
      .from(calendarDates)
      .where(
        and(
          eq(calendarDates.serviceId, trips.serviceId),
          eq(calendarDates.date, serviceDate),
          eq(calendarDates.exceptionType, 2)
        )
      );
    const addedOnDate = db
      .select({ one: sql`1` })
      .from(calendarDates)
      .where(
        and(
          eq(calendarDates.serviceId, trips.serviceId),
          eq(calendarDates.date, serviceDate),
          eq(calendarDates.exceptionType, 1)
        )
      );

    // 「calendarの定常運行（曜日+適用期間、当日除外なし）」または「当日の追加運行」
    const serviceActiveOnDate = or(
      and(
        isNotNull(calendar.serviceId),
        eq(weekdayColumn, 1),
        lte(calendar.startDate, serviceDate),
        gte(calendar.endDate, serviceDate),
        notExists(removedOnDate)
      ),
      exists(addedOnDate)
    );

    const results = await db
      .select({
        tripId: originStops.tripId,
        arrivalTime: originStops.arrivalTime,
        stopSequence: originStops.stopSequence,
        routeShortName: routes.routeShortName,
        destinationStopId: destStops.stopId,
        destinationLabel: routes.destinationStop,
        serviceId: trips.serviceId,
      })
      .from(originStops)
      .innerJoin(
        destStops,
        and(
          eq(destStops.tripId, originStops.tripId),
          gt(destStops.stopSequence, originStops.stopSequence),
          destCondition
        )
      )
      .innerJoin(trips, eq(trips.tripId, originStops.tripId))
      .leftJoin(calendar, eq(calendar.serviceId, trips.serviceId))
      .innerJoin(routes, eq(routes.routeId, trips.routeId))
      .where(and(eq(originStops.stopId, originStopId.value), serviceActiveOnDate))
      .orderBy(originStops.arrivalTime);

    // 結果をドメイン型に変換
    return results.map((row) => ({
      tripId: row.tripId,
      arrivalTime: GTFSTime.fromString(row.arrivalTime),
      stopSequence: row.stopSequence,
      routeShortName: row.routeShortName,
      destinationStopId: row.destinationStopId,
      destinationLabel: row.destinationLabel ?? row.destinationStopId,
      serviceId: row.serviceId,
    }));
  }
}
