# アーキテクチャ設計書

## 概要

KuruPiro APIは、**クリーンアーキテクチャ**（Clean Architecture）の原則に基づいて設計されています。このアーキテクチャにより、ビジネスロジックと外部システム（データベース、API、フレームワーク）を分離し、テスタビリティと保守性を向上させています。

## クリーンアーキテクチャの原則

### 1. 依存関係のルール（Dependency Rule）

依存関係は**常に内側に向かう**ように設計されています:

```
┌─────────────────────────────────────────┐
│     Presentation Layer (外側)            │
│  ┌──────────────────────────────────┐  │
│  │  Infrastructure Layer             │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │  Application Layer          │  │  │
│  │  │  ┌──────────────────────┐  │  │  │
│  │  │  │  Domain Layer (核心) │  │  │  │
│  │  │  │                      │  │  │  │
│  │  │  │  - Entities          │  │  │  │
│  │  │  │  - Value Objects     │  │  │  │
│  │  │  │  - Domain Services   │  │  │  │
│  │  │  │  - Repository I/F    │  │  │  │
│  │  │  └──────────────────────┘  │  │  │
│  │  │  - Use Cases                │  │  │
│  │  │  - DTOs                     │  │  │
│  │  └────────────────────────────┘  │  │
│  │  - Repository Implementations     │  │
│  │  - External API Clients           │  │
│  │  - Persistence Logic              │  │
│  └──────────────────────────────────┘  │
│  - Controllers                          │
│  - Middleware                           │
│  - HTTP Routing                         │
└─────────────────────────────────────────┘
```

**依存の方向**:
- **Domain**: 何にも依存しない（純粋なビジネスロジック）
- **Application**: Domain のみに依存
- **Infrastructure**: Domain と Application のインターフェースに依存（実装を提供）
- **Presentation**: すべての層を統合（DIコンテナ経由）

### 2. レイヤー間の境界

各レイヤーは明確に分離されており、**インターフェース**を通じて通信します:

- Infrastructure層はDomain層の`IRepository`インターフェースを実装
- Presentation層はApplication層の`UseCase`を呼び出す
- 外側の層は内側の層を直接参照できるが、内側は外側を知らない

---

## レイヤー詳細

### Domain Layer（ドメイン層）

**責務**: ビジネスルールとドメインロジックの定義

**特徴**:
- 他のレイヤーに依存しない（完全に独立）
- フレームワークやライブラリに依存しない
- 純粋なTypeScript/JavaScriptのみ
- 最も重要なビジネスロジックを含む

#### 構成要素

##### 1. Entities（エンティティ）

`src/domain/entities/`

ビジネスにおける重要な概念を表すオブジェクト。

**例**:
- **Trip**: バスの運行（トリップ）
- **TripUpdate**: リアルタイムのトリップ更新情報
- **StopTimeUpdate**: 停留所ごとの到着・出発時刻更新

**主要エンティティ**:

```typescript
// src/domain/entities/Trip.ts
export class Trip {
  constructor(
    public readonly id: TripId,
    public readonly routeId: RouteId,
    public readonly serviceId: ServiceId,
    public readonly tripHeadsign: string
  ) {}
}

// src/domain/entities/TripUpdate.ts
export class TripUpdate {
  constructor(
    public readonly tripId: TripId,
    public readonly stopTimeUpdates: StopTimeUpdate[]
  ) {}

  findStopTimeUpdate(stopSequence: number): StopTimeUpdate | undefined {
    return this.stopTimeUpdates.find(stu => stu.stopSequence === stopSequence);
  }
}
```

##### 2. Value Objects（値オブジェクト）

`src/domain/value-objects/`

不変（immutable）な値を表現するオブジェクト。同じ値なら同じオブジェクトとみなされる。

**主要な値オブジェクト**:

| クラス | 説明 | 主要メソッド |
|--------|------|-------------|
| `StopId` | 停留所ID | `fromString()`, `toString()`, `equals()` |
| `TripId` | トリップID | `fromString()`, `toString()`, `equals()` |
| `GTFSTime` | GTFS時刻（24時間超対応） | `fromString()`, `toSeconds()`, `addSeconds()` |
| `JSTDateTime` | JST日時 | `now()`, `fromComponents()`, `toTimeString()` |
| `Delay` | 遅延時間 | `fromSeconds()`, `toSeconds()`, `toDisplayString()` |
| `RemainingTime` | 残り時間 | `fromMinutes()`, `toMinutes()`, `toString()` |

