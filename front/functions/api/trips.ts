/**
 * Pages Function that proxies requests to the Worker via Service Binding
 * This allows the Worker to be private and only accessible through Pages
 */
interface Env {
  API: Fetcher;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Check if Service Binding is configured
  if (!env.API) {
    return new Response(JSON.stringify({
      error: 'Service Binding not configured',
      message: 'API binding is missing'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Forward the request to the Worker via Service Binding
    // Service Binding allows internal communication without going through the internet
    const workerRequest = new Request(`https://api/api/trips${url.search}`, {
      method: request.method,
      headers: request.headers,
    });

    const response = await env.API.fetch(workerRequest);
    return response;
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch from Worker',
      message: error instanceof Error ? error.message : 'Unknown error',
      url: url.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
