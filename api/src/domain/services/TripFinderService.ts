import { StopId } from '@/domain/value-objects/StopId';
import { JSTDateTime } from '@/domain/value-objects/JSTDateTime';
import { GTFSTime } from '@/domain/value-objects/GTFSTime';
import type {
  FindTripsQuery,
  TripSearchResult,
} from '@/infrastructure/persistence/queries/FindTripsQuery';
import type { IRealtimeRepository } from '@/domain/repositories/IRealtimeRepository';

/**
 * トリップ検索のドメインサービス
 *
 * 停留所間のトリップ検索ロジックを担当します。
 * リアルタイムデータの有無に応じて適切な検索戦略を選択します。
 */
export class TripFinderService {
  constructor(
    private readonly query: FindTripsQuery,
    private readonly realtimeRepo?: IRealtimeRepository
  ) {}

  /**
   * 出発地と目的地の間を走るトリップを検索
   *
   * ハイブリッド戦略：
   * 1. Realtimeから運行中の便を取得（時刻表上は過ぎているが遅延で実際はまだ来ていない便を含む）
   * 2. Staticから時刻表ベースの便を取得（最低5件を保証）
   * 3. 両方をマージしてtripIdで重複除去
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
    // JSTDateTimeからGTFS形式の曜日とGTFS時刻を計算
    const { weekday, gtfsTime } = this.calculateGTFSParams(currentDateTime);

    // Staticデータから時刻表ベースの便を取得（最低5件を保証）
    const staticTrips = await this.query.findByStopsAndTime(
      originStopId,
      destinationStopId,
      weekday,
      gtfsTime
    );

    // Realtimeリポジトリがない場合はstaticのみ返す
    if (!this.realtimeRepo) {
      return staticTrips;
    }

    // Realtimeから運行中の便を取得（遅延で時刻表上は過ぎているが実際はまだ来ていない便を含む）
    const realtimeTrips = await this.query.findByRealtimeTrips(
      originStopId,
      destinationStopId,
      weekday,
      gtfsTime
    );

    // 両方をマージしてtripIdで重複除去
    const tripMap = new Map<string, TripSearchResult>();

    // Staticの結果を先に追加
    for (const trip of staticTrips) {
      tripMap.set(trip.tripId, trip);
    }

    // Realtimeの結果を追加（既存のものは上書きしない）
    for (const trip of realtimeTrips) {
      if (!tripMap.has(trip.tripId)) {
        tripMap.set(trip.tripId, trip);
      }
    }

    // Map から配列に変換して arrivalTime でソート
    const mergedTrips = Array.from(tripMap.values()).sort((a, b) => {
      return a.arrivalTime.compareTo(b.arrivalTime);
    });

    return mergedTrips;
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
