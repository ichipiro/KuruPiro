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

export async function onRequest(context: { request: Request; env: Env; next: () => Promise<Response> }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const branch = env.CF_PAGES_BRANCH || 'main';

  try {
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

      // Forward the request to the Worker via Service Binding
      const workerRequest = new Request(`https://api${url.pathname}${url.search}`, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      return await env.API.fetch(workerRequest);
    }

    // Preview: Use HTTP to branch-specific worker
    const sanitizedBranch = sanitizeBranchName(branch);
    const workerName = `kuru-piro-worker-${sanitizedBranch}`;

    // Cloudflare Workers URL format: {worker-name}.{account-subdomain}.workers.dev
    // Note: The account subdomain may need to be configured
    const workerUrl = `https://${workerName}.workers.dev${url.pathname}${url.search}`;

    const workerRequest = new Request(workerUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    const response = await fetch(workerRequest);
    return response;

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch from Worker',
      message: error instanceof Error ? error.message : 'Unknown error',
      branch: branch,
      url: url.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
