/**
 * GTFSデータから時刻表を直接計算してKVに配信する
 *
 * ## なぜActionsからKVに書くのか
 * D1へのGTFS取り込みは無料プランの書き込み上限のため数日に分かれるが、
 * この路線の配信元は施行前日〜当日にフィードを公開するため、D1の完了を
 * 待つとダイヤ改正が数日遅れて見える。GitHub Actionsはフィードの全データを
 * 手元に持っているので、実際に使われている出発地×目的地の時刻表だけを
 * ここで計算し、Workerが読むKVキーへ直接書き込んで当日中に反映させる。
 *
 * ## 使われている組み合わせをどう知るか
 * Worker側の `CachedFindTripsQuery` が、リクエストされた組み合わせを
 * `pairs:v1:出発地:目的地`（TTL30日）としてKVに自動記録している。
 * ここではそのキー一覧を読むだけなので、フロントの組み合わせが変わっても
 * 設定のメンテナンスは不要。
 *
 * ## Workerとの整合
 * - キーと値の形式は Worker 側と同一
 *   （`timetable:v1:出発地:目的地:曜日` / SerializedTripSearchResult[]）
 * - Actionsが書くエントリはTTL30日なので、TTL1時間のWorker製エントリと違い
 *   取り込み期間中に失効せず、WorkerがD1の古いデータで上書きすることもない
 * - D1切り替え完了後は `timetable:v1:*` を全削除し、以降はD1由来の
 *   通常キャッシュに戻す（削除に失敗してもその時点でD1と同内容なので無害）
 * - 計算ロジックは FindTripsQuery のSQL（曜日での絞り込み・stop_sequence の
 *   前後関係・目的地の前方一致・routes_jp由来のラベル）をJSで再現したもの
 *
 * APIトークンには Workers KV Storage:Edit の権限が必要。
 */

/** Worker側 CachedFindTripsQuery と同じキー体系（v2 = サービス日キー） */
const KEY_PREFIX = 'timetable:v2';
const PAIR_KEY_PREFIX = 'pairs:v1';

/**
 * Actionsが書いたエントリの保険としての失効（秒）
 *
 * 正常系ではD1切り替え完了時に削除される。
 */
const PINNED_TTL_SECONDS = 30 * 24 * 3600;

/**
 * 配信対象にする組み合わせ数の上限
 *
 * スクレイパー等が大量の組み合わせを記録してもKVの書き込み無料枠
 * （1,000回/日）を食い潰さないための保険。実際のフロントは数組しか使わない。
 */
const MAX_PAIRS = 100;

/**
 * 時刻を HH:MM:SS に正規化する（GTFSTime.toString() と同じ形）
 *
 * 深夜便の 24時以降（例 25:30:00）はそのまま保つ。
 */
