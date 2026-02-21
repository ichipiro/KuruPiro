import type { IRealtimeRepository } from '@/domain/repositories';

export class ForceUpdateRealtimeUseCase {
  constructor(private readonly realtimeRepo: IRealtimeRepository) {}

  async execute(): Promise<{ updatedAt: number }> {
    await this.realtimeRepo.forceUpdate();
    return { updatedAt: Date.now() };
  }
}
