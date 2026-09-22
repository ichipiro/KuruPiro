import { StopId, TripId } from '@/domain/value-objects/identifiers';
import { JSTDateTime } from '@/domain/value-objects/time';
import { GTFSTime } from '@/domain/value-objects/time';
import type { IFindTripsQuery, TripSearchResult } from '@/domain/queries';
import type { IRealtimeRepository } from '@/domain/repositories';
import type { TripUpdate } from '@/domain/entities/TripUpdate';

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

    const timetable = await this.query.findByStopsAndWeekday(
      originStopId,
      destinationStopId,
      weekday
    );

    // リアルタイムフィードに存在する便は予定時刻を過ぎていても運行中の
    // 可能性があるため、時刻による絞り込みから除外する。
    // フィード全件ではなく時刻表に載っている便だけを問い合わせることで、
    // 取得・変換のコストを必要最小限にする（判定結果は全件取得と等価）
    const realtimeUpdates = await this.getRealtimeUpdates(timetable);

    return timetable.filter(
      (trip) =>
        trip.arrivalTime.compareTo(gtfsTime) >= 0 || realtimeUpdates.has(trip.tripId)
    );
  }

  /**
   * 時刻表に含まれる便のリアルタイム更新情報を取得
   */
  private async getRealtimeUpdates(
    timetable: TripSearchResult[]
  ): Promise<Map<string, TripUpdate>> {
    if (!this.realtimeRepo || timetable.length === 0) {
      return new Map();
    }

    try {
      return await this.realtimeRepo.getTripUpdatesForTrips(
        timetable.map((trip) => TripId.fromString(trip.tripId))
      );
    } catch (error) {
      // リアルタイムは補助データ: 取得に失敗しても時刻表ベースの
      // 結果は返せるため、リクエスト全体を失敗させない
      console.warn('Realtime updates unavailable, falling back to timetable only:', error);
      return new Map();
    }
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