function normalizeTime(time) {
  const [h = '0', m = '0', s = '0'] = String(time).split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`;
}

/**
 * サービス日（YYYYMMDD）にサービスが運行するか判定する
 *
 * FindTripsQuery と同じルール:
 * - calendar: 曜日フラグ + 適用期間(start_date <= 日付 <= end_date)
 * - calendar_dates: type=2で当日除外、type=1で当日追加（祝日など）
 */
function isServiceActive(indexes, serviceId, serviceDate, weekday) {
  const exception = indexes.exceptionsByServiceDate.get(`${serviceId}:${serviceDate}`);
  if (exception === 2) return false;
  if (exception === 1) return true;
  const cal = indexes.calendarByService.get(serviceId);
  if (!cal) return false;
  return (
    cal.weekdays[weekday] === 1 &&
    cal.startDate <= serviceDate &&
    cal.endDate >= serviceDate
  );
}

/**
 * サービス日の曜日（0=月曜..6=日曜）をYYYYMMDDから求める（TZ非依存）
 */
function weekdayOf(serviceDate) {
  const y = Number(serviceDate.slice(0, 4));
  const m = Number(serviceDate.slice(4, 6));
  const d = Number(serviceDate.slice(6, 8));
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=日曜
  return (day + 6) % 7;
}

/**
 * 1つの (出発地, 目的地, サービス日) の時刻表を計算する
 *
 * FindTripsQuery.findByStopsAndDate と同じ結果（シリアライズ形）を返す。
 */
function buildTimetable(indexes, originStopId, destinationStopId, serviceDate) {
  const { stopTimesByStop, stopTimesByTrip, tripsById, routesById } = indexes;
  const weekday = weekdayOf(serviceDate);

  // プレフィックスは末尾の `_` を含めて照合する（FindTripsQueryと同じ規則。
  // `_` を削ると '10_' が別グループの '1000_1' 等まで誤マッチする）
  const isPrefix = destinationStopId.endsWith('_');
  const matchesDest = (stopId) =>
    isPrefix ? stopId.startsWith(destinationStopId) : stopId === destinationStopId;

  const rows = [];
  for (const origin of stopTimesByStop.get(originStopId) ?? []) {
    const trip = tripsById.get(origin.tripId);
    if (!trip) continue;
    if (!isServiceActive(indexes, trip.serviceId, serviceDate, weekday)) continue;
    const route = routesById.get(trip.routeId);
    if (!route) continue;

    for (const dest of stopTimesByTrip.get(origin.tripId) ?? []) {
      if (dest.stopSequence <= origin.stopSequence) continue;
      if (!matchesDest(dest.stopId)) continue;
      rows.push({
        tripId: origin.tripId,
        arrivalTime: normalizeTime(origin.arrivalTime),
        stopSequence: origin.stopSequence,
        routeShortName: route.routeShortName,
        destinationStopId: dest.stopId,
        destinationLabel: route.destinationStop ?? dest.stopId,
        serviceId: trip.serviceId,
      });
    }
  }

  // SQL側の ORDER BY origin.arrival_time（文字列順）に合わせる
  rows.sort((a, b) => (a.arrivalTime < b.arrivalTime ? -1 : a.arrivalTime > b.arrivalTime ? 1 : 0));
  return rows;
}

/**
 * 配信対象のサービス日数（今日から何日分の時刻表をKVに置くか）
 */
const PUSH_DAYS = 8;

/**
 * 今日からPUSH_DAYS日分のサービス日（YYYYMMDD、JST基準）を返す
 */
export function upcomingServiceDates(now = new Date()) {
  const dates = [];
  for (let i = 0; i < PUSH_DAYS; i++) {
    // JSTは固定UTC+9
    const jst = new Date(now.getTime() + 9 * 3600 * 1000 + i * 86400 * 1000);
    dates.push(
      String(jst.getUTCFullYear()) +
        String(jst.getUTCMonth() + 1).padStart(2, '0') +
        String(jst.getUTCDate()).padStart(2, '0')
    );
  }
  return dates;
}

/**
 * 組み合わせ×直近サービス日のKVエントリを計算する
 *
 * @param {object} gtfs parseGtfsFiles の戻り値
 * @param {[string, string][]} pairs [出発地, 目的地] の配列
 * @param {string[]} [serviceDates] 対象サービス日（省略時は今日から8日分）
 * @returns {{key: string, value: string}[]}
 */
export function buildTimetables(gtfs, pairs, serviceDates = upcomingServiceDates()) {
  const stopTimesByStop = new Map();
  const stopTimesByTrip = new Map();
  for (const st of gtfs.stopTimes) {
    if (!stopTimesByStop.has(st.stopId)) stopTimesByStop.set(st.stopId, []);
    stopTimesByStop.get(st.stopId).push(st);
    if (!stopTimesByTrip.has(st.tripId)) stopTimesByTrip.set(st.tripId, []);
    stopTimesByTrip.get(st.tripId).push(st);
  }
  const indexes = {
    stopTimesByStop,
    stopTimesByTrip,
    tripsById: new Map(gtfs.trips.map((t) => [t.tripId, t])),
    routesById: new Map(gtfs.routes.map((r) => [r.routeId, r])),
    calendarByService: new Map(gtfs.calendar.map((c) => [c.serviceId, c])),
    exceptionsByServiceDate: new Map(
      (gtfs.calendarDates ?? []).map((cd) => [`${cd.serviceId}:${cd.date}`, cd.exceptionType])
    ),
  };

  const entries = [];
  for (const [origin, destination] of pairs) {
    for (const serviceDate of serviceDates) {
      const rows = buildTimetable(indexes, origin, destination, serviceDate);
      entries.push({
        key: `${KEY_PREFIX}:${origin}:${destination}:${serviceDate}`,
        value: JSON.stringify(rows),
      });
    }
  }
  return entries;
}

async function kvRequest(path, init, { accountId, namespaceId, apiToken }) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}${path}`,
    {
      ...init,
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    }
  );
  if (!response.ok) {
    throw new Error(`KV request failed: ${init.method} ${path} ${response.status} ${await response.text()}`);
  }
  const result = await response.json();
  if (result.success === false) {
    throw new Error(`KV request failed: ${JSON.stringify(result.errors)}`);
  }
  return result;
}

/**
 * 指定プレフィックスのKVキーを列挙する（ページング対応）
 */
async function listKeys(prefix, credentials, limit = Infinity) {
  const keys = [];
  let cursor;
  do {
    const params = new URLSearchParams({ prefix, limit: '1000' });
    if (cursor) params.set('cursor', cursor);
    const result = await kvRequest(`/keys?${params}`, { method: 'GET' }, credentials);
    for (const entry of result.result ?? []) {
      keys.push(entry.name);
      if (keys.length >= limit) return keys;
    }
    cursor = result.result_info?.cursor || undefined;
  } while (cursor);
  return keys;
}

/**
 * Workerが記録した「使用中の組み合わせ」を取得する
 *
 * @returns {Promise<[string, string][]>} [出発地, 目的地] の配列（上限あり）
 */
export async function listRegisteredPairs(credentials) {
  const keys = await listKeys(`${PAIR_KEY_PREFIX}:`, credentials, MAX_PAIRS);
  const pairs = [];
  for (const key of keys) {
    const parts = key.split(':');
    // pairs:v1:<origin>:<destination> 以外の形は無視する
    if (parts.length === 4 && parts[2] && parts[3]) {
      pairs.push([parts[2], parts[3]]);
    }
  }
  return pairs;
}

/**
 * 時刻表エントリをKVへ一括書き込みする
 */
export async function pushTimetablesToKV(entries, credentials) {
  if (entries.length === 0) return;
  const body = entries.map((e) => ({
    key: e.key,
    value: e.value,
    expiration_ttl: PINNED_TTL_SECONDS,
  }));
  await kvRequest('/bulk', { method: 'PUT', body: JSON.stringify(body) }, credentials);
}

/**
 * 時刻表キャッシュ（timetable:v1:*）を全削除する
 *
 * D1切り替え完了後に呼び、Actionsが配信したエントリと古い1時間キャッシュを
 * まとめて破棄して、以降のリクエストを新しいD1から再取得させる。
 * `pairs:v1:*`（組み合わせの学習記録）は消さない。
 */
export async function purgeTimetableCache(credentials) {
  const keys = await listKeys(`${KEY_PREFIX}:`, credentials);
  for (let i = 0; i < keys.length; i += 10000) {
    const chunk = keys.slice(i, i + 10000);
    await kvRequest('/bulk/delete', { method: 'POST', body: JSON.stringify(chunk) }, credentials);
  }
  return keys.length;
}