**設計のポイント**:
- すべて`readonly`プロパティで不変性を保証
- ファクトリメソッド（`fromString`, `fromSeconds`など）で生成
- `equals()`メソッドで値の等価性を判定
- ビジネスルールをカプセル化（例: GTFSTimeは25:30のような時刻も扱える）

**例**:
```typescript
// src/domain/value-objects/GTFSTime.ts
export class GTFSTime {
  private constructor(private readonly totalSeconds: number) {}

  static fromString(timeStr: string): GTFSTime {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return new GTFSTime(hours * 3600 + minutes * 60 + (seconds || 0));
  }

  // GTFS仕様: 24時間を超える時刻も扱える（翌日を表現）
  addSeconds(seconds: number): GTFSTime {
    return new GTFSTime(this.totalSeconds + seconds);
  }

  toSeconds(): number {
    return this.totalSeconds;
  }
}
```

##### 3. Repository Interfaces（リポジトリインターフェース）

`src/domain/repositories/`

データ永続化の抽象化。Domain層は実装を知らず、インターフェースのみに依存。

**主要インターフェース**:

```typescript
// src/domain/repositories/ITripRepository.ts
export interface ITripRepository {
  findTripsByStops(
    originStopId: StopId,
    destinationStopId: StopId,
    afterTime: GTFSTime
  ): Promise<Trip[]>;
}

// src/domain/repositories/IRealtimeRepository.ts
export interface IRealtimeRepository {
  getTripUpdate(tripId: TripId): Promise<TripUpdate | undefined>;
  getAllTripUpdates(): Promise<TripUpdate[]>;
  getLastUpdatedAt(): Promise<Date | undefined>;
  forceUpdate(): Promise<void>;
}
```

**設計のポイント**:
- インターフェースはDomain層に配置（依存関係逆転の原則）
- 実装はInfrastructure層に配置
- Domain層のエンティティと値オブジェクトのみを使用

##### 4. Domain Services（ドメインサービス）

`src/domain/services/`

複数のエンティティや値オブジェクトにまたがる複雑なビジネスロジック。

**主要サービス**:

```typescript
// src/domain/services/TripFinderService.ts
export class TripFinderService {
  constructor(private readonly query: IFindTripsQuery) {}

  async findTrips(
    originStopId: StopId,
    destinationStopId: StopId,
    currentDateTime: JSTDateTime
  ): Promise<TripSearchResult[]> {
    // 複雑な検索ロジック
    // - 現在時刻以降のトリップ検索
    // - 前日の深夜便も考慮（GTFSの24時間超時刻）
    // - 出発地→目的地の順序検証
  }
}

// src/domain/services/TimeCalculationService.ts
export class TimeCalculationService {
  calculateActualArrivalTime(
    scheduledTime: GTFSTime,
    delay: Delay | undefined,
    baseDate: JSTDateTime
  ): JSTDateTime {
    // 遅延を考慮した実際の到着時刻を計算
  }

  calculateRemainingTime(
    arrivalTime: JSTDateTime,
    currentTime: JSTDateTime
  ): RemainingTime {
    // 残り時間を計算
  }
}
```

**設計のポイント**:
- エンティティに配置すると不自然なロジックを担当
- 複数のリポジトリやクエリを使用する場合も
- ステートレス（状態を持たない）

---

### Application Layer（アプリケーション層）

**責務**: ユースケース（アプリケーション固有のビジネスルール）の実装

**特徴**:
- Domain層のみに依存
- ユースケースごとにクラスを作成
- トランザクション境界の定義
- DTOでレスポンス形式を定義

#### 構成要素

##### 1. Use Cases（ユースケース）

`src/application/use-cases/`

アプリケーションの機能を表現。各エンドポイントに対応するユースケースを実装。

**主要ユースケース**:

```typescript
// src/application/use-cases/FindNextBusesUseCase.ts
export class FindNextBusesUseCase {
  constructor(
    private readonly tripFinder: TripFinderService,
    private readonly timeCalculation: TimeCalculationService,
    private readonly realtimeRepo?: IRealtimeRepository
  ) {}

  async execute(
    originStopId: StopId,
    destinationStopId: StopId,
    currentDateTime: JSTDateTime
  ): Promise<NextBusDTO[]> {
    // 1. トリップを検索（ドメインサービス使用）
    const tripResults = await this.tripFinder.findTrips(...);

    // 2. リアルタイムデータを一括取得（パフォーマンス最適化）
    const allTripUpdates = await this.realtimeRepo?.getAllTripUpdates() ?? [];
    const tripUpdateMap = new Map(
      allTripUpdates.map(update => [update.tripId.value, update])
    );

    // 3. DTOに変換
    const buses = tripResults.map(tripResult => {
      const tripUpdate = tripUpdateMap.get(tripResult.tripId);
      const delay = tripUpdate?.findStopTimeUpdate(tripResult.stopSequence)?.arrivalDelay;
      const actualArrivalTime = this.timeCalculation.calculateActualArrivalTime(...);
      // ...
      return dto;
    });

    // 4. ソート（残り時間順）
    buses.sort((a, b) => a.remainingMinutes - b.remainingMinutes);

    return buses;
  }
}
```

**設計のポイント**:
- 1ユースケース = 1クラス = 1 `execute()` メソッド
- ドメインサービスとリポジトリを組み合わせてロジックを実装
- パフォーマンス最適化（バッチフェッチ、Map化）
- DTOで外部とのデータフォーマットを定義

##### 2. DTOs（Data Transfer Objects）

`src/application/dto/`

レイヤー間でデータを転送するためのシンプルなオブジェクト。

**例**:
```typescript
// src/application/dto/NextBusDTO.ts
export interface NextBusDTO {
  scheduledArrival: string;      // "10:30"
  actualArrival: string;         // "10:35" (遅延適用後)
  remainingTime: string;         // "あと35分"
  remainingMinutes: number;      // 35
  routeShortName: string;        // "1"
  destinationLabel: string;      // "○○駅前"
  tripId: string;                // "trip_12345"
  delaySeconds: number;          // 300 (秒)
  delayDisplay: string;          // "5分遅れ"
}
```

**設計のポイント**:
- プリミティブ型のみ（string, number, boolean）
- ドメインオブジェクトから変換される
- Presentation層が直接使用可能

---

### Infrastructure Layer（インフラストラクチャ層）

**責務**: 外部システムとの接続（DB、API、キャッシュなど）

**特徴**:
- Domain層のインターフェースを実装
- Cloudflare Workers固有のロジック
- データアクセス、外部API呼び出し、Protobufデコード

#### 構成要素

##### 1. Persistence（永続化）

`src/infrastructure/persistence/`

###### a. Repositories（リポジトリ実装）

`src/infrastructure/persistence/repositories/`

Domain層の`IRepository`インターフェースを実装。

**実装クラス**:

| クラス | 実装するインターフェース | 使用技術 |
|--------|------------------------|----------|
| `DrizzleTripRepository` | `ITripRepository` | Drizzle ORM + Cloudflare D1 |
| `DrizzleStopRepository` | `IStopRepository` | Drizzle ORM + Cloudflare D1 |
| `DurableObjectRealtimeRepository` | `IRealtimeRepository` | Cloudflare Durable Objects |

**例**:
```typescript
// src/infrastructure/persistence/repositories/DrizzleTripRepository.ts
export class DrizzleTripRepository implements ITripRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  async findTripsByStops(
    originStopId: StopId,
    destinationStopId: StopId,
    afterTime: GTFSTime
  ): Promise<Trip[]> {
    // Drizzle ORMでSQLクエリを実行
    const rows = await this.db
      .select()
      .from(tripsTable)
      .where(/* ... */);

    // マッパーを使ってドメインエンティティに変換
    return rows.map(row => TripMapper.toDomain(row));
  }
}
```

###### b. Queries（クエリオブジェクト）

`src/infrastructure/persistence/queries/`

複雑なクエリロジックを分離。

**主要クエリ**:
```typescript
// src/infrastructure/persistence/queries/FindTripsQuery.ts
export interface IFindTripsQuery {
  findTrips(
    originStopId: StopId,
    destinationStopId: StopId,
    afterTime: GTFSTime,
    serviceIds: ServiceId[]
  ): Promise<TripSearchResult[]>;
}

export class FindTripsQuery implements IFindTripsQuery {
  constructor(private readonly db: DrizzleD1Database) {}

  async findTrips(...): Promise<TripSearchResult[]> {
    // 複雑なJOINクエリ
    // - trips, stop_times, routes, calendar テーブルを結合
    // - 前日・当日・翌日の3日分を検索（24時間超時刻対応）
    // - 出発地→目的地の順序を検証
  }
}
```

