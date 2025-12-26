import { TripId, StopId } from '../value-objects/identifiers';
import { GTFSTime } from '../value-objects/time';

/**
 * バス便の停車時刻を表すエンティティ
 *
 * 特定のトリップ（バス便）が特定の停留所に停車する時刻と順序を持ちます。
 * エンティティは不変（immutable）で、tripIdとsequenceの組み合わせで等価性を判定します。
 */
export class StopTime {
  private constructor(
    private readonly _tripId: TripId,
    private readonly _stopId: StopId,
    private readonly _sequence: number,
    private readonly _arrivalTime: GTFSTime,
    private readonly _departureTime: GTFSTime
  ) {}

  /**
   * 停車時刻を生成する
   * @throws {Error} sequenceが0以下の場合
   * @throws {Error} 出発時刻が到着時刻より前の場合
   */
  static create(
    tripId: TripId,
    stopId: StopId,
    sequence: number,
    arrivalTime: GTFSTime,
    departureTime: GTFSTime
  ): StopTime {
    if (sequence <= 0) {
      throw new Error('Stop sequence must be greater than 0');
    }

    // 出発時刻は到着時刻以降でなければならない
    if (departureTime.compareTo(arrivalTime) < 0) {
      throw new Error('Departure time must be after or equal to arrival time');
    }

    return new StopTime(tripId, stopId, sequence, arrivalTime, departureTime);
  }

  /**
   * トリップID
   */
  get tripId(): TripId {
    return this._tripId;
  }

  /**
   * 停留所ID
   */
  get stopId(): StopId {
    return this._stopId;
  }

  /**
   * 停車順序（1から始まる）
   */
  get sequence(): number {
    return this._sequence;
  }

  /**
   * 到着時刻
   */
  get arrivalTime(): GTFSTime {
    return this._arrivalTime;
  }

  /**
   * 出発時刻
   */
  get departureTime(): GTFSTime {
    return this._departureTime;
  }

  /**
   * 他のStopTimeと等しいかどうか（tripIdとsequenceで判定）
   */
  equals(other: StopTime): boolean {
    return (
      this._tripId.equals(other._tripId) &&
      this._sequence === other._sequence
    );
  }

  /**
   * 停車時間を分単位で取得
   * 到着時刻から出発時刻までの時間差
   */
  getDwellTime(): number {
    const arrivalMinutes = this._arrivalTime.toMinutes();
    const departureMinutes = this._departureTime.toMinutes();
    return departureMinutes - arrivalMinutes;
  }
}
