/**
 * ID系とシンプルな値オブジェクトを集約したファイル
 *
 * 含まれるクラス:
 * - TripId: トリップID
 * - StopId: 停留所ID
 * - Delay: 遅延時間
 * - RemainingTime: 残り時間
 */

// ===================================
// TripId
// ===================================

/**
 * トリップIDを表す値オブジェクト
 *
 * このクラスは不変（immutable）で、値の等価性で比較されます。
 */
export class TripId {
  private constructor(private readonly _value: string) {}

  /**
   * 文字列からトリップIDを生成
   */
  static fromString(id: string): TripId {
    if (!id || id.trim().length === 0) {
      throw new InvalidTripIdError('Trip ID cannot be empty');
    }

    return new TripId(id.trim());
  }

  /**
   * 他のTripIdと等しいかどうか
   */
  equals(other: TripId): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列表現
   */
  toString(): string {
    return this._value;
  }

  /**
   * 値を取得
   */
  get value(): string {
    return this._value;
  }
}

/**
 * トリップIDエラー
 */
export class InvalidTripIdError extends Error {
  constructor(message: string) {
    super(`Invalid Trip ID: ${message}`);
    this.name = 'InvalidTripIdError';
  }
}

// ===================================
// StopId
// ===================================

/**
 * 停留所IDを表す値オブジェクト
 *
 * 停留所IDの正規化（スペースをアンダースコアに置き換えるなど）を行います。
 * このクラスは不変（immutable）で、値の等価性で比較されます。
 */
export class StopId {
  private constructor(private readonly _value: string) {}

  /**
   * 文字列から停留所IDを生成
   * スペースをアンダースコアに正規化します
   */
  static fromString(id: string): StopId {
    if (!id || id.trim().length === 0) {
      throw new InvalidStopIdError('Stop ID cannot be empty');
    }

    // スペースをアンダースコアに置き換えて正規化
    const normalized = id.replace(/\s+/g, '_');
    return new StopId(normalized);
  }

  /**
   * 他のStopIdと等しいかどうか
   */
  equals(other: StopId): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列表現
   */
  toString(): string {
    return this._value;
  }

  /**
   * 値を取得
   */
  get value(): string {
    return this._value;
  }
}

/**
 * 停留所IDエラー
 */
export class InvalidStopIdError extends Error {
  constructor(message: string) {
    super(`Invalid Stop ID: ${message}`);
    this.name = 'InvalidStopIdError';
  }
}

// ===================================
// Delay
// ===================================

/**
 * 遅延時間を表す値オブジェクト
 *
 * バスの遅延時間を秒単位で表現します。
 * このクラスは不変（immutable）で、値の等価性で比較されます。
 */
export class Delay {
  private constructor(private readonly _seconds: number) {}

  /**
   * 秒数から遅延を生成
   */
  static fromSeconds(seconds: number): Delay {
    return new Delay(seconds);
  }

  /**
   * 遅延なしを表すDelayを返す
   */
  static none(): Delay {
    return new Delay(0);
  }

  /**
   * 分単位で遅延を生成
   */
  static fromMinutes(minutes: number): Delay {
    return new Delay(minutes * 60);
  }

  /**
   * 遅延があるかどうか
   */
  hasDelay(): boolean {
    return this._seconds > 0;
  }

  /**
   * 遅延時間を分単位で取得（切り上げ）
   */
  get minutes(): number {
    return Math.ceil(this._seconds / 60);
  }

  /**
   * 遅延時間を秒単位で取得
   */
  get seconds(): number {
    return this._seconds;
  }

  /**
   * 遅延時間を秒単位で取得（メソッド形式）
   */
  toSeconds(): number {
    return this._seconds;
  }

  /**
   * 表示用の文字列を返す
   * 遅延がない場合は空文字、ある場合は「X分遅れ」
   */
  toDisplayString(): string {
    if (!this.hasDelay()) {
      return '';
    }
    return `${this.minutes}分遅れ`;
  }

  /**
   * 他のDelayと等しいかどうか
   */
  equals(other: Delay): boolean {
    return this._seconds === other._seconds;
  }
}

// ===================================
// RemainingTime
// ===================================

/**
 * 到着までの残り時間を表す値オブジェクト
 *
 * バスが到着するまでの残り時間を分単位で表現します。
 * このクラスは不変（immutable）で、値の等価性で比較されます。
 */
export class RemainingTime {
  private constructor(private readonly _minutes: number) {}

  /**
   * 分数から残り時間を生成
   */
  static fromMinutes(minutes: number): RemainingTime {
    return new RemainingTime(Math.max(0, minutes));
  }

  /**
   * ミリ秒から残り時間を生成
   */
  static fromMilliseconds(milliseconds: number): RemainingTime {
    const minutes = Math.floor(milliseconds / 60000);
    return new RemainingTime(Math.max(0, minutes));
  }

  /**
   * 秒数から残り時間を生成
   */
  static fromSeconds(seconds: number): RemainingTime {
    const minutes = Math.floor(seconds / 60);
    return new RemainingTime(minutes); // 負の値も許容（過去の便）
  }

  /**
   * 残り時間を分単位で取得
   */
  get minutes(): number {
    return this._minutes;
  }

  /**
   * 残り時間を分単位で取得（メソッド形式）
   */
  toMinutes(): number {
    return this._minutes;
  }

  /**
   * まもなく到着かどうか（1分以内）
   */
  isArriving(): boolean {
    return this._minutes <= 1;
  }

  /**
   * 表示用の文字列を返す
   * 1分以内または計算エラー（負の値、異常に大きい値）の場合は「まもなく到着」
   * それ以外は「あとX分」
   */
  toDisplayString(): string {
    // 0分、1分、または異常値（1440分=24時間以上）の場合
    if (this._minutes <= 1 || this._minutes > 1440) {
      return 'まもなく到着';
    }
    return `あと${this._minutes}分`;
  }

  /**
   * 文字列表現を返す（toDisplayStringのエイリアス）
   */
  toString(): string {
    return this.toDisplayString();
  }

  /**
   * 他のRemainingTimeと等しいかどうか
   */
  equals(other: RemainingTime): boolean {
    return this._minutes === other._minutes;
  }
}
