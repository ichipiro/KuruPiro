import type { Env } from './types';
import type { TripUpdateRaw, CachedRealtimeData } from './infrastructure/external/durable-objects/types';
import { ProtobufDecoder } from './infrastructure/external/gtfs/ProtobufDecoder';

/**
 * Durable Object that periodically polls GTFS Realtime API
 * and publishes the trip updates snapshot to R2
 */
export class RealtimeCache implements DurableObject {
  private state: DurableObjectState;
  private env: Env;
  /** 手動強制更新(/update)のデバウンス用。alarm(15秒間隔)より短い連打を吸収する */
  private lastManualUpdateAt = 0;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    // 調査用計測: このログの頻度＝isolateの再起動頻度。
    // 「DO呼び出しが数秒待たされる」現象と再起動の相関を見る
    console.log('[RealtimeCache] instance constructed');
  }

  /**
   * Get the update interval from environment variables
   */
  private getUpdateInterval(): number {
    const intervalStr = this.env.REALTIME_UPDATE_INTERVAL;
    return intervalStr ? parseInt(intervalStr, 10) * 1000 : 15_000;
  }

  /**
   * Handle HTTP requests to this Durable Object
   */
  async fetch(request: Request): Promise<Response> {
    // 調査用計測: ハンドラ自体の所要時間（配送遅延はここに含まれない点に注意）
    const startedAt = Date.now();
    try {
      return await this.handleFetch(request);
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed > 500) {
        console.warn(`[RealtimeCache] slow handler: ${elapsed}ms ${new URL(request.url).pathname}`);
      }
    }
  }

  private async handleFetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Force update
    if (url.pathname === '/update') {
      // ポーラー無効環境（プレビュー等）では手動更新も受け付けない。
      // プレビューWorkerは本番と同じR2バケットを共有しているため、
      // ここを通すと本番のスナップショットを上書きできてしまう
      if (this.env.REALTIME_POLLER_ENABLED === 'false') {
        return new Response(JSON.stringify({ status: 'skipped', reason: 'poller disabled' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      // 連打で配信元を叩かないよう、ポーラー間隔(15秒)より短い10秒でデバウンス
      if (Date.now() - this.lastManualUpdateAt < 10_000) {
        return new Response(JSON.stringify({ status: 'skipped', reason: 'debounced' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      this.lastManualUpdateAt = Date.now();
      await this.updateRealtimeData();
      await this.ensureAlarmScheduled();
      return new Response(JSON.stringify({ status: 'updated' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Workerからのウォッチドッグ: alarmチェーンが切れていたら復活させる。
    // 読み取り経路がDOを呼ばなくなった(R2から読む)ため、alarmが一度消えると
    // 誰も起こさない「無音死」になる。それを防ぐ非ブロッキングの保険
    if (url.pathname === '/ensure-alarm') {
      const scheduled = await this.ensureAlarmScheduled();
      return new Response(JSON.stringify({ alarmScheduled: scheduled }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404 });
  }

  /**
   * Handle alarm events for periodic updates
   */
  async alarm(): Promise<void> {
    // プレビューWorker等ではポーリングしない（配信元への単一ポーラー約束を守る）
    if (this.env.REALTIME_POLLER_ENABLED === 'false') {
      console.log('[RealtimeCache] poller disabled, alarm chain stopped');
      return;
    }

    const startedAt = Date.now();
    const succeeded = await this.updateRealtimeData();
    // 失敗が続いても配信元を15秒間隔で叩き続けないよう、失敗時は60秒に退避する
    const interval = succeeded ? this.getUpdateInterval() : 60_000;
    await this.state.storage.setAlarm(Date.now() + interval);
    console.log(`[RealtimeCache] alarm done in ${Date.now() - startedAt}ms (next: +${interval / 1000}s)`);
  }

  /**
   * alarmチェーンが生きていることを保証する（冪等）
   */
  private async ensureAlarmScheduled(): Promise<boolean> {
    if (this.env.REALTIME_POLLER_ENABLED === 'false') {
      return false;
    }
    const current = await this.state.storage.getAlarm();
    if (current === null) {
      console.warn('[RealtimeCache] alarm chain was dead, rescheduling');
      await this.state.storage.setAlarm(Date.now() + 1000);
    }
    return true;
  }

  /**
   * Fetch and update realtime data
   */
  private async updateRealtimeData(): Promise<boolean> {
    // 「配信元への単一ポーラー」の約束を守る最後の砦。alarm以外にも
    // /updateから呼ばれるため、呼び出し元ではなくここで止める。
    // プレビューWorker等では配信元fetchも共有R2への書き込みも一切行わない
    if (this.env.REALTIME_POLLER_ENABLED === 'false') {
      console.log('[RealtimeCache] poller disabled, skipping update');
      return false;
    }

    try {
      const tripUpdates = await this.fetchRealtimeTripUpdates();

      const data: CachedRealtimeData = {
        fetchedAt: Date.now(),
        tripUpdates,
      };

      // スナップショットの置き場はR2のみ。Workerのリクエストはここから読む
      const putStartedAt = Date.now();
      await this.env.REALTIME_BUCKET.put(
        'realtime/trip-updates.json',
        JSON.stringify(data)
      );
      console.log(
        `[RealtimeCache] Updated ${tripUpdates.length} trip updates (put: ${Date.now() - putStartedAt}ms)`
      );
      return true;
    } catch (error) {
      console.error('[RealtimeCache] Failed to update realtime data:', error);
      // Don't throw - keep existing cached data if update fails
      return false;
    }
  }

  /**
   * Fetch trip updates from GTFS Realtime API
   */
  private async fetchRealtimeTripUpdates(): Promise<TripUpdateRaw[]> {
    // ?t= のキャッシュバスターは必須。CloudFrontのキャッシュキーには
    // クエリが含まれず無意味だが、Cloudflare自身がWorkersのfetch()サブ
    // リクエストをキャッシュする（この配信元は Cache-Control なし + .bin が
    // デフォルトキャッシュ対象拡張子 → デフォルトTTLで最大2時間固まる）。
    // 2026-10-30にバスター廃止後、約100分古い本文を掴み続ける障害が実際に発生した
    const fetchStartedAt = Date.now();
    // 配信元が応答しない場合に呼び出し元(alarm/初回リクエスト)ごと
    // 固まらないよう必ず打ち切る。失敗時は既存キャッシュが使われ続ける
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    const url = `${this.env.GTFS_REALTIME_URL}?t=${Date.now()}`;
    const response = await fetch(url, { signal: controller.signal }).finally(() =>
      clearTimeout(timer)
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch realtime data: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    console.log(
      `[RealtimeCache] Downloaded ${buffer.byteLength} bytes in ${Date.now() - fetchStartedAt}ms`
    );

    // Use ProtobufDecoder to decode the data
    const rawTripUpdates = await ProtobufDecoder.decodeTripUpdates(buffer);
    console.log(`[RealtimeCache] Decoded ${rawTripUpdates.length} trip updates`);

    // Debug: Log first 10 trip IDs
    console.log('[RealtimeCache] First 10 trip IDs:', rawTripUpdates.slice(0, 10).map(t => t.tripId));

    // Convert to TripUpdateEntity format
    return rawTripUpdates.map((raw) => ({
      tripId: raw.tripId,
      stopTimeUpdates: raw.stopTimeUpdates,
    }));
  }
}
