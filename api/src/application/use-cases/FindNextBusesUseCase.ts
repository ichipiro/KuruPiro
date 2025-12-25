import { StopId, Delay, TripId } from '@/domain/value-objects/identifiers';
import { JSTDateTime } from '@/domain/value-objects/time';
import { TripFinderService } from '@/domain/services/TripFinderService';
import { TimeCalculationService } from '@/domain/services/TimeCalculationService';
import type { IRealtimeRepository, IStopRepository } from '@/domain/repositories';
import type { NextBusDTO } from '@/application/dto/NextBusDTO';

/**
 * 次のバスを検索するユースケース
 *
 * 出発地と目的地の間を走る次のバスを検索し、リアルタイムデータがあれば
 * 遅延情報を適用して実際の到着時刻を計算します。
 */
export class FindNextBusesUseCase {
  constructor(
    private readonly tripFinder: TripFinderService,
    private readonly timeCalculation: TimeCalculationService,
    private readonly stopRepo: IStopRepository,
    private readonly realtimeRepo?: IRealtimeRepository
  ) {}

  /**
   * 次のバスを検索
   *
   * @param originStopId 出発地停留所ID
   * @param destinationStopId 目的地停留所ID
   * @param currentDateTime 現在時刻（JST）
   * @returns 次のバス情報のリスト（残り時間順にソート）
   */
  async execute(
    originStopId: StopId,
    destinationStopId: StopId,
    currentDateTime: JSTDateTime
  ): Promise<NextBusDTO[]> {
    // 1. トリップを検索
    const tripResults = await this.tripFinder.findTrips(
      originStopId,
      destinationStopId,
      currentDateTime
    );

    if (tripResults.length === 0) {
      return [];
    }

    // 2. リアルタイムデータを一括取得してMapに変換（パフォーマンス最適化）
    let tripUpdateMap: Map<string, any> | undefined;
    if (this.realtimeRepo) {
      const allTripUpdates = await this.realtimeRepo.getAllTripUpdates();
      tripUpdateMap = new Map(
        allTripUpdates.map((update) => [update.tripId.value, update])
      );
    }

    // 3. 基準日を一度だけ計算（パフォーマンス最適化）
    const baseDate = JSTDateTime.fromComponents(
      currentDateTime.year,
      currentDateTime.month,
      currentDateTime.day,
      0,
      0,
      0
    );

    // 4. 各トリップを NextBusDTO に変換
    const buses = await Promise.all(tripResults.map(async (tripResult) => {
      // リアルタイムデータから遅延情報とUnix timestampを取得
      let delay: Delay | undefined;
      let realtimeArrivalTimestamp: number | undefined;
      let isArrivedInFeed = false; // フィードに存在しない = 到着済み
      let currentLocation = ''; // デフォルトは空文字列

      if (tripUpdateMap) {
        const tripUpdate = tripUpdateMap.get(tripResult.tripId);

        if (tripUpdate) {
          // stopSequenceに対応するStopTimeUpdateを探す
          const stopTimeUpdate = tripUpdate.findStopTimeUpdate(
            tripResult.stopSequence
          );

          if (stopTimeUpdate) {
            // StopTimeUpdateが見つかった = まだ到着していない
            // Get representative delay (departure or arrival, whichever is available)
            const representativeDelay = stopTimeUpdate.getRepresentativeDelay();
            if (representativeDelay.hasDelay()) {
              delay = representativeDelay;
            }

            // Unix timestampがあればそれを使う（より正確）
            realtimeArrivalTimestamp = stopTimeUpdate.departureTime || stopTimeUpdate.arrivalTime;
          } else {
            // StopTimeUpdateが見つからない = フィードから削除されている = 到着済み
            isArrivedInFeed = true;
          }

          // 現在位置を取得
          const currentStopId = tripUpdate.getCurrentStopId();
          if (currentStopId) {
            const stopName = await this.stopRepo.findNameById(currentStopId);
            if (stopName) {
              currentLocation = stopName;
            }
          }
        }
      }

      // 実際の到着時刻を計算
      let actualArrivalTime: JSTDateTime;
      if (realtimeArrivalTimestamp && realtimeArrivalTimestamp > 0) {
        // Unix timestampがあればそれを使う（最も正確）
        actualArrivalTime = JSTDateTime.fromUnixTimestamp(realtimeArrivalTimestamp);
      } else {
        // Unix timestampがなければ従来通りの計算（時刻表 + 遅延）
        actualArrivalTime = this.timeCalculation.calculateActualArrivalTime(
          tripResult.arrivalTime,
          delay,
          baseDate
        );
      }

      // 予定到着時刻も計算（遅延なし）
      const scheduledArrivalTime = this.timeCalculation.calculateActualArrivalTime(
        tripResult.arrivalTime,
        undefined,
        baseDate
      );

      // 残り時間を計算
      const remainingTime = this.timeCalculation.calculateRemainingTime(
        actualArrivalTime,
        currentDateTime
      );

      // DTOに変換
      const dto: NextBusDTO = {
        scheduledArrival: scheduledArrivalTime.toTimeString(),
        actualArrival: actualArrivalTime.toTimeString(),
        remainingTime: remainingTime.toString(),
        remainingMinutes: remainingTime.toMinutes(),
        routeShortName: tripResult.routeShortName,
        destinationLabel: tripResult.destinationLabel,
        tripId: tripResult.tripId,
        delaySeconds: delay ? delay.toSeconds() : 0,
        delayDisplay: delay ? delay.toDisplayString() : '',
        isArrivedInFeed, // フィードに存在しない = 到着済み
        currentLocation, // 現在のバスの位置
      };

      return dto;
    }));

    // 5. 既に到着した便を除外
    const upcomingBuses = buses.filter((bus) => {
      // フィードに存在しない場合は到着済みとして除外
      if (bus.isArrivedInFeed) {
        return false;
      }

      // まだ到着していない
      if (bus.remainingMinutes >= 0) {
        return true;
      }

      // 遅延している便は、計算上過ぎていても3分間は表示し続ける
      // （リアルタイムデータにUnix timestampがない場合の誤差対応）
      if (bus.delaySeconds > 0 && bus.remainingMinutes >= -3) {
        return true;
      }

      return false; // 到着済み
    });

    // 6. 残り時間順にソート（猶予期間中の便は0分として扱う）
    upcomingBuses.sort((a, b) => {
      const aSort = Math.max(0, a.remainingMinutes);
      const bSort = Math.max(0, b.remainingMinutes);
      return aSort - bSort;
    });

    return upcomingBuses;
  }
}
