import type { CloudflareOptions } from '@sentry/cloudflare';
import type { Env } from '@/types';

/** SENTRY_TRACES_SAMPLE_RATE が未設定・不正値のときの既定値（本番想定の控えめな値） */
const DEFAULT_TRACES_SAMPLE_RATE = 0.05;

/**
 * Worker本体とDurable Objectで共有するSentry初期化オプション
 *
 * SENTRY_DSN未設定（ローカル開発・テスト）ではSDKは何も送信しない。
 * サンプルレートは環境変数で上書き可能（プレビューは1.0、本番は低率）。
 */
export function sentryOptions(env: Env): CloudflareOptions {
  return {
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT ?? 'production',
    tracesSampleRate: parseTracesSampleRate(env.SENTRY_TRACES_SAMPLE_RATE),
  };
}

function parseTracesSampleRate(raw: string | undefined): number {
  // Number('')は0になるため、空文字は「未設定」として既定値に落とす
  if (raw === undefined || raw.trim() === '') {
    return DEFAULT_TRACES_SAMPLE_RATE;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return DEFAULT_TRACES_SAMPLE_RATE;
  }
  return parsed;
}
