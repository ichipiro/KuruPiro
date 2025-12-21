import { Calendar } from '@/domain/entities/Calendar';
import { JSTDateTime } from '@/domain/value-objects/JSTDateTime';

/**
 * DBレコードからCalendarエンティティへの変換を行うマッパー
 */
export class CalendarMapper {
  /**
   * DBレコードからCalendarエンティティに変換
   */
  static toDomain(record: {
    serviceId: string;
    startDate: string;
    endDate: string;
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  }): Calendar {
    // GTFS date format: YYYYMMDD (e.g., "20240101")
    const startDate = this.parseGTFSDate(record.startDate);
    const endDate = this.parseGTFSDate(record.endDate);

    // GTFSのweekdaysは1=運行、0=運行なし
    // Calendarのweekdaysは[Monday, Tuesday, ..., Sunday]の順
    const weekdays = [
      record.monday === 1,
      record.tuesday === 1,
      record.wednesday === 1,
      record.thursday === 1,
      record.friday === 1,
      record.saturday === 1,
      record.sunday === 1,
    ];

    return Calendar.create(record.serviceId, startDate, endDate, weekdays);
  }

  /**
   * GTFS形式の日付文字列（YYYYMMDD）をJSTDateTimeに変換
   */
  private static parseGTFSDate(dateString: string): JSTDateTime {
    // "20240101" -> 2024, 01, 01
    const year = Number.parseInt(dateString.substring(0, 4), 10);
    const month = Number.parseInt(dateString.substring(4, 6), 10);
    const day = Number.parseInt(dateString.substring(6, 8), 10);

    return JSTDateTime.fromComponents(year, month, day, 0, 0, 0);
  }

  /**
   * CalendarエンティティからDBレコードに変換
   * （今回は読み取り専用なので使用しないが、完全性のため定義）
   */
  static toPersistence(calendar: Calendar): {
    service_id: string;
    start_date: string;
    end_date: string;
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  } {
    const weekdays = calendar.weekdays;

    return {
      service_id: calendar.serviceId,
      start_date: this.formatGTFSDate(calendar.startDate),
      end_date: this.formatGTFSDate(calendar.endDate),
      monday: weekdays[0] ? 1 : 0,
      tuesday: weekdays[1] ? 1 : 0,
      wednesday: weekdays[2] ? 1 : 0,
      thursday: weekdays[3] ? 1 : 0,
      friday: weekdays[4] ? 1 : 0,
      saturday: weekdays[5] ? 1 : 0,
      sunday: weekdays[6] ? 1 : 0,
    };
  }

  /**
   * JSTDateTimeをGTFS形式の日付文字列（YYYYMMDD）に変換
   */
  private static formatGTFSDate(date: JSTDateTime): string {
    const year = date.year.toString().padStart(4, '0');
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }
}
