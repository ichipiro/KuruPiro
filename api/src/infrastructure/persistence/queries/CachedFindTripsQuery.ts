import { StopId } from '@/domain/value-objects/identifiers';
import { GTFSTime } from '@/domain/value-objects/time';
import type { IFindTripsQuery, TripSearchResult } from '@/domain/queries';

/**
 * キャッシュに保存する形（GTFSTimeは文字列に落とす）
 */
interface SerializedTripSearchResult extends Omit<TripSearchResult, 'arrivalTime'> {
  arrivalTime: string;
}

/**
 * KVキー先頭の名前空間
 *
 * キーの意味やシリアライズ形式を変えるときはバージョンを上げて
 * 旧エントリを自然失効させる（v1=曜日キー、v2=サービス日キー）。
 */
const KEY_PREFIX = 'timetable:v2';

/**
 * 曜日ごとの時刻表のキャッシュ保持時間（秒）
 *
 * GTFSの静的データは取り込みバッチが更新するまで変わらないため、
 * 1時間保持しても実データとのズレは最大1時間で解消される。
 */
const CACHE_TTL_SECONDS = 3600;

/**
 * isolateメモリ上の時刻表キャッシュの保持時間（ミリ秒）: 10分
 *
 * KV読み取りの大半はサイネージの15秒ポーリング（方面数×端末数）で、
 * 2026-11-05に無料枠(10万read/日)の50%警告が届いた。ポーリング自体が
 * isolateを温め続けるため、メモリに持つだけで定常時のKV読み取りを
 * ほぼゼロにでき、端末が増えてもKV使用量が増えない。
 *
 * KVのTTL(1時間)より短くしているのは、ダイヤ改正時にGitHub Actionsが
 * KVへ新時刻表を直接配信する経路があり、メモリ保持が長いほど
 * その反映が遅れるため。
 */
const MEMORY_TTL_MS = 10 * 60 * 1000;

/**
 * メモリキャッシュのエントリ数上限
 *
 * origin/destinationは任意入力なので、未知の組み合わせを投げ続けられても
 * isolateのメモリが際限なく育たないよう、超過時は挿入が古いものから捨てる。
 * 実際に使われる組み合わせ×日付は数十程度でこの上限には届かない。
 */
const MEMORY_MAX_ENTRIES = 256;

/** キャッシュキー → { 失効時刻, KVと同じシリアライズ形式の時刻表 } */
const memoryCache = new Map<
  string,
  { expiresAt: number; payload: SerializedTripSearchResult[] }
>();

/**
 * メモリキャッシュを空にする（テスト用）
 *
 * モジュールレベルの状態はテストケースをまたいで残るため、
 * beforeEachで呼んで独立性を保つ。
 */
export function clearTimetableMemoryCache(): void {
  memoryCache.clear();
}

function memoryGet(key: string): SerializedTripSearchResult[] | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  // ヒットしたキーを挿入順の末尾へ移す(LRU)。これがないと、任意入力の
  // origin/destを256通り流されただけでサイネージのホットキーが
  // 追い出され、KV読み取り削減が静かに無効化される
  memoryCache.delete(key);
  memoryCache.set(key, entry);
  return entry.payload;
}

function memorySet(key: string, payload: SerializedTripSearchResult[]): void {
  if (!memoryCache.has(key) && memoryCache.size >= MEMORY_MAX_ENTRIES) {
    const oldest = memoryCache.keys().next().value;
    if (oldest !== undefined) {
      memoryCache.delete(oldest);
    }
  }
  memoryCache.set(key, { expiresAt: Date.now() + MEMORY_TTL_MS, payload });
}

/**
 * 「実際に使われた出発地×目的地」を記録するキーの名前空間
 *
 * ダイヤ改正時、GitHub Actionsがこのキー一覧から使用中の組み合わせを
 * 取得し、D1の分割取り込み（数日かかる）を待たずに新しい時刻表を
 * 直接KVへ配信する。フロントの組み合わせが変わっても、リクエストが
 * 来た時点で自動的に記録されるため設定のメンテナンスは不要。
 */
const PAIR_KEY_PREFIX = 'pairs:v1';

/**
 * 組み合わせ記録の保持時間（秒）: 30日
 *
 * 30日以上リクエストのない組み合わせは配信対象から自然に外れる。
 */
const PAIR_TTL_SECONDS = 30 * 24 * 3600;

/**
 * 曜日ごとの時刻表を isolateメモリ → KV → D1 の3層でキャッシュするデコレーター
 *
 * 「その曜日に出発地→目的地を走る便と予定時刻」はGTFS静的データが
 * 更新されるまで変化しないため、D1に問い合わせるのは初回だけで済みます。
 * 遅延・残り時間といったリアルタイム要素は呼び出し側が毎回計算するので、
 * キャッシュしても表示の鮮度は落ちません。
 *
 * Cache APIではなくKVを使うのは、Cache APIがカスタムドメインを持たない
 * workers.dev 配信では機能しない（put/matchが何もしない）ため。
 * KVはグローバルに共有されるので、コロケーションをまたいでもヒットします。
 */
