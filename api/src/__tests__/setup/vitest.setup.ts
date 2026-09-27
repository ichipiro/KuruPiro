// 本番のCloudflare WorkersはUTCで動作するため、テストも必ずUTCで実行する。
// マシンのタイムゾーン（JST等）で実行すると、実行環境TZに依存するバグ
// （例: getWeekdayが本番でJST 0〜9時に前日の曜日を返していた問題）を
// 見逃してしまう。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).process.env.TZ = 'UTC';

import { vi } from "vitest";

// Stub Worker Cache API (not available in Node environment)
vi.stubGlobal("caches", {
  default: {
    match: vi.fn().mockResolvedValue(undefined),
    put: vi.fn().mockResolvedValue(undefined),
  },
});
