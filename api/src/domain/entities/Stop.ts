import { StopId } from '../value-objects/identifiers';

/**
 * バス停留所を表すエンティティ
 *
 * 停留所はIDと名前を持ちます。
 * エンティティは不変（immutable）で、IDで等価性を判定します。
 */
export class Stop {
  private constructor(
    private readonly _id: StopId,
    private readonly _name: string
  ) {}

  /**
   * 停留所を生成する
   * @throws {Error} 名前が空の場合
   */
  static create(id: StopId, name: string): Stop {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      throw new Error('Stop name cannot be empty');
    }
    return new Stop(id, trimmedName);
  }

  /**
   * 停留所ID
   */
  get id(): StopId {
    return this._id;
  }

  /**
   * 停留所名
   */
  get name(): string {
    return this._name;
  }

  /**
   * 他の停留所と等しいかどうか（IDで判定）
   */
  equals(other: Stop): boolean {
    return this._id.equals(other._id);
  }

  /**
   * 表示用の情報を返す
   */
  getDisplayInfo(): { id: string; name: string } {
    return {
      id: this._id.value,
      name: this._name,
    };
  }
}