export class CachedFindTripsQuery implements IFindTripsQuery {
  /**
   * @param writesDisabled trueでKVへの書き込み（時刻表put・pairs記録）を行わない。
   *   プレビューWorkerは本番KVを共有しているため、ブランチ側のバグや
   *   シリアライズ変更が本番のキャッシュを汚染しないようにする。
   *   読み取りとisolateメモリ（Worker単位で隔離される）は通常どおり動く。
   */
  constructor(
    private readonly inner: IFindTripsQuery,
    private readonly kv?: KVNamespace,
    private readonly ctx?: ExecutionContext,
    private readonly writesDisabled = false
  ) {}

  async findByStopsAndDate(
    originStopId: StopId,
    destinationStopId: StopId,
    serviceDate: string,
    weekday: number
  ): Promise<TripSearchResult[]> {
    if (!this.kv) {
      return this.inner.findByStopsAndDate(originStopId, destinationStopId, serviceDate, weekday);
    }

    const cacheKey = this.buildCacheKey(originStopId, destinationStopId, serviceDate);

    // 第1層: isolateメモリ（KV読み取りを消費しない）
    const fromMemory = memoryGet(cacheKey);
    if (fromMemory) {
      return fromMemory.map(deserialize);
    }

    // 第2層: KV。読み取り失敗はキャッシュミスとして扱う
    let cached: SerializedTripSearchResult[] | null = null;
    try {
      cached = await this.kv.get<SerializedTripSearchResult[]>(cacheKey, 'json');
    } catch {
      cached = null;
    }
    if (cached) {
      // 復元に成功した値だけをメモリへ載せる。先に載せると、KVに壊れた値が
      // 入ったときKV側を直してもisolateごとに最大10分エラーが固定される
      const restored = cached.map(deserialize);
      memorySet(cacheKey, cached);
      return restored;
    }

    const results = await this.inner.findByStopsAndDate(
      originStopId,
      destinationStopId,
      serviceDate,
      weekday
    );

    const payload = results.map(serialize);
    memorySet(cacheKey, payload);

    // 結果が空のペアはKVに書かず、pairs記録もしない。存在しない組み合わせを
    // 投げ続けられると、KV書き込み(無料枠1,000/日で最もタイト)が空エントリで
    // 枯れ、pairs:v1レジストリも実在しないペアで汚れてダイヤ改正時のKV直接
    // 配信対象(上限100件)から実ペアを押し出しうる。正当な空(運休日など)は
    // isolateメモリ(10分)が吸収するため、D1へ毎回行くことにはならない
    if (payload.length === 0 || this.writesDisabled) {
      return results;
    }

    // レスポンス返却をブロックしないよう、書き込みはwaitUntilに逃がす。
    // KVの書き込み失敗はキャッシュされないだけなので握りつぶす。
    const background = Promise.all([
      this.kv
        .put(cacheKey, JSON.stringify(payload), {
          expirationTtl: CACHE_TTL_SECONDS,
        })
        .catch(() => {}),
      this.registerPair(originStopId, destinationStopId),
    ]);
    if (this.ctx) {
      this.ctx.waitUntil(background);
    } else {
      await background;
    }

    return results;
  }

  /**
   * 使用中の組み合わせとして記録する（未記録の場合のみ書き込む）
   */
  private async registerPair(
    originStopId: StopId,
    destinationStopId: StopId
  ): Promise<void> {
    if (!this.kv) return;
    const pairKey = `${PAIR_KEY_PREFIX}:${originStopId.value}:${destinationStopId.value}`;
    try {
      const existing = await this.kv.get(pairKey);
      if (existing === null) {
        await this.kv.put(pairKey, '1', { expirationTtl: PAIR_TTL_SECONDS });
      }
    } catch {
      // 記録できなくても配信対象から漏れるだけで、リクエスト自体は成立する
    }
  }

  private buildCacheKey(
    originStopId: StopId,
    destinationStopId: StopId,
    serviceDate: string
  ): string {
    return `${KEY_PREFIX}:${originStopId.value}:${destinationStopId.value}:${serviceDate}`;
  }
}

function serialize(result: TripSearchResult): SerializedTripSearchResult {
  return { ...result, arrivalTime: result.arrivalTime.toString() };
}

function deserialize(row: SerializedTripSearchResult): TripSearchResult {
  return { ...row, arrivalTime: GTFSTime.fromString(row.arrivalTime) };
}
