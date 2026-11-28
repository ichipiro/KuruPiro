import type { IRealtimeRepository } from '@/domain/repositories';

/**
 * 応答に載せるリアルタイム鮮度（最終取得時刻）を取得するユースケース
 *
 * サイネージ等のクライアントが「古いデータを表示し続けていないか」を
 * 検知できるようにするための入口。
 */
export class GetRealtimeFreshnessUseCase {
  constructor(private readonly realtimeRepo: IRealtimeRepository) {}

  /**
   * @returns 提供中リアルタイムデータの取得時刻（epoch ms）。リアルタイムなしの場合はnull
   */
  async execute(): Promise<number | null> {
    try {
      return await this.realtimeRepo.getLastUpdatedAt();
    } catch {
      // 鮮度が取れないだけで応答全体を失敗させない（時刻表のみの応答と同じ扱い）
      return null;
    }
  }
}