**設計のポイント**:
- リポジトリよりも複雑な検索ロジックを分離
- ドメインサービスから直接使用される場合も
- パフォーマンスチューニングが必要な箇所を明確化

###### c. Mappers（マッパー）

`src/infrastructure/persistence/mappers/`

データベースの行オブジェクト ⇔ ドメインエンティティの変換。

**例**:
```typescript
// src/infrastructure/persistence/mappers/TripMapper.ts
export class TripMapper {
  static toDomain(row: TripRow): Trip {
    return new Trip(
      TripId.fromString(row.trip_id),
      RouteId.fromString(row.route_id),
      ServiceId.fromString(row.service_id),
      row.trip_headsign ?? ''
    );
  }

  static toPersistence(trip: Trip): TripRow {
    return {
      trip_id: trip.id.toString(),
      route_id: trip.routeId.toString(),
      service_id: trip.serviceId.toString(),
      trip_headsign: trip.tripHeadsign,
    };
  }
}
```

##### 2. Realtime（リアルタイムデータ処理）

`src/infrastructure/realtime/`

GTFS Realtimeデータ（Protobuf）のデコードと変換。

**主要クラス**:
```typescript
// src/infrastructure/realtime/RealtimeDecoder.ts
export class RealtimeDecoder {
  decode(buffer: ArrayBuffer): TripUpdate[] {
    // 1. Protobufデコード（pbfライブラリ使用）
    const feedMessage = this.decodeFeedMessage(buffer);

    // 2. ドメインエンティティに変換
    return feedMessage.entity
      .filter(entity => entity.trip_update)
      .map(entity => this.toTripUpdate(entity.trip_update));
  }

  private toTripUpdate(pbTripUpdate: any): TripUpdate {
    const tripId = TripId.fromString(pbTripUpdate.trip.trip_id);
    const stopTimeUpdates = pbTripUpdate.stop_time_update.map(
      stu => new StopTimeUpdate(
        stu.stop_sequence,
        stu.arrival ? Delay.fromSeconds(stu.arrival.delay) : undefined,
        stu.departure ? Delay.fromSeconds(stu.departure.delay) : undefined
      )
    );
    return new TripUpdate(tripId, stopTimeUpdates);
  }
}
```

##### 3. DI（依存性注入）

`src/infrastructure/di/`

**ServiceFactory**: DIコンテナの役割。

```typescript
// src/infrastructure/di/ServiceFactory.ts
export class ServiceFactory {
  constructor(private readonly env: Env) {}

  getFindNextBusesUseCase(): FindNextBusesUseCase {
    return new FindNextBusesUseCase(
      this.getTripFinderService(),
      this.getTimeCalculationService(),
      this.getRealtimeRepository()
    );
  }

  private getTripFinderService(): TripFinderService {
    return new TripFinderService(this.getFindTripsQuery());
  }

  private getRealtimeRepository(): IRealtimeRepository {
    return new DurableObjectRealtimeRepository(
      this.env.REALTIME_CACHE,
      this.env.GTFS_REALTIME_URL
    );
  }

  // ...
}
```

**設計のポイント**:
- Cloudflare Workers環境では標準的なDIコンテナ（InversifyJSなど）が使いにくい
- シンプルなファクトリパターンで依存性を解決
- `Env`（Cloudflare Workers binding）から必要なリソースを取得

---

### Presentation Layer（プレゼンテーション層）

**責務**: HTTPリクエスト/レスポンスの処理、ルーティング

**特徴**:
- Honoフレームワークを使用
- コントローラーでユースケースを呼び出し
- ミドルウェアでDI、CORS、エラーハンドリング

#### 構成要素

##### 1. Controllers（コントローラー）

`src/presentation/controllers/`

HTTPリクエストを受け取り、ユースケースを実行し、レスポンスを返す。

