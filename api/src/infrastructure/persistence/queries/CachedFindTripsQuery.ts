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
 * 曜日ごとの時刻表をKVでキャッシュするデコレーター
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
  constructor(
    private readonly inner: IFindTripsQuery,
    private readonly kv?: KVNamespace,
    private readonly ctx?: ExecutionContext
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

    // KVの読み取り失敗はキャッシュミスとして扱う
    let cached: SerializedTripSearchResult[] | null = null;
    try {
      cached = await this.kv.get<SerializedTripSearchResult[]>(cacheKey, 'json');
    } catch {
      cached = null;
    }
    if (cached) {
      return cached.map(deserialize);
    }

    const results = await this.inner.findByStopsAndDate(
      originStopId,
      destinationStopId,
      serviceDate,
      weekday
    );

    // レスポンス返却をブロックしないよう、書き込みはwaitUntilに逃がす。
    // KVの書き込み失敗はキャッシュされないだけなので握りつぶす。
    const background = Promise.all([
      this.kv
        .put(cacheKey, JSON.stringify(results.map(serialize)), {
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
