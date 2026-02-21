import { StopId } from '@/domain/value-objects/identifiers';
import type { IStopRepository } from '@/domain/repositories';
import type { StopDTO } from '@/application/dto/NextBusDTO';

/**
 * 停留所名を取得するユースケース
 *
 * 停留所IDから停留所名を取得します。
 */
export class GetStopNameUseCase {
  constructor(private readonly stopRepo: IStopRepository) {}

  /**
   * 停留所名を取得
   *
   * @param stopId 停留所ID
   * @returns 停留所情報（存在しない場合は stopName が null）
   */
  async execute(stopId: StopId): Promise<StopDTO> {
    const stop = await this.stopRepo.findById(stopId);
    return {
      stopId: stopId.value,
      stopName: stop ? stop.name : null,
    };
  }
}
