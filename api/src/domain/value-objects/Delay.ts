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
