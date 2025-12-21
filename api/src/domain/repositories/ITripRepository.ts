import { Trip } from '../entities/Trip';
import { TripId } from '../value-objects/TripId';

/**
 * トリップリポジトリのインターフェース
 *
 * ドメイン層で定義し、インフラ層で実装します（依存性逆転の原則）
 */
export interface ITripRepository {
  /**
   * IDでトリップを検索
   * @param id トリップID
   * @returns トリップ、見つからない場合はundefined
   */
  findById(id: TripId): Promise<Trip | undefined>;

  /**
   * サービスIDでトリップを検索
   * @param serviceId サービスID
   * @returns トリップの配列
   */
  findByServiceId(serviceId: string): Promise<Trip[]>;

  /**
   * 路線IDでトリップを検索
   * @param routeId 路線ID
   * @returns トリップの配列
   */
  findByRouteId(routeId: string): Promise<Trip[]>;
}
