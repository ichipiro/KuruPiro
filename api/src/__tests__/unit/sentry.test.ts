import { describe, it, expect } from 'vitest';
import { sentryOptions } from '@/sentry';
import type { Env } from '@/types';

const makeEnv = (overrides: Partial<Record<keyof Env, string>> = {}): Env =>
  ({ ...overrides }) as unknown as Env;

describe('sentryOptions', () => {
  it('環境変数からDSN・環境・サンプルレートを組み立てる', () => {
    const options = sentryOptions(
      makeEnv({
        SENTRY_DSN: 'https://key@example.ingest.sentry.io/1',
        SENTRY_ENVIRONMENT: 'preview',
        SENTRY_TRACES_SAMPLE_RATE: '1.0',
      })
    );

    expect(options.dsn).toBe('https://key@example.ingest.sentry.io/1');
    expect(options.environment).toBe('preview');
    expect(options.tracesSampleRate).toBe(1.0);
  });

  it('未設定時はDSNなし(無効)・production・既定レートになる', () => {
    const options = sentryOptions(makeEnv());

    expect(options.dsn).toBeUndefined();
    expect(options.environment).toBe('production');
    expect(options.tracesSampleRate).toBe(0.05);
  });

  it.each(['abc', '-0.1', '1.5', ''])('不正なサンプルレート(%s)は既定値に落とす', (raw) => {
    const options = sentryOptions(makeEnv({ SENTRY_TRACES_SAMPLE_RATE: raw }));

    expect(options.tracesSampleRate).toBe(0.05);
  });
});
