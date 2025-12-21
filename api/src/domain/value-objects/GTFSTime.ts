/**
 * GTFS時刻を表す値オブジェクト
 *
 * GTFS仕様では、深夜バスなどのために24時間を超える時刻表現を許容しています。
 * 例: "25:30:00" は翌日の1:30を表します。
 *
 * このクラスは不変（immutable）で、値の等価性で比較されます。
 */
export class GTFSTime {
  private readonly hour: number;
  private readonly minute: number;
  private readonly second: number;

  private constructor(hour: number, minute: number, second: number) {
    this.hour = hour;
    this.minute = minute;
    this.second = second;
  }

  /**
   * HH:MM:SS形式の文字列からGTFSTimeを生成
   * @param timeString - "14:30:00" または "25:15:00" 形式の文字列
   * @throws {InvalidGTFSTimeFormatError} 形式が不正な場合
   */
  static fromString(timeString: string): GTFSTime {
    const regex = /^(\d{1,2}):(\d{2}):(\d{2})$/;
    const match = timeString.match(regex);

    if (!match) {
      throw new InvalidGTFSTimeFormatError(timeString);
    }

    const hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const second = parseInt(match[3], 10);

    // 分と秒のバリデーション
    if (minute >= 60) {
      throw new InvalidGTFSTimeFormatError(
        `Invalid minute value: ${minute}. Must be 0-59.`
      );
    }
    if (second >= 60) {
      throw new InvalidGTFSTimeFormatError(
        `Invalid second value: ${second}. Must be 0-59.`
      );
    }
    if (hour < 0 || minute < 0 || second < 0) {
      throw new InvalidGTFSTimeFormatError(
        'Time values cannot be negative'
      );
    }

    return new GTFSTime(hour, minute, second);
  }

  /**
   * 時・分・秒の各要素からGTFSTimeを生成
   * @param hour - 時（0以上、24時間超も許容）
   * @param minute - 分（0-59）
   * @param second - 秒（0-59）
   * @throws {InvalidGTFSTimeFormatError} 値が不正な場合
   */
  static fromComponents(hour: number, minute: number, second: number): GTFSTime {
    // バリデーション
    if (minute < 0 || minute >= 60) {
      throw new InvalidGTFSTimeFormatError(
        `Invalid minute value: ${minute}. Must be 0-59.`
      );
    }
    if (second < 0 || second >= 60) {
      throw new InvalidGTFSTimeFormatError(
        `Invalid second value: ${second}. Must be 0-59.`
      );
    }
    if (hour < 0) {
      throw new InvalidGTFSTimeFormatError(
        `Invalid hour value: ${hour}. Must be 0 or greater.`
      );
    }

    return new GTFSTime(hour, minute, second);
  }

  /**
   * 時刻を分単位で返す
   * @returns 時刻を分で表した値（例: 14:30 → 870分）
   */
  toMinutes(): number {
    return this.hour * 60 + this.minute;
  }

  /**
   * 24時間を超える時刻かどうか
   * @returns 24時以降の場合true
   */
  isAfterMidnight(): boolean {
    return this.hour >= 24;
  }

  /**
   * 実際の時刻（0-23）を取得
   * @returns 0-23の範囲に変換された時
   */
  getActualHour(): number {
    return this.hour % 24;
  }

  /**
   * 日をまたぐ回数を取得
   * @returns 日数のオフセット（24時台なら1、48時台なら2）
   */
  getDaysOffset(): number {
    return Math.floor(this.hour / 24);
  }

  /**
   * 時間部分を取得（24時間超もそのまま）
   */
  getHour(): number {
    return this.hour;
  }

  /**
   * 分部分を取得
   */
  getMinute(): number {
    return this.minute;
  }

  /**
   * 秒部分を取得
   */
  getSecond(): number {
    return this.second;
  }

  /**
   * 他のGTFSTimeと比較
   * @returns 負の値: this < other, 0: this == other, 正の値: this > other
   */
  compareTo(other: GTFSTime): number {
    const thisMinutes = this.toMinutes();
    const otherMinutes = other.toMinutes();

    if (thisMinutes !== otherMinutes) {
      return thisMinutes - otherMinutes;
    }

    return this.second - other.second;
  }

  /**
   * 他のGTFSTimeより後かどうか
   */
  isAfter(other: GTFSTime): boolean {
    return this.compareTo(other) > 0;
  }

  /**
   * 他のGTFSTimeより前かどうか
   */
  isBefore(other: GTFSTime): boolean {
    return this.compareTo(other) < 0;
  }

  /**
   * 他のGTFSTimeと等しいかどうか
   */
  equals(other: GTFSTime): boolean {
    return this.compareTo(other) === 0;
  }

  /**
   * HH:MM:SS形式の文字列で返す
   */
  toString(): string {
    return this.value;
  }

  /**
   * 表示用の文字列（HH:MM形式、実際の時刻に変換）
   */
  toDisplayString(): string {
    const hour = this.getActualHour();
    const paddedHour = String(hour).padStart(2, '0');
    const paddedMinute = String(this.minute).padStart(2, '0');
    return `${paddedHour}:${paddedMinute}`;
  }

  /**
   * 元の文字列表現
   */
  get value(): string {
    const paddedHour = String(this.hour).padStart(2, '0');
    const paddedMinute = String(this.minute).padStart(2, '0');
    const paddedSecond = String(this.second).padStart(2, '0');
    return `${paddedHour}:${paddedMinute}:${paddedSecond}`;
  }
}

/**
 * GTFS時刻形式エラー
 */
export class InvalidGTFSTimeFormatError extends Error {
  constructor(message: string) {
    super(`Invalid GTFS time format: ${message}`);
    this.name = 'InvalidGTFSTimeFormatError';
  }
}
