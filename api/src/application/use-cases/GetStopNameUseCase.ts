import { StopId } from '@/domain/value-objects/StopId';
import type { IStopRepository } from '@/domain/repositories/IStopRepository';
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
   * @returns 停留所情報（存在しない場合はundefined）
   */
  async execute(stopId: StopId): Promise<StopDTO | undefined> {
    const stop = await this.stopRepo.findById(stopId);

    if (!stop) {
      return undefined;
    }

    return {
      stopId: stop.id.value,
      stopName: stop.name,
    };
  }
}
