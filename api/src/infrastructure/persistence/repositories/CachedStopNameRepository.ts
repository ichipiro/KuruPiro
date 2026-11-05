import type { IStopRepository } from '@/domain/repositories';
import type { Stop } from '@/domain/entities/Stop';
import { StopId } from '@/domain/value-objects/identifiers';

/**
 * isolateメモリ上の停留所名キャッシュの保持時間（ミリ秒）: 1時間
 *
 * 停留所名はGTFS静的データの取り込みで入れ替わるまで不変なので、
 * 長めに保持してよい。改正時もD1切り替え後、最大1時間で追従する。
 */
const MEMORY_TTL_MS = 60 * 60 * 1000;

/**
 * メモリキャッシュのエントリ数上限
 *
 * 現在位置に現れる停留所は路線上の数百件程度で、この上限には届かない。
 * リアルタイムフィード異常で未知IDが流れ込んでも育ち続けないための保険。
 */
const MEMORY_MAX_ENTRIES = 1024;

/** stopId → { 失効時刻, 停留所名 } */
const nameCache = new Map<string, { expiresAt: number; name: string }>();

/**
 * メモリキャッシュを空にする（テスト用）
 *
 * モジュールレベルの状態はテストケースをまたいで残るため、
 * beforeEachで呼んで独立性を保つ。
 */
export function clearStopNameMemoryCache(): void {
  nameCache.clear();
}

function memoryGet(key: string): string | null {
  const entry = nameCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    nameCache.delete(key);
    return null;
  }
  return entry.name;
}

function memorySet(key: string, name: string): void {
  if (!nameCache.has(key) && nameCache.size >= MEMORY_MAX_ENTRIES) {
    const oldest = nameCache.keys().next().value;
    if (oldest !== undefined) {
      nameCache.delete(oldest);
    }
  }
  nameCache.set(key, { expiresAt: Date.now() + MEMORY_TTL_MS, name });
}

/**
 * 停留所名をisolateメモリでキャッシュするデコレーター
 *
 * 現在位置（停留所名）の解決はウォーム経路で唯一残っていたD1往復で、
 * サイネージの15秒ポーリングのたびに走っていた。名前は改正まで不変
 * なのでメモリに持ち、定常時のD1クエリをゼロにする。
 *
 * D1の日次上限超過（取り込み期間に起こりうる）中でも、キャッシュ済みの
 * 名前は返せるため、リアルタイム表示の可用性も上がる。
 */
export class CachedStopNameRepository implements IStopRepository {
  constructor(private readonly inner: IStopRepository) {}

  async findById(id: StopId): Promise<Stop | undefined> {
    return this.inner.findById(id);
  }

  async findNameById(id: StopId): Promise<string> {
    const cached = memoryGet(id.value);
    if (cached !== null) {
      return cached;
    }
    const name = await this.inner.findNameById(id);
    if (name !== '') {
      memorySet(id.value, name);
    }
    return name;
  }

  async findNamesByIds(ids: StopId[]): Promise<Map<string, string>> {
    const names = new Map<string, string>();
    const missing: StopId[] = [];
    const seen = new Set<string>();

    for (const id of ids) {
      if (seen.has(id.value)) continue;
      seen.add(id.value);
      const cached = memoryGet(id.value);
      if (cached !== null) {
        names.set(id.value, cached);
      } else {
        missing.push(id);
      }
    }

    if (missing.length === 0) {
      return names;
    }

    const fetched = await this.inner.findNamesByIds(missing);
    for (const [stopId, name] of fetched) {
      names.set(stopId, name);
      memorySet(stopId, name);
    }

    return names;
  }

  async findAll(): Promise<Stop[]> {
    return this.inner.findAll();
  }
}
