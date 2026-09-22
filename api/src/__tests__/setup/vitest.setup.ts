// 本番のCloudflare WorkersはUTCで動作するため、テストも必ずUTCで実行する。
// マシンのタイムゾーン（JST等）で実行すると、実行環境TZに依存するバグ
// （例: getWeekdayが本番でJST 0〜9時に前日の曜日を返していた問題）を
// 見逃してしまう。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).process.env.TZ = 'UTC';

// Vitest setup file
// グローバルな設定やモックをここに記述

// 将来的に必要になる可能性のあるグローバルセットアップ
// 例: グローバルなDateモック、環境変数の設定など

export {};
