import { GTFSTime } from '@/domain/value-objects/GTFSTime';
import { JSTDateTime } from '@/domain/value-objects/JSTDateTime';
import { Delay } from '@/domain/value-objects/Delay';
import { RemainingTime } from '@/domain/value-objects/RemainingTime';

/**
 * 時刻計算のドメインサービス
 *
 * GTFS時刻への遅延適用や、残り時間の計算を担当します。
 * 24時間超の時刻（深夜バス）にも対応します。
 */
export class TimeCalculationService {
  /**
   * 予定時刻に遅延を適用して実際の到着時刻を計算
   *
   * @param scheduledTime GTFS予定時刻
   * @param delay 遅延（undefined の場合は遅延なし）
   * @param baseDate 基準日（通常は現在日）
   * @returns 実際の到着時刻（JST）
   */
  calculateActualArrivalTime(
    scheduledTime: GTFSTime,
    delay: Delay | undefined,
    baseDate: JSTDateTime
  ): JSTDateTime {
    // GTFS時刻を基準日に適用
    // withTime()は24時間超の時刻にも対応（25:30 → 翌日1:30）
    let actualTime = baseDate.withTime(scheduledTime);

    // 遅延がある場合は適用
    if (delay !== undefined) {
      actualTime = actualTime.addSeconds(delay.toSeconds());
    }

    return actualTime;
  }

  /**
   * 到着時刻までの残り時間を計算
   *
   * @param arrivalTime 到着時刻
   * @param currentTime 現在時刻
   * @returns 残り時間
   */
  calculateRemainingTime(
    arrivalTime: JSTDateTime,
    currentTime: JSTDateTime
  ): RemainingTime {
    // 差分をミリ秒で計算
    const diffMs = arrivalTime.diff(currentTime);

    // ミリ秒を秒に変換
    const diffSeconds = Math.floor(diffMs / 1000);

    return RemainingTime.fromSeconds(diffSeconds);
  }
}
