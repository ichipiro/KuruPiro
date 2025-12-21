import { Stop } from '@/domain/entities/Stop';
import { StopId } from '@/domain/value-objects/StopId';

/**
 * DBレコードからStopエンティティへの変換を行うマッパー
 */
export class StopMapper {
  /**
   * DBレコードからStopエンティティに変換
   */
  static toDomain(record: { stopId: string; stopName: string }): Stop {
    const stopId = StopId.fromString(record.stopId);
    return Stop.create(stopId, record.stopName);
  }

  /**
   * StopエンティティからDBレコードに変換
   * （今回は読み取り専用なので使用しないが、完全性のため定義）
   */
  static toPersistence(stop: Stop): { stop_id: string; stop_name: string } {
    return {
      stop_id: stop.id.value,
      stop_name: stop.name,
    };
  }
}
