/**
 * 停留所IDを表す値オブジェクト
 *
 * 停留所IDの正規化（スペースをアンダースコアに置き換えるなど）を行います。
 * このクラスは不変（immutable）で、値の等価性で比較されます。
 */
export class StopId {
  private constructor(private readonly _value: string) {}

  /**
   * 文字列から停留所IDを生成
   * スペースをアンダースコアに正規化します
   */
  static fromString(id: string): StopId {
    if (!id || id.trim().length === 0) {
      throw new InvalidStopIdError('Stop ID cannot be empty');
    }

    // スペースをアンダースコアに置き換えて正規化
    const normalized = id.replace(/\s+/g, '_');
    return new StopId(normalized);
  }

  /**
   * 他のStopIdと等しいかどうか
   */
  equals(other: StopId): boolean {
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
 * 停留所IDエラー
 */
export class InvalidStopIdError extends Error {
  constructor(message: string) {
    super(`Invalid Stop ID: ${message}`);
    this.name = 'InvalidStopIdError';
  }
}
