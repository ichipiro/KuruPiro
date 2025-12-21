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
