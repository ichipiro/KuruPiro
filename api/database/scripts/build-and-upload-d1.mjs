#!/usr/bin/env node
/**
 * Pre-process GTFS data and upload to Cloudflare D1
 * This runs in GitHub Actions (daily)
 *
 * ## 無料プランの書き込み上限との付き合い方
 * D1無料プランは書き込み10万行/日のハードリミットで、超えるとその日は
 * クエリ全体がエラーになる。GTFS全体の入れ替えは索引込みで約80万行の
 * 書き込みになるため、1日では完走できない。
 *
 * そこでこのスクリプトは:
 * - ステージング表（gtfs_*_new）へ、日次予算（WRITE_BUDGET）の範囲内だけ投入する
 * - 進捗を gtfs_metadata の import_state に保存し、翌日のワークフロー実行で再開する
 * - 全行入った日にリネームで一括切り替えする（稼働中の表は完成まで無傷）
 * - 書き込み量はレスポンスの meta.rows_written の実測値で管理する
 *
 * フィードが変わらない日はETag一致で何も書かない（従来どおり）。
 */
import { unzipSync } from 'fflate';
import { randomBytes } from 'crypto';
import {
  parseGtfsFiles,
  generateStagedImport,
  buildCutoverStatements,
  buildFinalizeStatements,
  buildDropOldStatements,
  escapeSQL,
} from './gtfs-sql.mjs';
import {
  buildTimetables,
  listRegisteredPairs,
  pushTimetablesToKV,
  purgeTimetableCache,
} from './timetable-kv.mjs';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '19fc1347cce15e26c18cd792616f737c';
const DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID || '072a7020-ff60-4958-8def-48017c0df486';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const GTFS_URL = process.env.GTFS_STATIC_URL || 'https://ajt-mobusta-gtfs.mcapps.jp/static/8/current_data.zip';
/** WorkerのGTFS_CACHEバインディングと同じKV名前空間（時刻表の即時配信先） */
const KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID || '49a3e4dd915c4ba08ba21c20cdf0793c';
/** ETagが変わっていなくても強制的に取り込み直す（スキーマ変更を反映したいときに使う） */
const FORCE_UPDATE = process.env.FORCE_UPDATE === 'true';

if (!API_TOKEN) {
  console.error('Error: CLOUDFLARE_API_TOKEN environment variable required');
  process.exit(1);
}

/**
 * 1日に使ってよい書き込み行数（無料プランの10万行に対する安全マージン込み）
 */
const WRITE_BUDGET = 90_000;

/**
 * 切り替え（リネーム＋ANALYZE＋メタデータ）に取っておく予備
 */
const CUTOVER_RESERVE = 5_000;

/** 1リクエストに詰め込むSQLの上限サイズ（バイト） */
const MAX_BATCH_BYTES = 1024 * 1024;
/** 1リクエストに詰め込む文の上限数 */
const MAX_BATCH_STATEMENTS = 5000;

/**
 * D1のREST APIでSQLを実行する
 */
