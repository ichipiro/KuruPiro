# KuruPiro 開発環境セットアップ

このドキュメントでは、KuruPiroプロジェクトの開発環境をセットアップする手順を説明します。

## 前提条件

以下のツールがインストールされていることを確認してください：

- **Node.js**: v18以上
- **pnpm**: 最新版（推奨）または npm/yarn
- **Cloudflare アカウント**: デプロイ時に必要
- **Wrangler CLI**: Cloudflare Workers の開発ツール

---

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd KuruPiro/api
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. ローカルデータベースのセットアップ

D1データベースのマイグレーションを実行します：

```bash
# ローカル環境用のマイグレーション
pnpm db:migrate:local
```

または、最新のスキーマを直接プッシュ：

```bash
pnpm db:push:local
```

### 4. 環境変数の設定

`wrangler.toml`に以下の設定が必要です：

```toml
name = "kuru-piro-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env]
GTFS_STATIC_URL = "https://example.com/gtfs-static.zip"
GTFS_REALTIME_URL = "https://example.com/gtfs-realtime.pb"
REALTIME_UPDATE_INTERVAL = "30000"  # ミリ秒（30秒）

[[d1_databases]]
binding = "DB"
database_name = "kurupiro-db"
database_id = "<your-database-id>"

[[kv_namespaces]]
binding = "GTFS_CACHE"
id = "<your-kv-namespace-id>"

[[durable_objects.bindings]]
name = "REALTIME_CACHE"
class_name = "RealtimeCache"
```

---

## 開発コマンド

### 開発サーバーの起動

```bash
pnpm dev
```

ローカルで`http://localhost:8787`にアクセスできます。

### テストの実行

```bash
# すべてのテストを実行
pnpm test

# ユニットテストのみ
pnpm test:unit

# 統合テストのみ
pnpm test:integration

# カバレッジ付きで実行
pnpm test:coverage

# ウォッチモード（開発時）
pnpm test:watch
```

### 型チェック

```bash
pnpm check
```

TypeScriptのコンパイルエラーを確認します（出力なし）。

### コードフォーマット

```bash
pnpm fmt
```

Prettierを使用してコード整形を実行します。

---

## データベース操作

### マイグレーションの生成

スキーマを変更した場合、新しいマイグレーションを生成します：

```bash
pnpm db:generate
```

### ローカル環境でマイグレーション

```bash
pnpm db:migrate:local
```

### 本番環境でマイグレーション

```bash
pnpm db:migrate:prod
```

⚠️ **注意**: 本番環境でのマイグレーションは慎重に実行してください。

---

## デプロイ

### 本番環境へのデプロイ

```bash
pnpm deploy
```

Cloudflare Workers にデプロイされます。

### デプロイ前の確認事項

1. ✅ `pnpm check` でTypeScriptエラーがないこと
2. ✅ `pnpm test` ですべてのテストが通ること
3. ✅ `wrangler.toml` の設定が正しいこと
4. ✅ D1データベースがマイグレーション済みであること

---

## トラブルシューティング

### D1データベースが見つからない

```bash
# ローカルのD1データベースをリセット
rm -rf .wrangler
pnpm db:migrate:local
```

### Durable Objectsのエラー

```bash
# 開発サーバーを再起動
pnpm dev
```

### テストが失敗する

```bash
# キャッシュをクリア
pnpm test -- --no-cache
```

---

## プロジェクト構成ファイル

- `wrangler.toml`: Cloudflare Workers の設定
- `drizzle.config.ts`: Drizzle ORM の設定
- `tsconfig.json`: TypeScript の設定
- `vitest.config.ts`: Vitest テストフレームワークの設定

---

## 推奨VS Code拡張機能

- **Prettier - Code formatter**: コード整形
- **ESLint**: Lintエラーの検出
- **Cloudflare Workers**: Cloudflare Workers開発支援
- **Database Client**: D1データベースの閲覧

---

## さらなる情報

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [D1 ドキュメント](https://developers.cloudflare.com/d1/)
- [Drizzle ORM ドキュメント](https://orm.drizzle.team/)
- [Hono フレームワーク](https://hono.dev/)

---

## ヘルプ

問題が発生した場合は、Issueを作成するか、開発チームにお問い合わせください。
