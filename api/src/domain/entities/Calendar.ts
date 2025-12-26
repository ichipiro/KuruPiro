import { JSTDateTime } from '../value-objects/time';

/**
 * バス運行カレンダーを表すエンティティ
 *
 * 運行カレンダーはサービスID、運行期間、曜日別運行フラグを持ちます。
 * エンティティは不変（immutable）で、serviceIdで等価性を判定します。
 */
export class Calendar {
  private constructor(
    private readonly _serviceId: string,
    private readonly _startDate: JSTDateTime,
    private readonly _endDate: JSTDateTime,
    private readonly _weekdays: boolean[]
  ) {}

  /**
   * 運行カレンダーを生成する
   * @param weekdays 7要素の配列（monday=0, tuesday=1, ..., sunday=6）
   * @throws {Error} serviceIdが空の場合
   * @throws {Error} endDateがstartDateより前の場合
   * @throws {Error} weekdaysが7要素でない場合
   */
  static create(
    serviceId: string,
    startDate: JSTDateTime,
    endDate: JSTDateTime,
    weekdays: boolean[]
  ): Calendar {
    const trimmedServiceId = serviceId.trim();

    if (trimmedServiceId.length === 0) {
      throw new Error('Service ID cannot be empty');
    }

    if (endDate.isBefore(startDate)) {
      throw new Error('End date must be after or equal to start date');
    }

    if (weekdays.length !== 7) {
      throw new Error('Weekdays must have exactly 7 elements');
    }

    return new Calendar(
      trimmedServiceId,
      startDate,
      endDate,
      [...weekdays] // 配列をコピーして不変性を保証
    );
  }

  /**
   * サービスID
   */
  get serviceId(): string {
    return this._serviceId;
  }

  /**
   * 運行開始日
   */
  get startDate(): JSTDateTime {
    return this._startDate;
  }

  /**
   * 運行終了日
   */
  get endDate(): JSTDateTime {
    return this._endDate;
  }

  /**
   * 曜日別運行フラグ（monday=0, tuesday=1, ..., sunday=6）
   */
  get weekdays(): boolean[] {
    return [...this._weekdays]; // コピーを返して不変性を保証
  }

  /**
   * 他のカレンダーと等しいかどうか（serviceIdで判定）
   */
  equals(other: Calendar): boolean {
    return this._serviceId === other._serviceId;
  }

  /**
   * 指定した曜日に運行されるかどうか
   * @param weekday 曜日（0=Monday, 1=Tuesday, ..., 6=Sunday）
   */
  isActiveOnWeekday(weekday: number): boolean {
    if (weekday < 0 || weekday > 6) {
      return false;
    }
    return this._weekdays[weekday];
  }

  /**
   * 指定した日付が運行期間内かどうか
   * startDate <= date <= endDate
   */
  isActiveOnDate(date: JSTDateTime): boolean {
    return !date.isBefore(this._startDate) && !date.isAfter(this._endDate);
  }
}
