# KuruPiro アーキテクチャ

このドキュメントでは、KuruPiroプロジェクトのアーキテクチャ設計について説明します。

## 設計方針

KuruPiroは**最低限のクリーンアーキテクチャ**を採用しています。

- ✅ 4層のレイヤー分離（Domain, Application, Infrastructure, Presentation）
- ✅ ドメインロジックとインフラストラクチャの分離
- ✅ テスタビリティの確保
- ❌ 過度な抽象化は避ける
- ❌ 不要なデザインパターンの適用は避ける

プロジェクトの規模に対して適切な複雑度を維持することを重視しています。

---

## ディレクトリ構造

```
src/
├── application/           # アプリケーション層
│   ├── dto/              # データ転送オブジェクト
│   │   └── NextBusDTO.ts
│   └── use-cases/        # ユースケース
│       ├── FindNextBusesUseCase.ts
│       └── GetStopNameUseCase.ts
│
├── domain/               # ドメイン層
│   ├── entities/         # エンティティ
│   ├── repositories/     # リポジトリインターフェース
│   ├── services/         # ドメインサービス
│   └── value-objects/    # 値オブジェクト
│
├── infrastructure/       # インフラストラクチャ層
│   ├── di/              # 依存性注入
│   │   └── ServiceFactory.ts
│   ├── external/        # 外部サービス連携
│   │   ├── durable-objects/  # Cloudflare Durable Objects
│   │   └── gtfs/             # GTFS データ処理
│   └── persistence/     # データ永続化
│       ├── mappers/     # ドメインモデル ⇔ DBモデル変換
│       ├── queries/     # クエリオブジェクト
│       └── repositories/ # リポジトリ実装
│
├── presentation/        # プレゼンテーション層
│   ├── controllers/     # HTTPコントローラー
│   └── middleware/      # ミドルウェア
│
├── __tests__/          # テスト
│   ├── integration/    # 統合テスト
│   ├── unit/          # 単体テスト
│   └── setup/         # テストセットアップ
│
├── db/                # データベーススキーマ
├── index.ts           # エントリーポイント
├── realtimeCache.ts   # リアルタイムキャッシュ（Durable Object）
└── types.ts           # 共通型定義
```

---

## レイヤーの責務

### 1. Domain層（ドメイン層）

**ビジネスロジックの核心**

- **Entities**: ビジネスの中心概念を表現（Trip, Stop, Route, etc.）
- **Value Objects**: 不変の値（TripId, StopId, DelaySeconds, etc.）
- **Repositories**: データアクセスのインターフェース（実装は持たない）
- **Services**: 複数のエンティティにまたがるビジネスロジック

**依存関係**: なし（完全に独立）

---

### 2. Application層（アプリケーション層）

**ユースケースの実装**

- **Use Cases**: アプリケーション固有のビジネスフロー
  - `FindNextBusesUseCase`: 次のバスを検索
  - `GetStopNameUseCase`: 停留所名を取得
- **DTO**: レイヤー間のデータ転送用オブジェクト

**依存関係**: Domain層のみ

---

### 3. Infrastructure層（インフラストラクチャ層）

**技術的な実装詳細**

- **Persistence**: Drizzle ORMを使ったD1データベースアクセス
- **External Services**:
  - GTFS Static/Realtimeデータの取得・解析
  - Durable Objectsによるキャッシング
- **DI**: 依存性の注入と解決（`ServiceFactory`）

**依存関係**: Domain層、Application層

---

### 4. Presentation層（プレゼンテーション層）

**HTTP APIの提供**

- **Controllers**:
  - `BusController`: バス検索API
  - `StopController`: 停留所情報API
- **Middleware**: CORS、エラーハンドリングなど

**依存関係**: Application層

---

## データフロー

```
HTTP Request
    ↓
[Presentation] Controller
    ↓
[Application] Use Case
    ↓
[Domain] Service / Repository Interface
    ↓
[Infrastructure] Repository Implementation
    ↓
Database / External API
```

**逆方向の依存は禁止**（依存性逆転の原則）

例:
- ✅ Presentation → Application → Domain ← Infrastructure
- ❌ Domain → Infrastructure（これは違反）

---

## 主要コンポーネント

### ServiceFactory

依存性注入（DI）を管理する中心的なファクトリクラス。

```typescript
export class ServiceFactory {
  createFindNextBusesUseCase(env: Env): FindNextBusesUseCase {
    // リポジトリとサービスのインスタンス化
    const tripRepo = new DrizzleTripRepository(env.DB);
    const tripFinder = new TripFinderService(/* ... */);

    // ユースケースに注入
    return new FindNextBusesUseCase(tripFinder);
  }
}
```

### GTFS Data Processing

GTFS Static（時刻表）とGTFS Realtime（リアルタイム位置情報）を統合して次のバスを計算。

**キャッシング戦略:**
- Static Data: KVに長期保存（更新頻度: 日次）
- Realtime Data: Durable Objectでキャッシュ（更新頻度: 30秒）

---

## テスト戦略

### Unit Tests
- Domain層のロジック検証
- ビジネスルールの正確性を保証

### Integration Tests
- Use Caseとリポジトリの統合
- コントローラーのE2E検証
- 実際のD1データベースを使用（vitest-environment-miniflare）

---

## デプロイメント

**ターゲット**: Cloudflare Workers

- **D1**: SQLiteベースのデータベース（GTFS Static Data）
- **KV**: Key-Value ストレージ（キャッシュ）
- **Durable Objects**: ステートフルなリアルタイムキャッシュ

---

## 今後の改善点

現在のアーキテクチャは必要最小限の構成です。以下の点は意図的に簡素化しています：

1. **DTOの最小化**: 多くの場合、ドメインエンティティをそのまま返却
2. **マッパーの統合**: 一部、リポジトリ内で変換処理を実施
3. **抽象化の抑制**: インターフェースは必要最小限のみ定義

プロジェクトの成長に応じて、必要な箇所のみを段階的に拡張していきます。
