import { StopId } from '@/domain/value-objects/StopId';
import { JSTDateTime } from '@/domain/value-objects/JSTDateTime';
import { Delay } from '@/domain/value-objects/Delay';
import { TripId } from '@/domain/value-objects/TripId';
import { TripFinderService } from '@/domain/services/TripFinderService';
import { TimeCalculationService } from '@/domain/services/TimeCalculationService';
import type { IRealtimeRepository } from '@/domain/repositories/IRealtimeRepository';
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

    // 2. 各トリップを NextBusDTO に変換
    const buses = await Promise.all(
      tripResults.map(async (tripResult) => {
        // リアルタイムデータから遅延情報を取得
        let delay: Delay | undefined;

        if (this.realtimeRepo) {
          const tripId = TripId.fromString(tripResult.tripId);
          const tripUpdate = await this.realtimeRepo.getTripUpdate(tripId);

          if (tripUpdate) {
            // stopSequenceに対応するStopTimeUpdateを探す
            const stopTimeUpdate = tripUpdate.findStopTimeUpdate(
              tripResult.stopSequence
            );

            if (stopTimeUpdate && stopTimeUpdate.arrivalDelay) {
              delay = stopTimeUpdate.arrivalDelay;
            }
          }
        }

        // 予定時刻の基準日（currentDateTimeの日付部分）
        const baseDate = JSTDateTime.fromComponents(
          currentDateTime.year,
          currentDateTime.month,
          currentDateTime.day,
          0,
          0,
          0
        );

        // 実際の到着時刻を計算
        const actualArrivalTime = this.timeCalculation.calculateActualArrivalTime(
          tripResult.arrivalTime,
          delay,
          baseDate
        );

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
        };

        return dto;
      })
    );

    // 3. 残り時間順にソート
    buses.sort((a, b) => a.remainingMinutes - b.remainingMinutes);

    return buses;
  }
}
