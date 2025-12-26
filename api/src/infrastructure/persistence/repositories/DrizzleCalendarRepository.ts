import { eq, and, lte, gte } from 'drizzle-orm';
import { ICalendarRepository } from '@/domain/repositories';
import { Calendar } from '@/domain/entities/Calendar';
import { JSTDateTime } from '@/domain/value-objects/time';
import { getDBClient } from '@/db/client';
import { calendar } from '@/db/schema';
import { CalendarMapper } from '../mappers';

/**
 * Drizzle ORMを使用したCalendarリポジトリの実装
 */
export class DrizzleCalendarRepository implements ICalendarRepository {
  constructor(private readonly d1: D1Database) {}

  /**
   * サービスIDでカレンダーを検索
   */
  async findByServiceId(serviceId: string): Promise<Calendar | undefined> {
    const db = getDBClient(this.d1);

    const result = await db
      .select()
      .from(calendar)
      .where(eq(calendar.serviceId, serviceId))
      .limit(1);

    if (result.length === 0) {
      return undefined;
    }

    return CalendarMapper.toDomain(result[0]);
  }

  /**
   * 指定した日付と曜日に有効なカレンダーを検索
   */
  async findActiveByDateAndWeekday(
    date: JSTDateTime,
    weekday: number
  ): Promise<Calendar[]> {
    const db = getDBClient(this.d1);

    // GTFS date format: YYYYMMDD
    const dateString = this.formatGTFSDate(date);

    // 曜日列名を取得（monday, tuesday, ..., sunday）
    const weekdayColumns = [
      calendar.monday,
      calendar.tuesday,
      calendar.wednesday,
      calendar.thursday,
      calendar.friday,
      calendar.saturday,
      calendar.sunday,
    ];

    if (weekday < 0 || weekday > 6) {
      return [];
    }

    const weekdayColumn = weekdayColumns[weekday];

    // 日付範囲内で、指定した曜日に運行されるカレンダーを検索
    const results = await db
      .select()
      .from(calendar)
      .where(
        and(
          lte(calendar.startDate, dateString),
          gte(calendar.endDate, dateString),
          eq(weekdayColumn, 1)
        )
      );

    return results.map((record) => CalendarMapper.toDomain(record));
  }

  /**
   * 全てのカレンダーを取得
   */
  async findAll(): Promise<Calendar[]> {
    const db = getDBClient(this.d1);

    const results = await db.select().from(calendar);

    return results.map((record) => CalendarMapper.toDomain(record));
  }

  /**
   * JSTDateTimeをGTFS形式の日付文字列（YYYYMMDD）に変換
   */
  private formatGTFSDate(date: JSTDateTime): string {
    const year = date.year.toString().padStart(4, '0');
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }
}
