/**
 * Honoミドルウェアを集約したファイル
 *
 * 含まれるミドルウェア:
 * - errorHandler: エラーハンドリング
 * - injectServiceFactory: ServiceFactory注入
 */

import type { Context, Next } from 'hono';
import type { Env } from '@/types';
import { ServiceFactory } from '@/infrastructure/di/ServiceFactory';

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
/**
 * ServiceFactoryをコンテキストに注入するミドルウェア
 *
 * 各リクエストごとに新しいServiceFactoryインスタンスを作成し、
 * コンテキストに保存します。
 */
export function injectServiceFactory() {
  return async (c: Context, next: Next): Promise<void> => {
    const env = c.env as Env;
    const factory = new ServiceFactory(env);
    c.set('factory', factory);
    await next();
  };
}
