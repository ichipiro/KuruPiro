import { Stop } from '../entities/Stop';
import { StopId } from '../value-objects/StopId';

/**
 * 停留所リポジトリのインターフェース
 *
 * ドメイン層で定義し、インフラ層で実装します（依存性逆転の原則）
 */
export interface IStopRepository {
  /**
   * IDで停留所を検索
   * @param id 停留所ID
   * @returns 停留所、見つからない場合はundefined
   */
  findById(id: StopId): Promise<Stop | undefined>;

  /**
   * 停留所名で検索
   * @param id 停留所ID
   * @returns 停留所名、見つからない場合は空文字列
   */
  findNameById(id: StopId): Promise<string>;

  /**
   * 全ての停留所を取得
   * @returns 停留所の配列
   */
  findAll(): Promise<Stop[]>;
}
