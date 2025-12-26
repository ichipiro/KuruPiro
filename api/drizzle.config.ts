import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: '19fc1347cce15e26c18cd792616f737c',
    databaseId: '072a7020-ff60-4958-8def-48017c0df486',
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
});
