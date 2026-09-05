/**
 * GTFS(zip) から D1 投入用のSQLを生成する
 *
 * 本番用（build-and-upload-d1.mjs）とローカル用（build-and-upload-local.mjs）で
 * スキーマ定義がずれないよう、SQL生成はこのモジュールに集約する。
 *
 * ## 本番（無料プラン）の書き込み予算について
 * D1 の "rows written" はインデックスへの書き込みも計上され、無料プランでは
 * 1日10万行を超えるとその日のクエリ全体がエラーになる。GTFS全体の入れ替えは
 * インデックス込みで約80万行の書き込みになるため、1日では絶対に完走できない。
 *
 * そのため本番はステージング方式で数日に分けて取り込む:
 *
 * 1. ステージング表 `gtfs_*_new` を索引付きで作る（generateStagedImport.setup）
 *    索引を先に張るのは、索引の書き込みコストを1行のINSERTに畳み込んで
 *    日次予算で分割制御できるようにするため。後からの CREATE INDEX は
 *    全行分の書き込みが1文で発生し、予算超過で永遠に完走できない恐れがある。
 * 2. `INSERT OR IGNORE` ＋明示ID で投入（generateStagedImport.inserts）
 *    冪等なので、途中失敗してもバッチ単位で安全に再実行できる。
 * 3. 全行入ったら、旧表を `_old` へ退避 → `_new` を本名へ昇格（buildCutoverStatements）
 *    リネームはメタデータ操作なので一瞬で、稼働中の表は完成まで一切触らない。
 * 4. ANALYZE・ETag記録（buildFinalizeStatements）と `_old` の削除（buildDropOldStatements）
 *    DROPが高くついて失敗しても新表は稼働済みで、次回のsetupで掃除される。
 *
 * ローカルは制限がないので generateImportStatements で一括投入する。
 *
 * src/db/schema.ts と drizzle/ のマイグレーションと同じ列定義を保つこと。
 * （本番の索引名には取り込みごとのサフィックスが付くが、SQLiteのプランナは
 * 索引名を参照しないため動作に影響はない）
 */

import { strFromU8 } from 'fflate';

const WEEKDAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/**
 * 1つの INSERT 文にまとめる行数
 *
 * 大きくするほどD1へのリクエスト数は減るが、1文あたりのSQLが長くなる。
 */
const ROWS_PER_INSERT = 200;

/**
 * GTFSの実データを入れるテーブル名（外部キーの参照元 → 参照先の順）
 *
 * DROP はこの順、CREATE/INSERT は逆順で行う。
 */
export const GTFS_TABLES = [
  'gtfs_stop_times',
  'gtfs_trips',
  'gtfs_routes',
  'gtfs_calendar',
  'gtfs_stops',
];

/**
 * 1行のINSERTが発生させる書き込み行数の見積もり（本体 + 索引 + 暗黙のPK索引）
 *
 * text型のPRIMARY KEYはSQLiteが内部でUNIQUE索引を持つため+1している。
 * あくまで送信前の予算チェック用の概算で、実測はレスポンスの
 * meta.rows_written を使う。
 */
export const WRITE_MULTIPLIERS = {
  gtfs_trips: 4, // 本体 + idx_service_id + idx_route_id + PK索引
  gtfs_stop_times: 3, // 本体 + idx_stop_arrival + idx_trip_stop（PKはrowidなので加算なし）
  gtfs_routes: 2,
  gtfs_calendar: 2,
  gtfs_stops: 2,
};

const METADATA_TABLE_STATEMENT = `CREATE TABLE IF NOT EXISTS gtfs_metadata (key text PRIMARY KEY NOT NULL, value text NOT NULL, updated_at integer NOT NULL);`;

/**
 * テーブル定義（suffixを付けるとステージング表になる）
 */
function createTableStatements(suffix = '') {
  return [
    `CREATE TABLE gtfs_trips${suffix} (trip_id text PRIMARY KEY NOT NULL, route_id text NOT NULL, service_id text NOT NULL, trip_headsign text, direction_id integer);`,
    `CREATE TABLE gtfs_stop_times${suffix} (id integer PRIMARY KEY NOT NULL, trip_id text NOT NULL, stop_id text NOT NULL, stop_sequence integer NOT NULL, arrival_time text NOT NULL, departure_time text NOT NULL, FOREIGN KEY (trip_id) REFERENCES gtfs_trips${suffix}(trip_id) ON UPDATE no action ON DELETE no action);`,
    `CREATE TABLE gtfs_routes${suffix} (route_id text PRIMARY KEY NOT NULL, route_short_name text NOT NULL, destination_stop text);`,
    `CREATE TABLE gtfs_calendar${suffix} (service_id text PRIMARY KEY NOT NULL, start_date text NOT NULL, end_date text NOT NULL, monday integer NOT NULL, tuesday integer NOT NULL, wednesday integer NOT NULL, thursday integer NOT NULL, friday integer NOT NULL, saturday integer NOT NULL, sunday integer NOT NULL);`,
    `CREATE TABLE gtfs_stops${suffix} (stop_id text PRIMARY KEY NOT NULL, stop_name text NOT NULL);`,
  ];
}

