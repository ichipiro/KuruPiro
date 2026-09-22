#!/usr/bin/env node
/**
 * Cloudflareの各種メトリクスを日次で集計して表示する
 *
 * 使い方:
 *   node scripts/worker-metrics.mjs                     # 過去7日 / kuru-piro-worker
 *   node scripts/worker-metrics.mjs --days 30           # 過去30日
 *   node scripts/worker-metrics.mjs --worker kuru-piro-worker-my-branch --days 1
 *
 * 認証: `npx wrangler login` 済みであること（wranglerのOAuthトークンを利用）。
 * トークンが失効している場合は `npx wrangler whoami` を一度実行すると更新される。
 *
 * ## マージ前ソーク試験での使い方
 * cron・DO・ポーリング等「定常動作」を追加する変更は、ローカルでは
 * 本番のCPU制限やisolate配置を再現できない。PRを出すとブランチごとの
 * プレビューWorker（kuru-piro-worker-<ブランチ名>）が本物のCloudflare上に
 * デプロイされるので、1〜2時間放置してから
 *   node scripts/worker-metrics.mjs --worker kuru-piro-worker-<ブランチ名> --days 1
 * でエラー（exceededResourcesなど）が出ていないか確認してからマージする。
 */
import { readFileSync } from 'fs';
import { homedir } from 'os';

const ACCOUNT = '19fc1347cce15e26c18cd792616f737c';

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const DAYS = parseInt(getArg('days', '7'), 10);
const WORKER = getArg('worker', 'kuru-piro-worker');
const FROM = new Date(Date.now() - DAYS * 86400_000).toISOString().slice(0, 10);

function readToken() {
  for (const p of [
    `${homedir()}/Library/Preferences/.wrangler/config/default.toml`,
    `${homedir()}/.wrangler/config/default.toml`,
    `${homedir()}/.config/.wrangler/config/default.toml`,
  ]) {
    try {
      const m = readFileSync(p, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/);
      if (m) return m[1];
    } catch { /* try next */ }
  }
  console.error('wranglerのトークンが見つかりません。`npx wrangler login` を実行してください。');
  process.exit(1);
}
const token = readToken();

async function gql(query) {
  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  if (!data.data) {
    console.error('APIエラー（トークン失効なら `npx wrangler whoami` で更新）:');
    console.error(JSON.stringify(data.errors ?? data).slice(0, 300));
    process.exit(1);
  }
  return data.data.viewer.accounts[0];
}

const acct = (body) => `query { viewer { accounts(filter: {accountTag: "${ACCOUNT}"}) { ${body} } } }`;
const groupByDay = (rows, keyFn, valFn) => {
  const by = new Map();
  for (const r of rows) {
    const day = r.dimensions.date;
    if (!by.has(day)) by.set(day, {});
    by.get(day)[keyFn(r)] = valFn(r);
  }
  return by;
};

// 1. Worker: 日次 status別 + CPU分位点
{
  const rows = (await gql(acct(`workersInvocationsAdaptive(limit: 500, filter: {scriptName: "${WORKER}", date_geq: "${FROM}"}, orderBy: [date_ASC]) {
    dimensions { date status } sum { requests } quantiles { cpuTimeP50 cpuTimeP99 wallTimeP50 wallTimeP99 } }`))).workersInvocationsAdaptive;
  console.log(`\n=== Worker: ${WORKER}（日次）===`);
  if (rows.length === 0) console.log('  データなし（Worker名の間違い、またはトラフィックなし）');
  const by = groupByDay(rows, (r) => r.dimensions.status, (r) => r);
  for (const [day, statuses] of by) {
    const ok = statuses.success;
    const parts = Object.entries(statuses)
      .filter(([k]) => k !== 'success')
      .map(([k, r]) => `${k}=${r.sum.requests}`);
    const q = ok?.quantiles ?? {};
    console.log(
      `  ${day} success=${ok?.sum.requests ?? 0}`.padEnd(30) +
      `cpuP50=${((q.cpuTimeP50 ?? 0) / 1000).toFixed(1)}ms cpuP99=${((q.cpuTimeP99 ?? 0) / 1000).toFixed(1)}ms ` +
      (parts.length ? ` ⚠ ${parts.join(' ')}` : '')
    );
  }
}

// 2. DO: 日次 エラーのみ
{
  const rows = (await gql(acct(`durableObjectsInvocationsAdaptiveGroups(limit: 500, filter: {date_geq: "${FROM}"}, orderBy: [date_ASC]) {
    dimensions { date status } sum { requests } }`))).durableObjectsInvocationsAdaptiveGroups;
  console.log('\n=== Durable Objects（日次・アカウント全体）===');
  const by = groupByDay(rows, (r) => r.dimensions.status, (r) => r.sum.requests);
  for (const [day, statuses] of by) {
    const errs = Object.entries(statuses).filter(([k]) => k !== 'success').map(([k, v]) => `${k}=${v}`);
    console.log(`  ${day} success=${statuses.success ?? 0}` + (errs.length ? ` ⚠ ${errs.join(' ')}` : ''));
  }
}

// 3. D1: 日次 読み書き行数（無料枠: 読500万行/日・書10万行/日）
{
  const rows = (await gql(acct(`d1AnalyticsAdaptiveGroups(limit: 500, filter: {date_geq: "${FROM}"}, orderBy: [date_ASC]) {
    dimensions { date } sum { rowsRead rowsWritten } }`))).d1AnalyticsAdaptiveGroups;
  console.log('\n=== D1（日次・無料枠は読500万/書10万）===');
  for (const r of rows) {
    const { rowsRead, rowsWritten } = r.sum;
    const warn = rowsRead > 4_000_000 || rowsWritten > 90_000 ? ' ⚠ 上限接近' : '';
    console.log(`  ${r.dimensions.date} read=${rowsRead.toLocaleString()} written=${rowsWritten.toLocaleString()}${warn}`);
  }
}
