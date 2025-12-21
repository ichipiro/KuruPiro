import type { Context, Next } from 'hono';
import { ServiceFactory } from '@/infrastructure/di/ServiceFactory';
import type { Env } from '@/types';

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