/**
 * 索引定義
 *
 * @param tableSuffix 対象テーブルのサフィックス（ステージング表なら '_new'）
 * @param nameSuffix 索引名のサフィックス。索引名はDB全体で一意である必要が
 *   あるため、本番では取り込みごとのサフィックスを付けて衝突を避ける。
 */
function createIndexStatements(tableSuffix = '', nameSuffix = '') {
  return [
    `CREATE INDEX idx_trips_service_id${nameSuffix} ON gtfs_trips${tableSuffix} (service_id);`,
    `CREATE INDEX idx_trips_route_id${nameSuffix} ON gtfs_trips${tableSuffix} (route_id);`,
    `CREATE INDEX idx_stop_times_stop_arrival${nameSuffix} ON gtfs_stop_times${tableSuffix} (stop_id, arrival_time, trip_id, stop_sequence);`,
    `CREATE INDEX idx_stop_times_trip_stop${nameSuffix} ON gtfs_stop_times${tableSuffix} (trip_id, stop_id, stop_sequence);`,
  ];
}

export function parseCSV(content) {
  const rows = [];
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  if (lines.length === 0) return rows;

  const header = splitCsvLine(lines[0]);
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cols = splitCsvLine(line);
    const row = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = cols[j] ?? '';
    }
    rows.push(row);
  }
  return rows;
}

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === ',') {
        result.push(current);
        current = '';
      } else if (char === '"') {
        inQuotes = true;
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

function toInt(value, fallback = 0) {
  if (!value) return fallback;
  const num = parseInt(value, 10);
  return isNaN(num) ? fallback : num;
}

function normalizeStopId(stopId) {
  return stopId.replace(/ /g, '_');
}

export function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

/**
 * GTFS(zip)の展開済みファイル群を構造化データにパースする
 *
 * zipの内容だけから決まる決定的な出力（日をまたいだ再開時に同じ列が
 * 再現できることが前提）。stop_times には冪等な再実行のため明示IDを振る。
 *
 * @param {Record<string, Uint8Array>} files unzipSync の戻り値
 */
export function parseGtfsFiles(files) {
  const text = (filename) => {
    const file = files[filename];
    if (!file) throw new Error(`GTFS file missing: ${filename}`);
    return strFromU8(file);
  };

  console.log('Parsing GTFS files...');
  const stopTimesRows = parseCSV(text('stop_times.txt'));
  const tripsRows = parseCSV(text('trips.txt'));
  const calendarRows = parseCSV(text('calendar.txt'));
  const routesRows = parseCSV(text('routes.txt'));
  const routesJpRows = parseCSV(text('routes_jp.txt'));
  const stopsRows = parseCSV(text('stops.txt'));

  const trips = [];
  for (const row of tripsRows) {
    const tripId = row['trip_id'];
    if (!tripId) continue;
    trips.push({
      tripId,
      routeId: row['route_id'] ?? '',
      serviceId: row['service_id'] ?? '',
      tripHeadsign: row['trip_headsign'] || null,
      directionId: row['direction_id'] ? toInt(row['direction_id']) : null,
    });
  }

  const stopTimes = [];
  let stopTimeId = 0;
  for (const row of stopTimesRows) {
    const tripId = row['trip_id'];
    if (!tripId) continue;
    const arrivalTime = row['arrival_time'] ?? '00:00:00';
    stopTimeId++;
    stopTimes.push({
      id: stopTimeId,
      tripId,
      stopId: normalizeStopId(row['stop_id'] ?? ''),
      stopSequence: toInt(row['stop_sequence']),
      arrivalTime,
      departureTime: row['departure_time'] ?? arrivalTime,
    });
  }

  const stops = [];
  for (const row of stopsRows) {
    const stopId = normalizeStopId(row['stop_id'] ?? '');
    if (!stopId) continue;
    stops.push({ stopId, stopName: row['stop_name'] ?? '' });
  }

  // routes（routes_jp.txt の destination_stop をマージする）
  const routesMap = {};
  for (const row of routesRows) {
    const routeId = row['route_id'];
    if (!routeId) continue;
    routesMap[routeId] = {
      routeId,
      routeShortName: row['route_short_name'] ?? '',
      destinationStop: null,
    };
  }
  for (const row of routesJpRows) {
    const routeId = row['route_id'];
    if (!routeId) continue;
    if (routesMap[routeId]) {
      routesMap[routeId].destinationStop = row['destination_stop'] || null;
    }
  }
  const routes = Object.values(routesMap);

  const calendar = [];
  for (const row of calendarRows) {
    const serviceId = row['service_id'];
    if (!serviceId) continue;
    calendar.push({
      serviceId,
      startDate: row['start_date'] ?? '',
      endDate: row['end_date'] ?? '',
      // 0=月曜〜6=日曜（APIの weekday と同じ並び）
      weekdays: WEEKDAY_KEYS.map((key) => (row[key] === '1' ? 1 : 0)),
    });
  }

  return { trips, stopTimes, stops, routes, calendar };
}

/**
 * 構造化データをテーブルごとの値タプル列に変換する
 *
 * @param {ReturnType<typeof parseGtfsFiles>} gtfs
 * @returns {{table: string, columns: string, values: string[]}[]}
 *   外部キーを満たす投入順（trips → stop_times → …）
 */
export function buildTableData(gtfs) {
  const tripValues = gtfs.trips.map(
    (t) =>
      `(${escapeSQL(t.tripId)}, ${escapeSQL(t.routeId)}, ${escapeSQL(t.serviceId)}, ${escapeSQL(t.tripHeadsign)}, ${t.directionId === null ? 'NULL' : t.directionId})`
  );

  const stopTimeValues = gtfs.stopTimes.map(
    (st) =>
      `(${st.id}, ${escapeSQL(st.tripId)}, ${escapeSQL(st.stopId)}, ${st.stopSequence}, ${escapeSQL(st.arrivalTime)}, ${escapeSQL(st.departureTime)})`
  );

  const stopValues = gtfs.stops.map(
    (st) => `(${escapeSQL(st.stopId)}, ${escapeSQL(st.stopName)})`
  );

  const routeValues = gtfs.routes.map(
    (route) =>
      `(${escapeSQL(route.routeId)}, ${escapeSQL(route.routeShortName)}, ${escapeSQL(route.destinationStop)})`
  );

  const calendarValues = gtfs.calendar.map(
    (c) =>
      `(${escapeSQL(c.serviceId)}, ${escapeSQL(c.startDate)}, ${escapeSQL(c.endDate)}, ${c.weekdays.join(', ')})`
  );

  return [
    { table: 'gtfs_trips', columns: 'trip_id, route_id, service_id, trip_headsign, direction_id', values: tripValues },
    { table: 'gtfs_stop_times', columns: 'id, trip_id, stop_id, stop_sequence, arrival_time, departure_time', values: stopTimeValues },
    { table: 'gtfs_stops', columns: 'stop_id, stop_name', values: stopValues },
    { table: 'gtfs_routes', columns: 'route_id, route_short_name, destination_stop', values: routeValues },
    { table: 'gtfs_calendar', columns: 'service_id, start_date, end_date, monday, tuesday, wednesday, thursday, friday, saturday, sunday', values: calendarValues },
  ];
}

/**
 * 行の値リストを複数行 INSERT にまとめる
 */
function buildInserts(table, columns, valueTuples, { orIgnore = false } = {}) {
  const verb = orIgnore ? 'INSERT OR IGNORE INTO' : 'INSERT INTO';
  const statements = [];
  for (let i = 0; i < valueTuples.length; i += ROWS_PER_INSERT) {
    const chunk = valueTuples.slice(i, i + ROWS_PER_INSERT);
    statements.push({
      sql: `${verb} ${table} (${columns}) VALUES ${chunk.join(', ')};`,
      rows: chunk.length,
    });
  }
  return statements;
}

/**
 * ローカル開発用: 一括取り込みSQLを生成する（制限がない環境向け）
 *
 * DROP → CREATE → INSERT → CREATE INDEX の順で1回で流す。
 *
 * @param {Record<string, Uint8Array>} files unzipSync の戻り値
 * @returns {string[]} 実行順に並んだSQL文の配列（1要素1文）
 */
export function generateImportStatements(files) {
  const tableData = buildTableData(parseGtfsFiles(files));
  const statements = [];

  // メタデータはETag保持のため作り直さない（存在しなければ作る）
  statements.push(METADATA_TABLE_STATEMENT);

  for (const table of GTFS_TABLES) {
    statements.push(`DROP TABLE IF EXISTS ${table};`);
  }
  statements.push(...createTableStatements());

  for (const { table, columns, values } of tableData) {
    console.log(`Generating ${table} inserts...`);
    statements.push(...buildInserts(table, columns, values).map((s) => s.sql));
  }

  statements.push(...createIndexStatements());
  // クエリプランナ用の統計を更新する（sqlite_stat1 は数十行程度）
  statements.push('ANALYZE;');

  statements.push(
    `INSERT INTO gtfs_metadata (key, value, updated_at) VALUES ('last_updated', '${new Date().toISOString()}', ${Date.now()}) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`
  );

  return statements;
}

/**
 * 本番用: ステージング方式の取り込みSQLを生成する
 *
 * @param {ReturnType<typeof parseGtfsFiles>} gtfs パース済みGTFSデータ
 * @param {string} suffix この取り込み専用のサフィックス（索引名の衝突回避用）
 * @returns {{
 *   setup: string[],
 *   inserts: {sql: string, rows: number, weight: number}[],
 * }} setupは初回のみ実行。insertsは冪等で、weightは書き込み行数の概算。
 */
export function generateStagedImport(gtfs, suffix) {
  const tableData = buildTableData(gtfs);

  const setup = [METADATA_TABLE_STATEMENT];
  // 前回の残骸（未完のステージング・削除に失敗した退避表）を掃除する
  for (const table of GTFS_TABLES) {
    setup.push(`DROP TABLE IF EXISTS ${table}_new;`);
    setup.push(`DROP TABLE IF EXISTS ${table}_old;`);
  }
  setup.push(...createTableStatements('_new'));
  // 空の表への索引作成はほぼタダ。ここで張っておくことで、
  // 以後の書き込みコストがすべてINSERT側に載り、日次予算で制御できる。
  setup.push(...createIndexStatements('_new', `_${suffix}`));

  const inserts = [];
  for (const { table, columns, values } of tableData) {
    const multiplier = WRITE_MULTIPLIERS[table] ?? 2;
    for (const s of buildInserts(`${table}_new`, columns, values, { orIgnore: true })) {
      inserts.push({ sql: s.sql, rows: s.rows, weight: s.rows * multiplier });
    }
  }

  return { setup, inserts };
}

/**
 * 本番用: ステージング表を本番に昇格させるSQLを生成する
 *
 * テーブルごとに「旧表を `_old` へ退避 → `_new` を本名にリネーム」する。
 * リネームはメタデータ操作なので行単位の書き込みが発生せず一瞬で終わる。
 * 高くつく可能性のあるDROPは buildDropOldStatements に分離してあり、
 * そちらが失敗しても新しいデータは稼働済みで利用者影響がない。
 *
 * 前回の実行が途中で落ちていても安全に再実行できるよう、existingTables を
 * 見てテーブル単位で判断する: `_new` が無いテーブルは昇格済みとしてスキップし、
 * 旧表が無いテーブル（初回投入など）は退避をスキップする。
 * （リネームで他テーブルの外部キー参照はSQLiteが自動で追随させる）
 *
 * @param {Set<string>} existingTables 現在DBに存在するテーブル名の集合
 */
export function buildCutoverStatements(existingTables) {
  const statements = [];
  for (const table of GTFS_TABLES) {
    if (!existingTables.has(`${table}_new`)) continue;
    if (existingTables.has(table)) {
      statements.push(`ALTER TABLE ${table} RENAME TO ${table}_old;`);
    }
    statements.push(`ALTER TABLE ${table}_new RENAME TO ${table};`);
  }
  return statements;
}

/**
 * 本番用: 切り替え直後の完了処理SQLを生成する（軽量・必須）
 *
 * ANALYZE（統計の更新、書き込みは数十行）とメタデータの更新のみ。
 * 旧表のDROPは、万一コスト計上が高かった場合に完了記録まで道連れに
 * しないよう buildDropOldStatements に分離してある。
 *
 * @param {{etag: string}} params 取り込んだフィードのETag
 */
export function buildFinalizeStatements({ etag }) {
  return [
    'ANALYZE;',
    `INSERT INTO gtfs_metadata (key, value, updated_at) VALUES ('gtfs_etag', ${escapeSQL(etag)}, ${Date.now()}) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`,
    `INSERT INTO gtfs_metadata (key, value, updated_at) VALUES ('last_updated', '${new Date().toISOString()}', ${Date.now()}) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`,
    `DELETE FROM gtfs_metadata WHERE key = 'import_state';`,
  ];
}

/**
 * 本番用: 退避した旧表を削除するSQLを生成する（ベストエフォート）
 *
 * 失敗しても次回取り込みのsetupで再度掃除されるため、1文ずつ実行して
 * 失敗は警告に留めればよい。stop_times → trips の順（外部キーの参照元から）。
 */
export function buildDropOldStatements() {
  return GTFS_TABLES.map((table) => `DROP TABLE IF EXISTS ${table}_old;`);
}