async function runQuery(sql) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`D1 request failed: ${response.status} ${error}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(`D1 query failed: ${JSON.stringify(result.errors)}`);
  }

  return result;
}

/**
 * レスポンスから実際に書き込まれた行数を合算する
 */
function sumRowsWritten(result) {
  let total = 0;
  for (const entry of result.result ?? []) {
    total += entry?.meta?.rows_written ?? 0;
  }
  return total;
}

async function getMetadataValue(key) {
  try {
    const result = await runQuery(
      `SELECT value FROM gtfs_metadata WHERE key = ${escapeSQL(key)}`
    );
    const rows = result.result?.[0]?.results;
    return rows && rows.length > 0 ? rows[0].value : null;
  } catch (error) {
    // テーブル未作成（初回）など
    console.log(`Could not fetch metadata '${key}':`, error.message);
    return null;
  }
}

async function getImportState() {
  const value = await getMetadataValue('import_state');
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function saveImportState(state) {
  await runQuery(
    `INSERT INTO gtfs_metadata (key, value, updated_at) VALUES ('import_state', ${escapeSQL(JSON.stringify(state))}, ${Date.now()}) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`
  );
}

/**
 * DBに存在するテーブル名の集合を取得する
 */
async function getExistingTables() {
  const result = await runQuery(
    `SELECT name FROM sqlite_master WHERE type = 'table'`
  );
  const rows = result.result?.[0]?.results ?? [];
  return new Set(rows.map((row) => row.name));
}

/** UTC基準の日付文字列（予算のリセットは 00:00 UTC） */
function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * 文の配列をサイズ上限でバッチにまとめる
 */
function chunkStatements(statements, getSql) {
  const batches = [];
  let current = [];
  let currentBytes = 0;

  for (const statement of statements) {
    const size = Buffer.byteLength(getSql(statement), 'utf8') + 1;
    const wouldOverflow =
      current.length > 0 &&
      (currentBytes + size > MAX_BATCH_BYTES || current.length >= MAX_BATCH_STATEMENTS);

    if (wouldOverflow) {
      batches.push(current);
      current = [];
      currentBytes = 0;
    }

    current.push(statement);
    currentBytes += size;
  }
  if (current.length > 0) {
    batches.push(current);
  }
  return batches;
}

async function downloadFeed() {
  console.log('Downloading GTFS data...');
  const response = await fetch(GTFS_URL);
  if (!response.ok) {
    throw new Error(`Failed to download GTFS: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  console.log(`Downloaded ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
  console.log('Unzipping...');
  const files = unzipSync(new Uint8Array(arrayBuffer));
  console.log(`Extracted ${Object.keys(files).length} files`);
  return files;
}

/**
 * 使用中の組み合わせの新しい時刻表をKVへ即時配信する
 *
 * D1の分割取り込み完了（数日）を待たずにダイヤ改正を反映させるための処理。
 * 失敗しても取り込み自体は続行し、翌日の実行で再試行される。
 */
async function pushTimetables(gtfs) {
  const credentials = { accountId: ACCOUNT_ID, namespaceId: KV_NAMESPACE_ID, apiToken: API_TOKEN };
  try {
    const pairs = await listRegisteredPairs(credentials);
    if (pairs.length === 0) {
      console.log('No registered stop pairs found in KV. Skipping timetable push.');
      return;
    }
    const entries = buildTimetables(gtfs, pairs);
    await pushTimetablesToKV(entries, credentials);
    console.log(`✓ Pushed ${entries.length} timetable entries to KV for ${pairs.length} pairs.`);
  } catch (error) {
    console.warn('Warning: KV timetable push failed (will retry on next run):', error.message);
  }
}

/**
 * 切り替え完了後、時刻表キャッシュを破棄して新しいD1から再取得させる
 */
async function purgeTimetables() {
  const credentials = { accountId: ACCOUNT_ID, namespaceId: KV_NAMESPACE_ID, apiToken: API_TOKEN };
  try {
    const purged = await purgeTimetableCache(credentials);
    console.log(`✓ Purged ${purged} timetable cache entries from KV.`);
  } catch (error) {
    console.warn('Warning: KV timetable purge failed (entries expire on their own):', error.message);
  }
}

async function main() {
  // Step 1: Check ETag without downloading
  console.log('Checking GTFS data ETag from:', GTFS_URL);
  const headResponse = await fetch(GTFS_URL, { method: 'HEAD' });
  if (!headResponse.ok) {
    throw new Error(`Failed to check GTFS data: ${headResponse.status}`);
  }

  const newETag = headResponse.headers.get('etag')?.replace(/"/g, '');
  console.log(`Remote ETag: ${newETag}`);
  console.log(`Last Modified: ${headResponse.headers.get('last-modified')}`);

  const currentETag = await getMetadataValue('gtfs_etag');
  console.log(`Current ETag in D1: ${currentETag || 'none'}`);

  let state = await getImportState();

  // 進行中の取り込みがフィード更新で古くなっていたら破棄してやり直す
  if (state && state.etag !== newETag) {
    console.log('In-progress import is for an outdated feed. Restarting.');
    state = null;
  }

  if (!state) {
    // 取り込みは索引込みで数十万行の書き込みになるため、内容が変わって
    // いなければ必ずスキップする
    if (currentETag === newETag && !FORCE_UPDATE) {
      console.log('✓ GTFS data unchanged (ETag match). Skipping update.');
      return;
    }
    if (FORCE_UPDATE) {
      console.log('FORCE_UPDATE=true: re-importing regardless of ETag');
    }
  } else {
    console.log(`Resuming import: phase=${state.phase}, next=${state.next}`);
  }

  const files = await downloadFeed();

  // 予算残の計算（実測値ベース、UTCの日付が変わればリセット）
  let writtenToday = state && state.writtenDate === todayUTC() ? state.writtenToday : 0;
  const budgetLeft = () => WRITE_BUDGET - writtenToday;

  const gtfs = parseGtfsFiles(files);

  // Step 2: 使用中の組み合わせの時刻表をKVへ即時配信する
  // （D1の分割取り込みは数日かかるが、ダイヤ改正はこの時点で反映される。
  //   取り込み期間中に使われ始めた組み合わせを拾うため、進行中は毎回配信する）
  if (!state || state.phase === 'inserts') {
    await pushTimetables(gtfs);
  }

  // Step 3: ステージングの準備（初回のみ）
  const suffix = state?.suffix ?? randomBytes(4).toString('hex');
  const { setup, inserts } = generateStagedImport(gtfs, suffix);
  console.log(`Import plan: ${inserts.length} insert statements`);

  if (!state) {
    console.log('Setting up staging tables...');
    const setupResult = await runQuery(setup.join('\n'));
    writtenToday += sumRowsWritten(setupResult);

    state = {
      etag: newETag,
      suffix,
      phase: 'inserts',
      next: 0,
      writtenDate: todayUTC(),
      writtenToday,
    };
    await saveImportState(state);
  }

  // Step 4: 予算内でステージング表に投入する
  if (state.phase === 'inserts') {
    const remaining = inserts.slice(state.next);
    const batches = chunkStatements(remaining, (s) => s.sql);
    let batchIndex = 0;

    for (const batch of batches) {
      const batchWeight = batch.reduce((sum, s) => sum + s.weight, 0);
      if (batchWeight > budgetLeft()) {
        state.writtenDate = todayUTC();
        state.writtenToday = writtenToday;
        await saveImportState(state);
        console.log(
          `✋ Daily write budget reached (${writtenToday}/${WRITE_BUDGET} rows). ` +
            `Progress: ${state.next}/${inserts.length} statements. Will resume on the next run.`
        );
        return;
      }

      batchIndex++;
      console.log(
        `Uploading insert batch ${batchIndex}/${batches.length} (${batch.length} statements, ~${batchWeight} writes)...`
      );
      const result = await runQuery(batch.map((s) => s.sql).join('\n'));
      const measured = sumRowsWritten(result);
      // 冪等な再実行時は実測が小さくなる。概算より実測を信じる
      writtenToday += measured > 0 ? measured : batchWeight;
      console.log(`  measured rows_written: ${measured}`);

      state.next += batch.length;
      state.writtenDate = todayUTC();
      state.writtenToday = writtenToday;
      await saveImportState(state);
    }

    state.phase = 'cutover';
    await saveImportState(state);
  }

  // Step 5: 切り替え（リネーム）＋完了処理
  if (state.phase === 'cutover') {
    if (budgetLeft() < CUTOVER_RESERVE) {
      console.log(
        `✋ Not enough budget left for cutover (${writtenToday}/${WRITE_BUDGET}). Will cut over on the next run.`
      );
      await saveImportState({ ...state, writtenDate: todayUTC(), writtenToday });
      return;
    }

    const existing = await getExistingTables();
    // 前回の実行が途中で落ちていても、テーブル単位で残りのリネームだけが生成される
    const cutover = buildCutoverStatements(existing);
    if (cutover.length > 0) {
      console.log('Cutting over: renaming staging tables into place...');
      await runQuery(cutover.join('\n'));
    } else {
      console.log('Staging tables already promoted. Finalizing only.');
    }

    console.log('Finalizing (ANALYZE + metadata)...');
    await runQuery(buildFinalizeStatements({ etag: newETag }).join('\n'));

    // 旧表の削除はベストエフォート（失敗しても次回のsetupで掃除される）
    for (const statement of buildDropOldStatements()) {
      try {
        await runQuery(statement);
      } catch (error) {
        console.warn(`Warning: cleanup failed (${statement}):`, error.message);
      }
    }

    // KVの時刻表キャッシュ（Actionsが配信したものと1時間キャッシュの両方）を
    // 破棄し、以降のリクエストを新しいD1から再取得させる
    await purgeTimetables();

    console.log('✓ Successfully uploaded GTFS data to D1!');
    console.log(`✓ Updated ETag to: ${newETag}`);
  }
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
