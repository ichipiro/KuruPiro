/**
 * Honoミドルウェアを集約したファイル
 *
 * 含まれるミドルウェア:
 * - injectServiceFactory: ServiceFactory注入
 *
 * エラーハンドリングはここではなく index.ts の app.onError で行う。
 * Honoはハンドラー内のthrowをミドルウェアのtry/catchへ伝播させないため、
 * ミドルウェア方式のerrorHandlerは一度も実行されない死にコードだった。
 */

import type { Context, Next } from 'hono';
import type { Env } from '@/types';
import { ServiceFactory } from '@/infrastructure/di/ServiceFactory';

/**
 * ServiceFactoryをコンテキストに注入するミドルウェア
 *
 * 各リクエストごとに新しいServiceFactoryインスタンスを作成し、
 * コンテキストに保存します。
 */
export function injectServiceFactory() {
  return async (c: Context, next: Next): Promise<void> => {
    const env = c.env as Env;
    // executionCtx はテスト等の一部環境で参照できないため、取れなければ省略する
    let executionCtx: ExecutionContext | undefined;
    try {
      executionCtx = c.executionCtx;
    } catch {
      executionCtx = undefined;
    }
    const factory = new ServiceFactory(env, executionCtx);
    c.set('factory', factory);
    await next();
  };
}
