import { Calendar } from '../entities/Calendar';
import { JSTDateTime } from '../value-objects/JSTDateTime';

/**
 * 運行カレンダーリポジトリのインターフェース
 *
 * ドメイン層で定義し、インフラ層で実装します（依存性逆転の原則）
 */
export interface ICalendarRepository {
  /**
   * サービスIDでカレンダーを検索
   * @param serviceId サービスID
   * @returns カレンダー、見つからない場合はundefined
   */
  findByServiceId(serviceId: string): Promise<Calendar | undefined>;

  /**
   * 指定した日付と曜日に有効なカレンダーを検索
   * @param date 日付
   * @param weekday 曜日（0=Monday, 6=Sunday）
   * @returns 有効なカレンダーの配列
   */
  findActiveByDateAndWeekday(date: JSTDateTime, weekday: number): Promise<Calendar[]>;

  /**
   * 全てのカレンダーを取得
   * @returns カレンダーの配列
   */
  findAll(): Promise<Calendar[]>;
}
