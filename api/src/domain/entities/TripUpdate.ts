import { TripId } from '../value-objects/TripId';
import { StopId } from '../value-objects/StopId';
import { Delay } from '../value-objects/Delay';

/**
 * 停留所の遅延情報を表す値オブジェクト
 */
export class StopTimeUpdate {
  private constructor(
    private readonly _stopSequence: number | undefined,
    private readonly _stopId: StopId | undefined,
    private readonly _arrivalDelay: Delay | undefined,
    private readonly _departureDelay: Delay | undefined
  ) {}

  static create(params: {
    stopSequence?: number;
    stopId?: StopId;
    arrivalDelay?: Delay;
    departureDelay?: Delay;
  }): StopTimeUpdate {
    return new StopTimeUpdate(
      params.stopSequence,
      params.stopId,
      params.arrivalDelay,
      params.departureDelay
    );
  }

  get stopSequence(): number | undefined {
    return this._stopSequence;
  }

  get stopId(): StopId | undefined {
    return this._stopId;
  }

  get arrivalDelay(): Delay | undefined {
    return this._arrivalDelay;
  }

  get departureDelay(): Delay | undefined {
    return this._departureDelay;
  }

  /**
   * 遅延がある停留所かどうか
   */
  hasDelay(): boolean {
    return (
      (this._arrivalDelay !== undefined && this._arrivalDelay.hasDelay()) ||
      (this._departureDelay !== undefined && this._departureDelay.hasDelay())
    );
  }

  /**
   * 代表的な遅延を取得（出発優先、なければ到着）
   */
  getRepresentativeDelay(): Delay {
    if (this._departureDelay !== undefined) {
      return this._departureDelay;
    }
    if (this._arrivalDelay !== undefined) {
      return this._arrivalDelay;
    }
    return Delay.none();
  }
}

/**
 * トリップの更新情報を表すエンティティ
 *
 * GTFSリアルタイムから取得したトリップの遅延・運行状況を保持します。
 */
export class TripUpdate {
  private constructor(
    private readonly _tripId: TripId,
    private readonly _stopTimeUpdates: StopTimeUpdate[]
  ) {}

  static create(tripId: TripId, stopTimeUpdates: StopTimeUpdate[]): TripUpdate {
    return new TripUpdate(tripId, [...stopTimeUpdates]);
  }

  get tripId(): TripId {
    return this._tripId;
  }

  get stopTimeUpdates(): StopTimeUpdate[] {
    return [...this._stopTimeUpdates];
  }

  /**
   * 指定した停留所の遅延情報を取得
   */
  findStopTimeUpdate(stopSequence: number): StopTimeUpdate | undefined {
    return this._stopTimeUpdates.find(
      (update) => update.stopSequence === stopSequence
    );
  }

  /**
   * 指定した停留所IDの遅延情報を取得
   */
  findStopTimeUpdateByStopId(stopId: StopId): StopTimeUpdate | undefined {
    return this._stopTimeUpdates.find(
      (update) => update.stopId !== undefined && update.stopId.equals(stopId)
    );
  }

  /**
   * トリップに遅延があるかどうか
   */
  hasAnyDelay(): boolean {
    return this._stopTimeUpdates.some((update) => update.hasDelay());
  }
}
