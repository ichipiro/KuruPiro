/**
 * Middleware that proxies all /api/* requests to the Worker
 *
 * Hybrid approach:
 * - Production (main branch): Uses Service Binding for internal communication
 * - Preview (other branches): Uses HTTP to branch-specific workers
 */
interface Env {
  API?: Fetcher;
  CF_PAGES_BRANCH?: string;
  WORKER_SUBDOMAIN?: string;
}

/**
 * Sanitize branch name for use in worker name
 * Converts to lowercase and replaces invalid characters with hyphens
 */
function sanitizeBranchName(branchName: string): string {
  return branchName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * 5xx・例外時のリトライ回数と間隔
 *
 * 閑散時間帯はWorkerのisolateがコールドになり、初回リクエストが
 * CPU制限超過(= 例外)になることがある。失敗した試行自体がisolateを
 * 温めるため、少し待ってからの再試行はほぼ成功する。
 */
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 150;

/**
 * エッジキャッシュに載せる秒数（バースト吸収）
 *
 * 授業の切れ目などに同一検索（大学⇔駅のデフォルトペア等）が殺到すると、
 * Workerのisolateが同時にコールドスタートしてCPU制限超過の主因になる。
 * 同一URLのGETを10秒だけコロケーションのキャッシュで受け、2発目以降を
 * Workerに届かせない。鮮度への影響は最悪+10秒（対象はGET /api/tripsのみ。
 * サイネージのPOST /api/trips/batch とdebug系は対象外）。
 *
 * Cache APIはカスタムドメイン配下でのみ機能し、pages.dev配信の
 * プレビューでは常にミスする（= 従来と同じ動作）ため、導入によるデグレはない。
 */
const EDGE_CACHE_TTL_SECONDS = 10;

function isEdgeCacheable(request: Request, url: URL): boolean {
  return request.method === 'GET' && url.pathname === '/api/trips';
}

function openEdgeCache(): Cache | undefined {
  try {
    return (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;
  } catch {
    return undefined;
  }
}

export async function onRequest(context: {
  request: Request;
  env: Env;
  waitUntil?: (promise: Promise<unknown>) => void;
  next: () => Promise<Response>;
}) {
  const { request, env } = context;
  const url = new URL(request.url);
  const branch = env.CF_PAGES_BRANCH || 'main';

  const edgeCache = isEdgeCacheable(request, url) ? openEdgeCache() : undefined;
  if (edgeCache) {
    const hit = await edgeCache.match(request.url).catch(() => undefined);
    if (hit) {
      return hit;
    }
  }

  /** 成功レスポンスをエッジキャッシュへ裏で保存しつつ、そのまま返す */
  const respond = (response: Response): Response => {
    if (edgeCache && response.ok) {
      const stored = new Response(response.clone().body, response);
      stored.headers.set('Cache-Control', `public, s-maxage=${EDGE_CACHE_TTL_SECONDS}`);
      const put = edgeCache.put(request.url, stored).catch(() => undefined);
      context.waitUntil?.(put);
    }
    return response;
  };

  // リトライで同じリクエストを再送するため、bodyは先に読み切っておく
  const body =
    request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : await request.arrayBuffer();

  const fetchFromWorker = async (): Promise<Response> => {
    // Production: Use Service Binding
    if (branch === 'main') {
      if (!env.API) {
        return new Response(JSON.stringify({
          error: 'Service Binding not configured',
          message: 'API binding is missing for production'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const workerRequest = new Request(`https://api${url.pathname}${url.search}`, {
        method: request.method,
        headers: request.headers,
        body,
      });
      return env.API.fetch(workerRequest);
    }

    // Preview: Use HTTP to branch-specific worker
    const sanitizedBranch = sanitizeBranchName(branch);
    const workerName = `kuru-piro-worker-${sanitizedBranch}`;

    // Cloudflare Workers URL format: {worker-name}.{account-subdomain}.workers.dev
    const subdomain = env.WORKER_SUBDOMAIN || 'workers';
    const workerUrl = `https://${workerName}.${subdomain}.workers.dev${url.pathname}${url.search}`;

    const workerRequest = new Request(workerUrl, {
      method: request.method,
      headers: request.headers,
      body,
    });
    return fetch(workerRequest);
  };

  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetchFromWorker();
      // 5xxはWorker側の一時的な失敗(コールドスタートのCPU超過など)の
      // 可能性が高いので再試行する。4xx以下はそのまま返す
      if (response.status < 500 || attempt === MAX_ATTEMPTS) {
        return respond(response);
      }
      lastError = new Error(`Worker returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < MAX_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }

  return new Response(JSON.stringify({
    error: 'Failed to fetch from Worker',
    message: lastError instanceof Error ? lastError.message : 'Unknown error',
    branch: branch,
    url: url.toString()
  }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}
