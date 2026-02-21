import { StopId } from '@/domain/value-objects/identifiers';
import { JSTDateTime } from '@/domain/value-objects/time';
import { GTFSTime } from '@/domain/value-objects/time';
import type {
  FindTripsQuery,
  TripSearchResult,
} from '@/infrastructure/persistence/queries/FindTripsQuery';
import type { IRealtimeRepository } from '@/domain/repositories';

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
   * 1. realtimeRepo が存在する場合、getAllTripUpdates()（キャッシュ済み）から
   *    origin + destination を持つ tripId を JS でフィルタ
   * 2. findByStopsAndTimeWithRealtime() を1回呼ぶ
   *    - 時刻表の便（currentTime以降）と遅延中の便（realtimeTripIds）を統合
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

    let realtimeTripIds: string[] = [];

    if (this.realtimeRepo) {
      const tripUpdates = await this.realtimeRepo.getAllTripUpdates();
      const destValue = destinationStopId.value;
      const isPrefix = destValue.endsWith('_');
      const destPrefix = isPrefix ? destValue.slice(0, -1) : destValue;

      realtimeTripIds = tripUpdates
        .filter((update) => {
          const stus = update.stopTimeUpdates;
          const hasOrigin = stus.some(
            (stu) => stu.stopId !== undefined && stu.stopId.equals(originStopId)
          );
          const hasDest = stus.some((stu) => {
            if (!stu.stopId) return false;
            return isPrefix
              ? stu.stopId.value.startsWith(destPrefix)
              : stu.stopId.equals(destinationStopId);
          });
          return hasOrigin && hasDest;
        })
        .map((update) => update.tripId.value);
    }

    return this.query.findByStopsAndTimeWithRealtime(
      originStopId,
      destinationStopId,
      weekday,
      gtfsTime,
      realtimeTripIds
    );
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
