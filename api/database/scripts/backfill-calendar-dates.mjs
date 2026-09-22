#!/usr/bin/env node
/**
 * gtfs_calendar_dates テーブルを既存のD1に追加投入するSQLを生成する
 *
 * calendar_dates（約7,000行 ≒ 書き込み14,000行）だけのために約80万行の
 * フル再取り込みを回すのは無駄なので、この表だけを冪等に投入する。
 *
 * 使い方（Workerのデプロイ前に実行すること）:
 *   pnpm run db:backfill:calendar-dates:prod   # 本番D1
 *   pnpm run db:backfill:calendar-dates:local  # ローカルD1
 *
 * 以後のGTFS取り込み（build-and-upload-d1.mjs / build-and-upload-local.mjs）
 * には gtfs_calendar_dates が含まれるため、このスクリプトは移行時の一度だけ使う。
 */
import { unzipSync } from 'fflate';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parseGtfsFiles, escapeSQL } from './gtfs-sql.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GTFS_URL = process.env.GTFS_STATIC_URL || 'https://ajt-mobusta-gtfs.mcapps.jp/static/8/current_data.zip';

const response = await fetch(GTFS_URL);
if (!response.ok) throw new Error(`Failed to download GTFS: ${response.status}`);
const files = unzipSync(new Uint8Array(await response.arrayBuffer()));
const gtfs = parseGtfsFiles(files);

const statements = [
  `CREATE TABLE IF NOT EXISTS gtfs_calendar_dates (service_id text NOT NULL, date text NOT NULL, exception_type integer NOT NULL, PRIMARY KEY(service_id, date));`,
];
const ROWS_PER_INSERT = 200;
for (let i = 0; i < gtfs.calendarDates.length; i += ROWS_PER_INSERT) {
  const chunk = gtfs.calendarDates.slice(i, i + ROWS_PER_INSERT);
  statements.push(
    `INSERT OR REPLACE INTO gtfs_calendar_dates (service_id, date, exception_type) VALUES ${chunk
      .map((cd) => `(${escapeSQL(cd.serviceId)}, ${escapeSQL(cd.date)}, ${cd.exceptionType})`)
      .join(', ')};`
  );
}

const out = join(__dirname, 'temp-calendar-dates.sql');
writeFileSync(out, statements.join('\n'));
console.log(`Generated ${out}: ${gtfs.calendarDates.length} rows (${statements.length} statements)`);
console.log(`書き込み見積もり: 約${gtfs.calendarDates.length * 2}行（無料枠10万行/日の範囲内）`);
