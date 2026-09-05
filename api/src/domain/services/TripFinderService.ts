import { StopId } from '@/domain/value-objects/identifiers';
import { JSTDateTime } from '@/domain/value-objects/time';
import { GTFSTime } from '@/domain/value-objects/time';
import type { IFindTripsQuery, TripSearchResult } from '@/domain/queries';
import type { IRealtimeRepository } from '@/domain/repositories';

/**
 * トリップ検索のドメインサービス
 *
 * 停留所間のトリップ検索ロジックを担当します。
 * 曜日ごとの時刻表（キャッシュ可能）を取得し、現在時刻とリアルタイムデータで絞り込みます。
 */
export class TripFinderService {
  constructor(
    private readonly query: IFindTripsQuery,
    private readonly realtimeRepo?: IRealtimeRepository
  ) {}

  /**
   * 出発地と目的地の間を走るトリップを検索
   *
   * 1. その曜日の時刻表を1日分取得する（結果はインフラ層でキャッシュされる）
   * 2. currentTime以降の便に絞る。ただしリアルタイムに存在する便は
   *    遅延して予定時刻を過ぎている可能性があるため時刻フィルタを免除する
   *
   * @param originStopId 出発地停留所ID
   * @param destinationStopId 目的地停留所ID
   * @param currentDateTime 現在時刻（JST）
   * @returns トリップ検索結果のリスト
   */
  async findTrips(
    originStopId: StopId,
    destinationStopId: StopId,
    currentDateTime: JSTDateTime
  ): Promise<TripSearchResult[]> {
    const { weekday, gtfsTime } = this.calculateGTFSParams(currentDateTime);

    const [timetable, realtimeTripIds] = await Promise.all([
      this.query.findByStopsAndWeekday(originStopId, destinationStopId, weekday),
      this.getRealtimeTripIds(),
    ]);

    return timetable.filter(
      (trip) =>
        trip.arrivalTime.compareTo(gtfsTime) >= 0 || realtimeTripIds.has(trip.tripId)
    );
  }

  /**
   * リアルタイムフィードに存在するtripIdの集合を取得
   *
   * ここに含まれる便は予定時刻を過ぎていても運行中の可能性があるため、
   * 時刻による絞り込みから除外します。
   */
  private async getRealtimeTripIds(): Promise<Set<string>> {
    if (!this.realtimeRepo) {
      return new Set();
    }

    const tripUpdates = await this.realtimeRepo.getAllTripUpdates();
    return new Set(tripUpdates.map((update) => update.tripId.value));
  }

  /**
   * JSTDateTimeからGTFS形式の曜日とGTFS時刻を計算
   *
   * GTFSでは深夜0～3時台は「前日の24時以降」として扱うため、
   * 0～2時の場合は前日扱いにして時刻に24時間を加算します。
   *
   * 例: 火曜日1:30 → 月曜日(weekday=0) 25:30:00
   *
   * @param dateTime JST日時
   * @returns weekday(0=月曜, 6=日曜) と gtfsTime
   */
  private calculateGTFSParams(dateTime: JSTDateTime): {
    weekday: number;
    gtfsTime: GTFSTime;
  } {
    const hour = dateTime.hour;

    // 深夜0～2時台は前日の24時以降として扱う（GTFSの慣習）
    if (hour >= 0 && hour < 3) {
      // 前日の日付を取得
      const previousDay = JSTDateTime.fromComponents(
        dateTime.year,
        dateTime.month,
        dateTime.day,
        dateTime.hour,
        dateTime.minute,
        dateTime.second
      ).addHours(-24);

      const weekday = previousDay.getWeekday();
      const gtfsHour = hour + 24;
      const gtfsTime = GTFSTime.fromComponents(
        gtfsHour,
        dateTime.minute,
        dateTime.second
      );

      return { weekday, gtfsTime };
    }

    // 通常の時間帯
    const weekday = dateTime.getWeekday();
    const gtfsTime = GTFSTime.fromComponents(
      hour,
      dateTime.minute,
      dateTime.second
    );

    return { weekday, gtfsTime };
  }
}