**例**:
```typescript
// src/presentation/controllers/BusController.ts
export class BusController {
  static async getNextBuses(c: Context): Promise<Response> {
    try {
      // 1. パラメータ取得
      const originId = c.req.param('stop_id');
      const destinationId = c.req.param('dest_stop_id');
      const responseSize = Number.parseInt(c.req.query('response_size') ?? '5', 10);

      // 2. バリデーション
      if (!originId || !destinationId) {
        return c.json({ error: 'stop_id and dest_stop_id are required' }, 400);
      }

      // 3. ServiceFactoryからユースケースを取得
      const factory = c.get('factory') as ServiceFactory;
      const useCase = factory.getFindNextBusesUseCase();

      // 4. 値オブジェクトに変換
      const originStopId = StopId.fromString(originId);
      const destinationStopId = StopId.fromString(destinationId);
      const currentDateTime = JSTDateTime.now();

      // 5. ユースケース実行
      const buses = await useCase.execute(originStopId, destinationStopId, currentDateTime);

      // 6. レスポンス形式に変換（既存APIとの互換性）
      const items = buses.slice(0, responseSize).map(bus => ({
        trip_id: bus.tripId,
        trip_short_id: bus.routeShortName,
        arrival_time: bus.scheduledArrival,
        remaining_time: bus.remainingTime,
        delay: bus.delayDisplay,
        trip_dest: bus.destinationLabel,
      }));

      return c.json(items);
    } catch (error) {
      console.error('Error in BusController.getNextBuses:', error);
      return c.json({ error: error.message }, 500);
    }
  }
}
```

**設計のポイント**:
- コントローラーはロジックを持たない（薄い層）
- ユースケースから受け取ったDTOをレスポンス形式に変換
- エラーハンドリングをグローバルミドルウェアに委譲することも可能

##### 2. Middleware（ミドルウェア）

`src/presentation/middleware/`

**主要ミドルウェア**:

```typescript
// src/presentation/middleware/serviceFactory.ts
export function injectServiceFactory() {
  return async (c: Context, next: Next) => {
    const factory = new ServiceFactory(c.env);
    c.set('factory', factory);
    await next();
  };
}

// src/presentation/middleware/errorHandler.ts
export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error('Unhandled error:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};
```

##### 3. Routes（ルート定義）

`src/index.ts`

```typescript
const app = new Hono<{ Bindings: Env }>();

// グローバルミドルウェア
app.use('*', cors());
app.use('*', injectServiceFactory());
app.use('*', errorHandler);

// ルート定義
app.get('/', (c) => c.json({ status: 'healthy' }));
app.get('/api/:stop_id/:dest_stop_id', BusController.getNextBuses);
app.get('/api/stop/:stop_id/name', StopController.getStopName);

export default { fetch: app.fetch };
```

---

## Durable Objects（リアルタイムキャッシュ）

**ファイル**: `src/realtimeCache.ts`

Cloudflare Durable Objectsを使用して、GTFS Realtimeデータを15分間キャッシュ。

**主要メソッド**:

```typescript
export class RealtimeCache implements DurableObject {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === '/get-all') {
      return this.getAllTripUpdates();
    }
    if (pathname === '/force-update') {
      return this.forceUpdate();
    }
    // ...
  }

  private async getAllTripUpdates(): Promise<Response> {
    // 1. キャッシュの有効性確認（15分以内？）
    if (this.isCacheValid()) {
      return new Response(JSON.stringify(this.cachedData), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. キャッシュ無効 → 外部APIからフェッチ
    const response = await fetch(this.gtfsRealtimeUrl);
    const buffer = await response.arrayBuffer();

    // 3. Protobufデコード
    const decoder = new RealtimeDecoder();
    const tripUpdates = decoder.decode(buffer);

    // 4. キャッシュに保存
    this.cachedData = tripUpdates;
    this.lastUpdatedAt = new Date();

    return new Response(JSON.stringify(tripUpdates), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

**設計のポイント**:
- Durable Objectsはステートフルなオブジェクト（メモリ上にデータを保持）
- 15分間のキャッシュでGTFS Realtime APIへのリクエストを削減
- `forceUpdate()`でキャッシュを強制更新可能

---

## データフロー

### 次のバス検索のシーケンス

```
User Request
    ↓
┌────────────────────────────────────────────┐
│ Presentation: BusController                │
│  - パラメータ取得                          │
│  - バリデーション                          │
│  - ServiceFactoryからユースケース取得      │
└────────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────────┐
│ Application: FindNextBusesUseCase          │
│  - TripFinderService でトリップ検索        │
│  - RealtimeRepository でリアルタイムデータ │
│  - TimeCalculationService で時刻計算       │
│  - DTOに変換                               │
└────────────────────────────────────────────┘
    ↓                            ↓
