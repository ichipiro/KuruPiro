import type { Context, Next } from 'hono';

/**
 * グローバルエラーハンドラーミドルウェア
 *
 * すべてのエラーをキャッチして適切なレスポンスを返します。
 */
export async function errorHandler(c: Context, next: Next): Promise<Response | void> {
  try {
    await next();
  } catch (error) {
    console.error('Unhandled error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return c.json({ error: message }, 500);
  }
}
