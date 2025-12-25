# 開発ガイド

KuruPiro API の開発環境セットアップと開発ワークフローのガイドです。

## 目次

- [開発環境のセットアップ](#開発環境のセットアップ)
- [プロジェクト構成](#プロジェクト構成)
- [開発ワークフロー](#開発ワークフロー)
- [テスト](#テスト)
- [デバッグ](#デバッグ)
- [データベース管理](#データベース管理)
- [デプロイ](#デプロイ)
- [トラブルシューティング](#トラブルシューティング)
- [コーディング規約](#コーディング規約)

---

## 開発環境のセットアップ

### 前提条件

以下のツールが必要です:

- **Node.js**: v18以上
- **pnpm**: v8以上（推奨）またはnpm
- **Git**: バージョン管理
- **Cloudflareアカウント**: デプロイ用
- **エディタ**: VS Code推奨

### インストール手順

#### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd api
```

#### 2. 依存関係のインストール

```bash
pnpm install
```

または npm を使用:

```bash
npm install
```

#### 3. Wrangler のセットアップ

Cloudflare Workers CLIツール（Wrangler）でログイン:

```bash
pnpm wrangler login
```

ブラウザが開き、Cloudflareアカウントでの認証を求められます。

#### 4. 環境設定

`wrangler.toml` を確認・編集します:

```toml
name = "kuru-piro-worker"
main = "src/index.ts"
compatibility_date = "2024-04-15"
account_id = "your-account-id"  # ← あなたのCloudflare Account IDに変更

[vars]
GTFS_STATIC_URL = "https://your-gtfs-provider.com/static_data.zip"
GTFS_REALTIME_URL = "https://your-gtfs-provider.com/realtime"
REALTIME_UPDATE_INTERVAL = "15"
```

Account ID は Cloudflare ダッシュボードで確認できます:
1. https://dash.cloudflare.com にログイン
2. Workers & Pages → Overview
3. 右側に表示される Account ID をコピー

#### 5. D1 データベースの作成

**ローカル開発用** (自動作成):

Wranglerが自動的にローカルのSQLiteデータベースを作成します。

**本番環境用**:

```bash
# D1データベースを作成
pnpm wrangler d1 create kurupiro-db

# 出力されたdatabase_idをwrangler.tomlに追記
# [[d1_databases]]
# binding = "DB"
# database_name = "kurupiro-db"
# database_id = "<出力されたID>"
```

#### 6. データベースマイグレーション

**ローカル環境**:

```bash
pnpm run db:migrate:local
```

**本番環境**:

```bash
pnpm run db:migrate:prod
```

#### 7. KV Namespace の作成

**ローカル開発用** (自動作成):

Wranglerが自動的に作成します。

**本番環境用**:

```bash
# KV Namespaceを作成
pnpm wrangler kv:namespace create "GTFS_CACHE"

# 出力されたidをwrangler.tomlに追記
# [[kv_namespaces]]
# binding = "GTFS_CACHE"
# id = "<出力されたID>"
```

#### 8. 開発サーバーの起動

```bash
pnpm dev
```

http://localhost:8787 でアクセス可能になります。

**動作確認**:

```bash
curl http://localhost:8787/
# {"status":"healthy"}
```

---

## プロジェクト構成

```
api/
├── src/
│   ├── domain/                  # ドメイン層
│   │   ├── entities/           # エンティティ
│   │   ├── value-objects/      # 値オブジェクト
│   │   ├── repositories/       # リポジトリインターフェース
│   │   └── services/           # ドメインサービス
│   │
│   ├── application/             # アプリケーション層
│   │   ├── use-cases/          # ユースケース
│   │   └── dto/                # データ転送オブジェクト
│   │
│   ├── infrastructure/          # インフラストラクチャ層
│   │   ├── persistence/
│   │   │   ├── repositories/  # リポジトリ実装
│   │   │   ├── queries/       # クエリオブジェクト
│   │   │   ├── mappers/       # マッパー
│   │   │   └── schema/        # Drizzle スキーマ
│   │   ├── realtime/          # リアルタイムデータ処理
│   │   └── di/                # 依存性注入
│   │
│   ├── presentation/            # プレゼンテーション層
│   │   ├── controllers/       # コントローラー
│   │   └── middleware/        # ミドルウェア
│   │
│   ├── __tests__/              # テスト
│   │   ├── unit/              # ユニットテスト
│   │   ├── integration/       # 統合テスト
│   │   └── e2e/               # E2Eテスト
│   │
│   ├── index.ts                # エントリーポイント
│   ├── realtimeCache.ts        # Durable Object実装
│   └── types.ts                # 型定義
│
├── drizzle/                    # データベースマイグレーション
├── wrangler.toml               # Cloudflare Workers設定
├── package.json
├── tsconfig.json
├── vitest.config.ts
│
└── docs/                       # ドキュメント
    ├── README.md
    ├── API.md
    ├── ARCHITECTURE.md
    └── DEVELOPMENT.md (このファイル)
```

---

## 開発ワークフロー

### 新機能の追加

クリーンアーキテクチャに従った開発フロー:

#### 1. ドメイン層の設計

まず、ビジネスロジックを定義します。

**値オブジェクトの作成** (`src/domain/value-objects/`):

```typescript
// src/domain/value-objects/RouteId.ts
export class RouteId {
  private constructor(private readonly value: string) {}

  static fromString(value: string): RouteId {
    if (!value) {
      throw new Error('RouteId cannot be empty');
    }
    return new RouteId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: RouteId): boolean {
    return this.value === other.value;
  }
}
```

**エンティティの作成** (`src/domain/entities/`):

```typescript
// src/domain/entities/Route.ts
export class Route {
  constructor(
    public readonly id: RouteId,
    public readonly shortName: string,
    public readonly longName: string
  ) {}
}
```

**リポジトリインターフェースの定義** (`src/domain/repositories/`):

```typescript
// src/domain/repositories/IRouteRepository.ts
export interface IRouteRepository {
  findById(routeId: RouteId): Promise<Route | undefined>;
  findAll(): Promise<Route[]>;
}
```

#### 2. インフラストラクチャ層の実装

ドメイン層のインターフェースを実装します。

**マッパーの作成** (`src/infrastructure/persistence/mappers/`):

```typescript
// src/infrastructure/persistence/mappers/RouteMapper.ts
export class RouteMapper {
  static toDomain(row: RouteRow): Route {
    return new Route(
      RouteId.fromString(row.route_id),
      row.route_short_name,
      row.route_long_name
    );
  }
}
```

**リポジトリ実装** (`src/infrastructure/persistence/repositories/`):

```typescript
// src/infrastructure/persistence/repositories/DrizzleRouteRepository.ts
export class DrizzleRouteRepository implements IRouteRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  async findById(routeId: RouteId): Promise<Route | undefined> {
    const row = await this.db
      .select()
      .from(routesTable)
      .where(eq(routesTable.route_id, routeId.toString()))
      .get();

    return row ? RouteMapper.toDomain(row) : undefined;
  }

  async findAll(): Promise<Route[]> {
    const rows = await this.db.select().from(routesTable).all();
    return rows.map(RouteMapper.toDomain);
  }
}
```

#### 3. アプリケーション層の実装

ユースケースを作成します。

**DTOの定義** (`src/application/dto/`):

```typescript
// src/application/dto/RouteDTO.ts
export interface RouteDTO {
  routeId: string;
  shortName: string;
  longName: string;
}
```

**ユースケースの作成** (`src/application/use-cases/`):

```typescript
// src/application/use-cases/GetAllRoutesUseCase.ts
export class GetAllRoutesUseCase {
  constructor(private readonly routeRepo: IRouteRepository) {}

  async execute(): Promise<RouteDTO[]> {
    const routes = await this.routeRepo.findAll();

    return routes.map(route => ({
      routeId: route.id.toString(),
      shortName: route.shortName,
      longName: route.longName,
    }));
  }
}
```

#### 4. プレゼンテーション層の実装

コントローラーとルートを追加します。

**コントローラーの作成** (`src/presentation/controllers/`):

```typescript
// src/presentation/controllers/RouteController.ts
export class RouteController {
  static async getAllRoutes(c: Context): Promise<Response> {
    try {
      const factory = c.get('factory') as ServiceFactory;
      const useCase = factory.getGetAllRoutesUseCase();

      const routes = await useCase.execute();

      return c.json(routes);
    } catch (error) {
      console.error('Error in RouteController.getAllRoutes:', error);
      return c.json({ error: error.message }, 500);
    }
  }
}
```

**ルートの追加** (`src/index.ts`):

```typescript
app.get('/api/routes', RouteController.getAllRoutes);
```

**ServiceFactoryの更新** (`src/infrastructure/di/ServiceFactory.ts`):

```typescript
export class ServiceFactory {
  // ...

  getGetAllRoutesUseCase(): GetAllRoutesUseCase {
    return new GetAllRoutesUseCase(this.getRouteRepository());
  }

  private getRouteRepository(): IRouteRepository {
    const db = drizzle(this.env.DB);
    return new DrizzleRouteRepository(db);
  }
}
```

#### 5. テストの作成

各層のテストを作成します。

**ユニットテスト** (`src/__tests__/unit/`):

```typescript
// src/__tests__/unit/application/use-cases/GetAllRoutesUseCase.test.ts
describe('GetAllRoutesUseCase', () => {
  it('should return all routes as DTOs', async () => {
    const mockRepo: IRouteRepository = {
      findAll: vi.fn().mockResolvedValue([
        new Route(RouteId.fromString('1'), '1番', '市役所線'),
        new Route(RouteId.fromString('2'), '2番', '駅前線'),
      ]),
      findById: vi.fn(),
    };

    const useCase = new GetAllRoutesUseCase(mockRepo);
    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      routeId: '1',
      shortName: '1番',
      longName: '市役所線',
    });
  });
});
```

**統合テスト** (`src/__tests__/integration/`):

```typescript
// src/__tests__/integration/controllers.test.ts (既存ファイルに追加)
describe('RouteController', () => {
  it('should return all routes', async () => {
    const mockFactory = {
      getGetAllRoutesUseCase: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue([
          { routeId: '1', shortName: '1番', longName: '市役所線' },
        ]),
      }),
    } as any;

    app.get('/api/routes', async (c) => {
      c.set('factory', mockFactory);
      return await RouteController.getAllRoutes(c);
    });

    const response = await app.request('/api/routes');
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveLength(1);
    expect(data[0].routeId).toBe('1');
  });
});
```

#### 6. 動作確認

```bash
# テスト実行
pnpm test

# 開発サーバー起動
pnpm dev

# 動作確認
curl http://localhost:8787/api/routes
```

---

## テスト

### テストの実行

```bash
# 全テストを実行
pnpm test

# ユニットテストのみ
pnpm test:unit

# 統合テストのみ
pnpm test:integration

# E2Eテスト（現在スキップ）
pnpm test:e2e

# カバレッジレポート生成
pnpm test:coverage

# ウォッチモード（変更を監視して自動実行）
pnpm test:watch
```

### テストの書き方

#### ユニットテスト

**テスト対象**: 個別のクラスやメソッド

**配置**: `src/__tests__/unit/<layer>/<target>.test.ts`

**例**:
```typescript
import { describe, it, expect } from 'vitest';
import { GTFSTime } from '@/domain/value-objects/GTFSTime';

describe('GTFSTime', () => {
  it('should parse time string correctly', () => {
    const time = GTFSTime.fromString('10:30:00');
    expect(time.toSeconds()).toBe(37800); // 10*3600 + 30*60
  });

  it('should handle 24+ hour times', () => {
    const time = GTFSTime.fromString('25:30:00');
    expect(time.toSeconds()).toBe(91800); // 25*3600 + 30*60
  });
});
```

#### 統合テスト

**テスト対象**: コントローラーとユースケースの統合

**配置**: `src/__tests__/integration/`

**例**:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import { BusController } from '@/presentation/controllers/BusController';

describe('BusController Integration', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    // モックのセットアップ
  });

  it('should return next buses', async () => {
    // テストロジック
  });
});
```

#### モックの作成

Vitestの`vi.fn()`を使用してモックを作成します:

```typescript
import { vi } from 'vitest';

// リポジトリのモック
const mockRepo: ITripRepository = {
  findTripsByStops: vi.fn().mockResolvedValue([/* ... */]),
} as unknown as ITripRepository;

// 実行時にモックの戻り値を変更
vi.mocked(mockRepo.findTripsByStops).mockResolvedValue([/* 新しい値 */]);

// モックが呼ばれたか確認
expect(mockRepo.findTripsByStops).toHaveBeenCalledWith(/* 引数 */);
```

---

## デバッグ

### ログ出力

開発中は`console.log`でログを出力できます:

```typescript
console.log('Debug info:', someVariable);
console.error('Error occurred:', error);
```

ローカル開発時はターミナルに表示されます。

本番環境では Cloudflare Dashboard → Workers & Pages → Your Worker → Logs で確認できます。

### Wrangler のデバッグモード

詳細なログを出力:

```bash
WRANGLER_LOG=debug pnpm dev
```

### Chromeデベロッパーツール

Wranglerの開発サーバーはChrome DevToolsプロトコルをサポートしています:

```bash
pnpm dev --inspector
```

ブラウザで `chrome://inspect` を開き、Remote Targetから接続します。

---

## データベース管理

### マイグレーションの作成

スキーマを変更した後、マイグレーションファイルを生成:

```bash
pnpm run db:generate
```

`drizzle/` ディレクトリに新しいマイグレーションファイルが作成されます。

### マイグレーションの適用

**ローカル**:
```bash
pnpm run db:migrate:local
```

**本番**:
```bash
pnpm run db:migrate:prod
```

### D1 データベースの直接操作

**ローカル**:
```bash
pnpm wrangler d1 execute kurupiro-db --local --command "SELECT * FROM stops LIMIT 10"
```

**本番**:
```bash
pnpm wrangler d1 execute kurupiro-db --command "SELECT * FROM stops LIMIT 10"
```

### Drizzle Studio（GUIツール）

視覚的にデータベースを操作:

```bash
pnpm drizzle-kit studio
```

ブラウザで `https://local.drizzle.studio` が開きます。

---

## デプロイ

### 事前確認

1. すべてのテストが通ることを確認:
   ```bash
   pnpm test
   ```

2. TypeScriptの型チェック:
   ```bash
   pnpm check
   ```

3. コードフォーマット:
   ```bash
   pnpm fmt
   ```

### 本番環境へのデプロイ

```bash
pnpm deploy
```

デプロイ後、以下のURLでアクセス可能:
```
https://kuru-piro-worker.<your-subdomain>.workers.dev
```

### デプロイの確認

```bash
curl https://kuru-piro-worker.<your-subdomain>.workers.dev/
# {"status":"healthy"}
```

### ロールバック

以前のバージョンにロールバックする場合:

```bash
# デプロイ履歴を確認
pnpm wrangler deployments list

# 特定のデプロイメントにロールバック
pnpm wrangler rollback --deployment-id <deployment-id>
```

---

## トラブルシューティング

### よくある問題

#### 1. `wrangler dev` が起動しない

**エラー**: `Error: Could not resolve "node:buffer"`

**解決策**:
```bash
# Node.js互換性フラグを有効化
pnpm wrangler dev --compatibility-flags=nodejs_compat
```

または `wrangler.toml` に追加:
```toml
compatibility_flags = ["nodejs_compat"]
```

#### 2. D1データベースが見つからない

**エラー**: `Error: No D1 database with name 'kurupiro-db' found`

**解決策**:
```bash
# データベースを作成
pnpm wrangler d1 create kurupiro-db

# 出力されたdatabase_idをwrangler.tomlに設定
```

#### 3. テストが失敗する

**エラー**: `TypeError: Cannot read properties of undefined`

**解決策**:
- モックが正しく設定されているか確認
- `beforeEach`でモックをリセット:
  ```typescript
  beforeEach(() => {
    vi.clearAllMocks();
  });
  ```

#### 4. Durable Objectsのエラー

**エラー**: `Error: Durable Object class 'RealtimeCache' not found`

**解決策**:
- `wrangler.toml`のDurable Objects設定を確認:
  ```toml
  [[durable_objects.bindings]]
  name = "REALTIME_CACHE"
  class_name = "RealtimeCache"
  script_name = "kuru-piro-worker"

  [[migrations]]
  tag = "v1"
  new_classes = ["RealtimeCache"]
  ```

- マイグレーションが必要な場合、再デプロイ:
  ```bash
  pnpm deploy
  ```

#### 5. 型エラー

**エラー**: TypeScriptの型エラーが発生

**解決策**:
```bash
# 型チェック
pnpm check

# 型定義が見つからない場合、再インストール
pnpm install
```

---

## コーディング規約

### TypeScript

- **厳格な型チェック**: `strict: true` を使用
- **nullチェック**: optional chaining (`?.`) と nullish coalescing (`??`) を活用
- **明示的な型注釈**: 関数の戻り値は必ず型を指定

```typescript
// Good
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

// Bad
function calculateTotal(price, quantity) {
  return price * quantity;
}
```

### 命名規則

- **クラス名**: PascalCase（例: `FindNextBusesUseCase`）
- **関数/変数名**: camelCase（例: `getTripUpdate`）
- **定数**: UPPER_SNAKE_CASE（例: `MAX_RESPONSE_SIZE`）
- **ファイル名**: PascalCase（エンティティ、クラス）、camelCase（ユーティリティ）

### ファイル構成

- **1ファイル1クラス**: 原則として1つのファイルに1つのクラスを配置
- **インターフェースの命名**: `I` プレフィックス（例: `IRepository`）
- **テストファイル**: 対象ファイル名 + `.test.ts`

### コードフォーマット

Prettierを使用:

```bash
pnpm fmt
```

設定は `.prettierrc` または `package.json` に記載。

### コメント

- **日本語OK**: コメントは日本語で記述可能
- **JSDoc**: 公開APIには必ず記述

```typescript
/**
 * 次のバスを検索するユースケース
 *
 * 出発地と目的地の間を走る次のバスを検索し、リアルタイムデータがあれば
 * 遅延情報を適用して実際の到着時刻を計算します。
 */
export class FindNextBusesUseCase {
  /**
   * 次のバスを検索
   *
   * @param originStopId 出発地停留所ID
   * @param destinationStopId 目的地停留所ID
   * @param currentDateTime 現在時刻（JST）
   * @returns 次のバス情報のリスト（残り時間順にソート）
   */
  async execute(
    originStopId: StopId,
    destinationStopId: StopId,
    currentDateTime: JSTDateTime
  ): Promise<NextBusDTO[]> {
    // ...
  }
}
```

### クリーンアーキテクチャのルール

1. **依存関係は内側に向ける**: 外側の層が内側の層を参照する
2. **Domain層は独立**: 他の層やフレームワークに依存しない
3. **インターフェースで分離**: Infrastructure層はインターフェースを実装
4. **値オブジェクトは不変**: すべてのプロパティを`readonly`にする

---

## 便利なコマンド一覧

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm test` | 全テスト実行 |
| `pnpm test:watch` | テストをウォッチモードで実行 |
| `pnpm test:coverage` | カバレッジレポート生成 |
| `pnpm check` | TypeScript型チェック |
| `pnpm fmt` | コードフォーマット |
| `pnpm deploy` | 本番環境へデプロイ |
| `pnpm run db:generate` | マイグレーションファイル生成 |
| `pnpm run db:migrate:local` | ローカルDBマイグレーション |
| `pnpm run db:migrate:prod` | 本番DBマイグレーション |
| `pnpm wrangler d1 execute kurupiro-db --local --command "SELECT ..."` | ローカルDB直接操作 |
| `pnpm drizzle-kit studio` | Drizzle Studio起動 |

---

## 参考資料

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Vitest Documentation](https://vitest.dev/)
- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [GTFS Specification](https://gtfs.org/)
- [GTFS Realtime Reference](https://gtfs.org/realtime/)

---

## 貢献

1. 新しいブランチを作成: `git checkout -b feature/my-feature`
2. 変更をコミット: `git commit -m "Add my feature"`
3. プッシュ: `git push origin feature/my-feature`
4. Pull Requestを作成

---

質問や問題がある場合は、GitHubのIssuesで報告してください。
