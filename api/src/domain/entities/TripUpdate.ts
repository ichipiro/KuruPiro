import { TripId, StopId, Delay } from '../value-objects/identifiers';

/**
 * 停留所の遅延情報を表す値オブジェクト
 */
export class StopTimeUpdate {
  private constructor(
    private readonly _stopSequence: number | undefined,
    private readonly _stopId: StopId | undefined,
    private readonly _arrivalDelay: Delay | undefined,
    private readonly _departureDelay: Delay | undefined,
    private readonly _arrivalTime: number | undefined,
    private readonly _departureTime: number | undefined
  ) {}

  static create(params: {
    stopSequence?: number;
    stopId?: StopId;
    arrivalDelay?: Delay;
    departureDelay?: Delay;
    arrivalTime?: number;
    departureTime?: number;
  }): StopTimeUpdate {
    return new StopTimeUpdate(
      params.stopSequence,
      params.stopId,
      params.arrivalDelay,
      params.departureDelay,
      params.arrivalTime,
      params.departureTime
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

  get arrivalTime(): number | undefined {
    return this._arrivalTime;
  }

  get departureTime(): number | undefined {
    return this._departureTime;
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
    return this._stopTimeUpdates;
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

  /**
   * 現在のバスの位置（最も近い次の停留所）の stopSequence を取得
   * フィードに含まれる最小の stopSequence を返す
   *
   * @returns 最小の stopSequence。フィードが空の場合は undefined
   */
  getCurrentStopSequence(): number | undefined {
    if (this._stopTimeUpdates.length === 0) {
      return undefined;
    }

    const sequences = this._stopTimeUpdates
      .map((update) => update.stopSequence)
      .filter((seq): seq is number => seq !== undefined)
      .sort((a, b) => a - b);

    return sequences.length > 0 ? sequences[0] : undefined;
  }

  /**
   * 現在のバスの位置（最も近い次の停留所）の StopId を取得
   *
   * @returns 最小の stopSequence に対応する StopId。見つからない場合は undefined
   */
  getCurrentStopId(): StopId | undefined {
    const currentSequence = this.getCurrentStopSequence();
    if (currentSequence === undefined) {
      return undefined;
    }

    const currentUpdate = this._stopTimeUpdates.find(
      (update) => update.stopSequence === currentSequence
    );

    return currentUpdate?.stopId;
  }
}
