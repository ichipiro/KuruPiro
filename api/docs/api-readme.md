# KuruPiro API

リアルタイムバス到着情報を提供するCloudflare Workers API

## 概要

KuruPiro APIは、GTFS（General Transit Feed Specification）データとGTFS Realtimeデータを活用して、バスの次回到着時刻と遅延情報をリアルタイムで提供するサービスです。Cloudflare Workersエッジコンピューティングプラットフォーム上で動作し、クリーンアーキテクチャを採用した高性能なAPIを実現しています。

## 主な機能

- **次のバス検索**: 出発地と目的地を指定して、次に利用可能なバスを検索
- **リアルタイム遅延情報**: GTFS Realtimeデータから遅延情報を取得し、実際の到着時刻を計算
- **停留所情報取得**: 停留所IDから停留所名を取得
- **高性能**: バッチデータフェッチとキャッシング最適化による高速レスポンス

## アーキテクチャ

本プロジェクトは**クリーンアーキテクチャ**を採用しています。

```
src/
├── domain/              # ドメイン層（ビジネスロジックの核心）
│   ├── entities/       # エンティティ（Trip, Stop, etc.）
│   ├── value-objects/  # 値オブジェクト（StopId, GTFSTime, Delay, etc.）
│   ├── repositories/   # リポジトリインターフェース
│   └── services/       # ドメインサービス（TripFinder, TimeCalculation）
│
├── application/         # アプリケーション層（ユースケース）
│   ├── use-cases/      # ユースケース実装
│   └── dto/            # データ転送オブジェクト
│
├── infrastructure/      # インフラストラクチャ層（外部システムとの接続）
│   ├── persistence/    # データ永続化（D1, KV, Durable Objects）
│   │   ├── repositories/  # リポジトリ実装
│   │   ├── queries/       # クエリオブジェクト
│   │   └── mappers/       # ドメインモデル⇔DBマッピング
│   ├── realtime/       # リアルタイムデータ処理（GTFS Realtime Protobuf）
│   └── di/             # 依存性注入（ServiceFactory）
│
├── presentation/        # プレゼンテーション層（API）
│   ├── controllers/    # コントローラー（BusController, StopController）
│   └── middleware/     # ミドルウェア（DI注入, エラーハンドリング）
│
└── realtimeCache.ts    # Durable Object実装（リアルタイムキャッシュ）
```

### 依存関係の方向

```
Presentation → Application → Domain ← Infrastructure
```

- **Domain層**: 他の層に依存しない（純粋なビジネスロジック）
- **Application層**: Domain層のみに依存
- **Infrastructure層**: DomainとApplicationに依存（インターフェース実装）
- **Presentation層**: すべての層を統合

詳細は[ARCHITECTURE.md](./ARCHITECTURE.md)を参照してください。

## API仕様

### エンドポイント

#### `GET /api/:stop_id/:dest_stop_id`

次のバスを検索します。

**パラメータ:**
- `stop_id` (required): 出発地停留所ID
- `dest_stop_id` (required): 目的地停留所ID
- `response_size` (optional): レスポンスサイズ（デフォルト: 5、最大: 20）

**レスポンス例:**
```json
[
  {
    "trip_id": "trip_12345",
    "trip_short_id": "1",
    "arrival_time": "10:30",
    "actual_arrival": "10:35",
    "remaining_time": "あと35分",
    "delay": "5分遅れ",
    "trip_dest": "○○駅前"
  }
]
```

#### `GET /api/stop/:stop_id/name`

停留所名を取得します。

**パラメータ:**
- `stop_id` (required): 停留所ID

**レスポンス例:**
```json
{
  "stop_id": "stop_001",
  "name": "東京駅八重洲口"
}
```

#### `GET /`

ヘルスチェックエンドポイント

**レスポンス:**
```json
{
  "status": "healthy"
}
```

詳細は[API.md](./API.md)を参照してください。

## 技術スタック

### ランタイム・プラットフォーム
- **Cloudflare Workers**: エッジコンピューティングプラットフォーム
- **Cloudflare D1**: SQLiteベースのサーバーレスデータベース
- **Cloudflare KV**: キーバリューストレージ（GTFSキャッシュ）
- **Cloudflare Durable Objects**: ステートフルオブジェクト（リアルタイムキャッシュ）

### フレームワーク・ライブラリ
- **Hono**: 高速軽量なWebフレームワーク
- **Drizzle ORM**: 型安全なORM
- **pbf**: Protobufデコーダー（GTFS Realtime）
- **fflate**: 高速Zip解凍（GTFS Static）

### 開発ツール
- **TypeScript**: 型安全な開発
- **Vitest**: 高速テストフレームワーク
- **Prettier**: コードフォーマッター
- **Wrangler**: Cloudflare Workers CLI

## セットアップ

### 前提条件

- Node.js 18以上
- pnpm（推奨）またはnpm
- Cloudflareアカウント
- Wrangler CLI

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd api

# 依存関係をインストール
pnpm install

# Wranglerでログイン
wrangler login
```

### 環境設定

`wrangler.toml`を編集して、以下を設定します:

```toml
account_id = "your-account-id"

[vars]
GTFS_STATIC_URL = "https://your-gtfs-static-url/data.zip"
GTFS_REALTIME_URL = "https://your-gtfs-realtime-url"
REALTIME_UPDATE_INTERVAL = "15"
```

### データベースのセットアップ

```bash
# D1データベースを作成
wrangler d1 create kurupiro-db

# マイグレーションを実行（ローカル）
pnpm run db:migrate:local

# マイグレーションを実行（本番）
pnpm run db:migrate:prod
```

### 開発サーバーの起動

```bash
# ローカル開発サーバー
pnpm dev

# http://localhost:8787 でアクセス可能
```

## テスト

```bash
# 全テストを実行
pnpm test

# ユニットテストのみ
pnpm test:unit

# 統合テストのみ
pnpm test:integration

# カバレッジレポート
pnpm test:coverage

# ウォッチモード
pnpm test:watch
```

### テスト構成

- **ユニットテスト**: 218テスト（ドメイン、アプリケーション、インフラ層）
- **統合テスト**: 8テスト（コントローラー）
- **合計**: 226テスト

## デプロイ

```bash
# 本番環境へデプロイ
pnpm deploy
```

## パフォーマンス最適化

- **バッチデータフェッチ**: リアルタイムデータを一括取得（N+1問題の解消）
- **Map ベースルックアップ**: O(1)の高速検索
- **Durable Objectsキャッシング**: リアルタイムデータの15分間キャッシュ
- **エッジコンピューティング**: Cloudflare Workersによる低レイテンシ配信

## ライセンス

Private

## 開発ガイド

詳細な開発ガイドは[DEVELOPMENT.md](./DEVELOPMENT.md)を参照してください。
