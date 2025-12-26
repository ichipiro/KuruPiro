import { TripId } from '../value-objects/identifiers';

/**
 * バス運行便を表すエンティティ
 *
 * トリップはID、路線ID、サービスID、行き先、方向を持ちます。
 * エンティティは不変（immutable）で、IDで等価性を判定します。
 */
export class Trip {
  private constructor(
    private readonly _id: TripId,
    private readonly _routeId: string,
    private readonly _serviceId: string,
    private readonly _headsign?: string,
    private readonly _directionId?: number
  ) {}

  /**
   * トリップを生成する
   * @throws {Error} routeIdまたはserviceIdが空の場合
   */
  static create(
    id: TripId,
    routeId: string,
    serviceId: string,
    headsign?: string,
    directionId?: number
  ): Trip {
    const trimmedRouteId = routeId.trim();
    const trimmedServiceId = serviceId.trim();
    const trimmedHeadsign = headsign?.trim();

    if (trimmedRouteId.length === 0) {
      throw new Error('Route ID cannot be empty');
    }

    if (trimmedServiceId.length === 0) {
      throw new Error('Service ID cannot be empty');
    }

    // headsignが空文字列または空白のみの場合はundefined
    const finalHeadsign =
      trimmedHeadsign && trimmedHeadsign.length > 0
        ? trimmedHeadsign
        : undefined;

    return new Trip(
      id,
      trimmedRouteId,
      trimmedServiceId,
      finalHeadsign,
      directionId
    );
  }

  /**
   * トリップID
   */
  get id(): TripId {
    return this._id;
  }

  /**
   * 路線ID
   */
  get routeId(): string {
    return this._routeId;
  }

  /**
   * サービスID（運行カレンダーID）
   */
  get serviceId(): string {
    return this._serviceId;
  }

  /**
   * 行き先表示（オプション）
   */
  get headsign(): string | undefined {
    return this._headsign;
  }

  /**
   * 方向ID（0=往路、1=復路、オプション）
   */
  get directionId(): number | undefined {
    return this._directionId;
  }

  /**
   * 他のトリップと等しいかどうか（IDで判定）
   */
  equals(other: Trip): boolean {
    return this._id.equals(other._id);
  }

  /**
   * 方向を日本語で取得
   * 0=往路、1=復路、それ以外=不明
   */
  getDirection(): string {
    if (this._directionId === 0) {
      return '往路';
    }
    if (this._directionId === 1) {
      return '復路';
    }
    return '不明';
  }
}
