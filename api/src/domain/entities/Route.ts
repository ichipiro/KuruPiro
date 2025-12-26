/**
 * バス路線を表すエンティティ
 *
 * 路線はID、短縮名、行き先停留所を持ちます。
 * エンティティは不変（immutable）で、IDで等価性を判定します。
 */
export class Route {
  private constructor(
    private readonly _routeId: string,
    private readonly _shortName: string,
    private readonly _destinationStop?: string
  ) {}

  /**
   * 路線を生成する
   * @throws {Error} routeIdまたはshortNameが空の場合
   */
  static create(
    routeId: string,
    shortName: string,
    destinationStop?: string
  ): Route {
    const trimmedRouteId = routeId.trim();
    const trimmedShortName = shortName.trim();
    const trimmedDestination = destinationStop?.trim();

    if (trimmedRouteId.length === 0) {
      throw new Error('Route ID cannot be empty');
    }

    if (trimmedShortName.length === 0) {
      throw new Error('Route short name cannot be empty');
    }

    // destinationStopが空文字列または空白のみの場合はundefined
    const finalDestination =
      trimmedDestination && trimmedDestination.length > 0
        ? trimmedDestination
        : undefined;

    return new Route(trimmedRouteId, trimmedShortName, finalDestination);
  }

  /**
   * 路線ID
   */
  get routeId(): string {
    return this._routeId;
  }

  /**
   * 路線短縮名
   */
  get shortName(): string {
    return this._shortName;
  }

  /**
   * 行き先停留所（オプション）
   */
  get destinationStop(): string | undefined {
    return this._destinationStop;
  }

  /**
   * 他の路線と等しいかどうか（IDで判定）
   */
  equals(other: Route): boolean {
    return this._routeId === other._routeId;
  }

  /**
   * 表示用の路線名を返す
   * 行き先がある場合は「shortName（destination行き）」
   * 行き先がない場合は「shortName」のみ
   */
  getDisplayName(): string {
    if (this._destinationStop) {
      return `${this._shortName}（${this._destinationStop}行き）`;
    }
    return this._shortName;
  }
}
