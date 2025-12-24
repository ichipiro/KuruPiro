import { GTFSTime } from './GTFSTime';

/**
 * JST（日本標準時、UTC+9）の日時を表す値オブジェクト
 *
 * このクラスは不変（immutable）で、値の等価性で比較されます。
 * 全ての操作は新しいインスタンスを返します。
 */
export class JSTDateTime {
  private readonly date: Date;

  private constructor(date: Date) {
    this.date = new Date(date);
  }

  /**
   * 現在のJST時刻を取得
   */
  static now(): JSTDateTime {
    return new JSTDateTime(new Date());
  }

  /**
   * JavaScriptのDateオブジェクトからJSTDateTimeを生成
   */
  static fromDate(date: Date): JSTDateTime {
    return new JSTDateTime(date);
  }

  /**
   * ISO 8601形式の文字列からJSTDateTimeを生成
   * @param isoString - ISO 8601形式の文字列（例: "2024-01-15T14:30:45+09:00"）
   */
  static fromString(isoString: string): JSTDateTime {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      throw new InvalidJSTDateTimeError(`Invalid date string: ${isoString}`);
    }
    return new JSTDateTime(date);
  }

  /**
   * Unix timestamp（秒）からJSTDateTimeを生成
   * @param timestamp - Unix timestamp（秒）
   */
  static fromUnixTimestamp(timestamp: number): JSTDateTime {
    const date = new Date(timestamp * 1000); // ミリ秒に変換
    if (isNaN(date.getTime())) {
      throw new InvalidJSTDateTimeError(`Invalid Unix timestamp: ${timestamp}`);
    }
    return new JSTDateTime(date);
  }

  /**
   * 年月日時分秒の各要素からJSTDateTimeを生成
   * @param year - 年
   * @param month - 月（1-12）
   * @param day - 日（1-31）
   * @param hour - 時（0-23）、省略時は0
   * @param minute - 分（0-59）、省略時は0
   * @param second - 秒（0-59）、省略時は0
   */
  static fromComponents(
    year: number,
    month: number,
    day: number,
    hour: number = 0,
    minute: number = 0,
    second: number = 0
  ): JSTDateTime {
    // バリデーション
    if (month < 1 || month > 12) {
      throw new InvalidJSTDateTimeError(`Invalid month: ${month}. Must be 1-12.`);
    }
    if (day < 1 || day > 31) {
      throw new InvalidJSTDateTimeError(`Invalid day: ${day}. Must be 1-31.`);
    }
    if (hour < 0 || hour > 23) {
      throw new InvalidJSTDateTimeError(`Invalid hour: ${hour}. Must be 0-23.`);
    }
    if (minute < 0 || minute > 59) {
      throw new InvalidJSTDateTimeError(`Invalid minute: ${minute}. Must be 0-59.`);
    }
    if (second < 0 || second > 59) {
      throw new InvalidJSTDateTimeError(`Invalid second: ${second}. Must be 0-59.`);
    }

    // JSTタイムゾーンでDateを作成
    // toLocaleStringを使ってJSTの時刻文字列を作成し、それをパース
    const jstString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}+09:00`;
    const date = new Date(jstString);

    if (isNaN(date.getTime())) {
      throw new InvalidJSTDateTimeError(`Invalid date components: ${year}-${month}-${day} ${hour}:${minute}:${second}`);
    }

    return new JSTDateTime(date);
  }

  /**
   * 日数を加算した新しいJSTDateTimeを返す
   */
  addDays(days: number): JSTDateTime {
    const newDate = new Date(this.date);
    newDate.setDate(newDate.getDate() + days);
    return new JSTDateTime(newDate);
  }

  /**
   * 時間を加算した新しいJSTDateTimeを返す
   */
  addHours(hours: number): JSTDateTime {
    const newDate = new Date(this.date);
    newDate.setHours(newDate.getHours() + hours);
    return new JSTDateTime(newDate);
  }

  /**
   * 分を加算した新しいJSTDateTimeを返す
   */
  addMinutes(minutes: number): JSTDateTime {
    const newDate = new Date(this.date);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    return new JSTDateTime(newDate);
  }

  /**
   * 秒を加算した新しいJSTDateTimeを返す
   */
  addSeconds(seconds: number): JSTDateTime {
    const newDate = new Date(this.date);
    newDate.setSeconds(newDate.getSeconds() + seconds);
    return new JSTDateTime(newDate);
  }

  /**
   * GTFSTimeを適用した新しいJSTDateTimeを返す
   * GTFSTimeが24時間を超える場合、翌日以降の時刻として扱います
   */
  withTime(gtfsTime: GTFSTime): JSTDateTime {
    const actualHour = gtfsTime.getActualHour();
    const daysOffset = gtfsTime.getDaysOffset();

    const result = JSTDateTime.fromComponents(
      this.year,
      this.month,
      this.day,
      actualHour,
      gtfsTime.getMinute(),
      gtfsTime.getSecond()
    );

    if (daysOffset > 0) {
      return result.addDays(daysOffset);
    }

    return result;
  }

  /**
   * 曜日を取得（0=月曜日, 1=火曜日, ..., 6=日曜日）
   * JavaScriptのgetDay()とは異なり、月曜日を0とします（GTFS仕様に合わせる）
   */
  getWeekday(): number {
    const day = this.date.getDay(); // 0=日曜日, 1=月曜日, ..., 6=土曜日
    return (day + 6) % 7; // 0=月曜日, 1=火曜日, ..., 6=日曜日 に変換
  }

  /**
   * 他のJSTDateTimeと比較
   * @returns 負の値: this < other, 0: this == other, 正の値: this > other
   */
  compareTo(other: JSTDateTime): number {
    return this.date.getTime() - other.date.getTime();
  }

  /**
   * 他のJSTDateTimeより後かどうか
   */
  isAfter(other: JSTDateTime): boolean {
    return this.compareTo(other) > 0;
  }

  /**
   * 他のJSTDateTimeより前かどうか
   */
  isBefore(other: JSTDateTime): boolean {
    return this.compareTo(other) < 0;
  }

  /**
   * 他のJSTDateTimeと等しいか前かどうか
   */
  isBeforeOrEqual(other: JSTDateTime): boolean {
    return this.compareTo(other) <= 0;
  }

  /**
   * 他のJSTDateTimeとの差をミリ秒で返す
   */
  diff(other: JSTDateTime): number {
    return this.date.getTime() - other.date.getTime();
  }

  /**
   * JavaScriptのDateオブジェクトに変換
   */
  toDate(): Date {
    return new Date(this.date);
  }

  /**
   * ISO 8601形式の文字列で返す（JSTタイムゾーン付き）
   * 例: "2024-01-15T14:30:45+09:00"
   */
  toISOString(): string {
    const year = this.year;
    const month = String(this.month).padStart(2, '0');
    const day = String(this.day).padStart(2, '0');
    const hour = String(this.hour).padStart(2, '0');
    const minute = String(this.minute).padStart(2, '0');
    const second = String(this.second).padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}:${second}+09:00`;
  }

  /**
   * 表示用の文字列（YYYY-MM-DD HH:MM形式）
   */
  toDisplayString(): string {
    const year = this.year;
    const month = String(this.month).padStart(2, '0');
    const day = String(this.day).padStart(2, '0');
    const hour = String(this.hour).padStart(2, '0');
    const minute = String(this.minute).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  /**
   * 時刻文字列（HH:MM形式）
   */
  toTimeString(): string {
    const hour = String(this.hour).padStart(2, '0');
    const minute = String(this.minute).padStart(2, '0');
    return `${hour}:${minute}`;
  }

  /**
   * JSTの年を取得
   */
  get year(): number {
    return parseInt(this.date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric' }), 10);
  }

  /**
   * JSTの月を取得（1-12）
   */
  get month(): number {
    return parseInt(this.date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', month: 'numeric' }), 10);
  }

  /**
   * JSTの日を取得（1-31）
   */
  get day(): number {
    return parseInt(this.date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', day: 'numeric' }), 10);
  }

  /**
   * JSTの時を取得（0-23）
   */
  get hour(): number {
    return parseInt(this.date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', hour: 'numeric', hour12: false }), 10);
  }

  /**
   * JSTの分を取得（0-59）
   */
  get minute(): number {
    return parseInt(this.date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', minute: 'numeric' }), 10);
  }

  /**
   * JSTの秒を取得（0-59）
   */
  get second(): number {
    return parseInt(this.date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', second: 'numeric' }), 10);
  }
}

/**
 * JST日時エラー
 */
export class InvalidJSTDateTimeError extends Error {
  constructor(message: string) {
    super(`Invalid JST DateTime: ${message}`);
    this.name = 'InvalidJSTDateTimeError';
  }
}
