/**
 * トリップIDを表す値オブジェクト
 *
 * このクラスは不変（immutable）で、値の等価性で比較されます。
 */
export class TripId {
  private constructor(private readonly _value: string) {}

  /**
   * 文字列からトリップIDを生成
   */
  static fromString(id: string): TripId {
    if (!id || id.trim().length === 0) {
      throw new InvalidTripIdError('Trip ID cannot be empty');
    }

    return new TripId(id.trim());
  }

  /**
   * 他のTripIdと等しいかどうか
   */
  equals(other: TripId): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列表現
   */
  toString(): string {
    return this._value;
  }

  /**
   * 値を取得
   */
  get value(): string {
    return this._value;
  }
}

/**
 * トリップIDエラー
 */
export class InvalidTripIdError extends Error {
  constructor(message: string) {
    super(`Invalid Trip ID: ${message}`);
    this.name = 'InvalidTripIdError';
  }
}
