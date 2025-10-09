# Cloudflare Worker Backend

This package provides a Cloudflare Worker implementation of the KuruPiro backend API. It mirrors the FastAPI routes and can be deployed alongside the existing frontend on Cloudflare Pages or Workers.

## Prerequisites
- Node.js 18+
- Cloudflare account with Workers & KV enabled
- Wrangler CLI configured (`npx wrangler login`)

## Setup
```bash
cd cloudflare-worker
npm install
```

## Local Development
```bash
npm run dev
```

## Deployment
1. Create a KV namespace and bind it in `wrangler.toml`:
   ```bash
   npx wrangler kv:namespace create "GTFS_CACHE"
   ```
   Replace the `id` and `preview_id` in `wrangler.toml` with the values from the command.
2. Deploy the worker:
   ```bash
   npm run deploy
   ```

## Cron Refresh
The worker defines a cron trigger (`0 3 * * *`) to refresh the GTFS static data daily. Ensure cron triggers are enabled for the Worker on the Cloudflare dashboard.