┌──────────────────────┐  ┌──────────────────────┐
│ Domain:              │  │ Infrastructure:      │
│ TripFinderService    │  │ DurableObjectRealtime│
│  ↓                   │  │ Repository           │
│ FindTripsQuery       │  │  ↓                   │
│  ↓                   │  │ RealtimeCache (DO)   │
│ DrizzleTripRepo      │  │  ↓                   │
│  ↓                   │  │ GTFS Realtime API    │
│ Cloudflare D1        │  │  (Protobuf)          │
└──────────────────────┘  └──────────────────────┘
    ↓                            ↓
┌────────────────────────────────────────────┐
│ ドメインエンティティ・値オブジェクト       │
│  - Trip, TripUpdate, GTFSTime, Delay, ...  │
└────────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────────┐
│ Application: NextBusDTO[]                  │
└────────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────────┐
│ Presentation: JSON Response                │
└────────────────────────────────────────────┘
    ↓
User Response
```

---

## テスト戦略

### テストピラミッド

```
        ┌─────────┐
       ╱ E2E (0)  ╲
      ├───────────┤
     ╱ Integration╲
    ╱   (8 tests)  ╲
   ├───────────────┤
  ╱  Unit Tests     ╲
 ╱   (218 tests)     ╲
└───────────────────┘
```

### 1. Unit Tests（ユニットテスト）

**対象**: Domain層、Application層、Infrastructure層の個別クラス

**配置**: `src/__tests__/unit/`

**テストケース例**:
- Domain層:
  - 値オブジェクトの生成・変換
  - エンティティのビジネスロジック
  - ドメインサービスのロジック（モックリポジトリ使用）
- Application層:
  - ユースケースの実行（モックサービス使用）
- Infrastructure層:
  - マッパーの変換ロジック
  - リポジトリの実装（モックDB使用）

**実行**:
```bash
pnpm test:unit
```

### 2. Integration Tests（統合テスト）

**対象**: コントローラー（Presentation層）

**配置**: `src/__tests__/integration/`

**テストケース**:
- BusController: パラメータ処理、レスポンス形式、エラーハンドリング
- StopController: 停留所名取得、エラーハンドリング

**実行**:
```bash
pnpm test:integration
```

### 3. E2E Tests（エンドツーエンドテスト）

**状態**: 現在スキップ（`.skip`）

**理由**: 実際のD1データベースとGTFSデータが必要

**将来的な実装**: GitHub ActionsのCIで実行

---

## パフォーマンス最適化

### 1. バッチデータフェッチ（N+1問題の解消）

**問題**:
```typescript
// 悪い例: 各トリップごとにDurable Objectsを呼び出し（N回のRPC）
for (const trip of trips) {
  const tripUpdate = await realtimeRepo.getTripUpdate(trip.id); // N回
}
```

**解決**:
```typescript
// 良い例: 一括取得してMap化（1回のRPC）
const allTripUpdates = await realtimeRepo.getAllTripUpdates(); // 1回
const tripUpdateMap = new Map(
  allTripUpdates.map(update => [update.tripId.value, update])
);

for (const trip of trips) {
  const tripUpdate = tripUpdateMap.get(trip.id); // O(1) lookup
}
```

### 2. Durable Objectsキャッシング

- GTFS Realtimeデータを15分間キャッシュ
- 同一データへの複数リクエストでもAPI呼び出しは最小限

### 3. エッジコンピューティング

- Cloudflare Workersによりユーザーに近いエッジロケーションで実行
- 低レイテンシでのレスポンス提供

---

## 設計の利点

### 1. テスタビリティ

- 各層が独立しているため、モックやスタブで簡単にテスト可能
- 226個のテストが高速に実行可能

### 2. 保守性

- ビジネスロジック（Domain層）が外部技術から分離
- フレームワークやDBの変更が容易

### 3. 拡張性

- 新しいユースケースの追加が容易
- リポジトリの実装を切り替え可能（D1 → PostgreSQL など）

### 4. 可読性

- 責務が明確に分離されている
- コードの配置場所が予測しやすい

---

## 今後の改善案

1. **E2Eテストの実装**: CI環境でのE2Eテスト自動化
2. **キャッシュ戦略の拡張**: 静的データのKVキャッシュ活用
3. **監視とロギング**: Cloudflare Analyticsとの統合
4. **APIバージョニング**: `/v1/api/...` のようなバージョン管理
5. **認証・認可**: 必要に応じてAPI Keyベースの認証追加

---

## まとめ

KuruPiro APIは、クリーンアーキテクチャの原則に忠実に設計されており、ビジネスロジックと技術的詳細を明確に分離しています。これにより、高い品質、テスタビリティ、保守性を実現しています。
