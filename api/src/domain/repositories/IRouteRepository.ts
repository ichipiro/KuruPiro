import { Route } from '../entities/Route';

/**
 * 路線リポジトリのインターフェース
 *
 * ドメイン層で定義し、インフラ層で実装します（依存性逆転の原則）
 */
export interface IRouteRepository {
  /**
   * IDで路線を検索
   * @param routeId 路線ID
   * @returns 路線、見つからない場合はundefined
   */
  findById(routeId: string): Promise<Route | undefined>;

  /**
   * 全ての路線を取得
   * @returns 路線の配列
   */
  findAll(): Promise<Route[]>;
}
