# リファクタリング計画

次のセッションでの作業メモ

## 目標

- 最低限のクリーンアーキテクチャに留める
- 不要なフォルダを削除・統合する
- 不要なコードを削除する
- もっと簡潔な実装にしつつ、必要な実装を残す
- GTFSの癖をドキュメント化する

## 現在の問題点

### 1. 空フォルダが大量に存在（20個）
```
src/shared/*
src/application/mappers/
src/domain/errors/
src/infrastructure/realtime/
src/infrastructure/persistence/drizzle/
src/presentation/http/middleware/
src/__tests__/unit/presentation/controllers/
src/__tests__/integration/durable-objects/
src/__tests__/integration/repositories/
src/__tests__/integration/external/
src/__tests__/e2e/setup/
src/__tests__/e2e/api/
src/__tests__/helpers/mocks/
src/__tests__/helpers/factories/
src/application/use-cases/FindNextBuses/
src/application/use-cases/CacheRealtimeData/
src/application/use-cases/GetStopName/
```

### 2. presentation層の重複構造
```
src/presentation/
├── controllers/          # 実際に使用中
│   ├── BusController.ts
│   └── StopController.ts
└── http/
    ├── controllers/      # 空（重複）
    ├── mappers/          # 空
    ├── middleware/       # 空（重複）
    ├── routes/           # 空
    └── validators/       # 空
```

### 3. types関連の重複
```
src/types.ts              # 実際に使用中
src/types/api.ts          # 空？
src/shared/types/         # 空
```

### 4. use-cases構造の不統一
```
src/application/use-cases/
├── FindNextBusesUseCase.ts      # ファイル
├── GetStopNameUseCase.ts        # ファイル
├── FindNextBuses/               # 空フォルダ
├── CacheRealtimeData/           # 空フォルダ
└── GetStopName/                 # 空フォルダ
```

## リファクタリング作業項目

### Phase 1: 空フォルダ削除
- [ ] `src/shared/*` 全削除
- [ ] `src/application/mappers/` 削除
- [ ] `src/domain/errors/` 削除
- [ ] `src/infrastructure/realtime/` 削除
- [ ] `src/infrastructure/persistence/drizzle/` 削除
- [ ] `src/presentation/http/*` 全削除（親フォルダごと）
- [ ] `src/types/` フォルダ削除（src/types.tsは残す）
- [ ] use-cases内の空フォルダ削除

### Phase 2: テスト構造簡素化
- [ ] `src/__tests__/e2e/` 削除（使われていない）
- [ ] `src/__tests__/helpers/` 削除（空）
- [ ] `src/__tests__/integration/` 内の空フォルダ削除
- [ ] `src/__tests__/unit/presentation/` 削除（空）

### Phase 3: フォルダ統合検討
- [ ] `infrastructure/persistence/mappers/` を削除または統合
- [ ] `infrastructure/persistence/queries/` 内を整理
- [ ] `infrastructure/persistence/repositories/` 内を整理

### Phase 4: ドキュメント作成
`docs/` フォルダを作成し、以下を文書化：

#### docs/gtfs-quirks.md
このプロジェクトで使用しているGTFS Realtimeフィードの癖：

1. **stopIdにスペースが含まれる（GTFS仕様違反）**
   - 例: `"6410 1"` `"10 50"`
   - 対応: ProtobufDecoderでスペースをアンダースコアに置換

2. **scheduleRelationshipは常に0 (SCHEDULED)**
   - SKIPPED (1) / NO_DATA (2) は使用されない
   - 到着判定には使えない

3. **到着済み停留所はフィードから削除される**
   - StopTimeUpdateが存在しない = 到着済み
   - これが最も正確な到着判定方法

4. **Unix timestampが利用可能**
   - `arrivalTime` / `departureTime` フィールド
   - delay計算より正確

5. **遅延情報の優先度**
   - departureDelay > arrivalDelay
   - StopTimeUpdate.getRepresentativeDelay()で取得

#### docs/architecture.md
簡素化後のアーキテクチャ説明

#### docs/development.md
開発環境セットアップ手順

## 削除候補のコード

### 使われていない可能性のあるファイル
- [ ] `src/__tests__/integration/api.test.ts.skip`
- [ ] presentation/workers/scheduled/* （scheduled workerは使ってる？）
- [ ] infrastructure/external/gtfs/protobuf/ （空フォルダ）

## 最終的な理想構造

```
src/
├── application/
│   ├── dto/
│   │   └── NextBusDTO.ts
│   └── use-cases/
│       ├── FindNextBusesUseCase.ts
│       └── GetStopNameUseCase.ts
├── domain/
│   ├── entities/
│   ├── repositories/
│   ├── services/
│   └── value-objects/
├── infrastructure/
│   ├── di/
│   │   └── ServiceFactory.ts
│   ├── external/
│   │   ├── durable-objects/
│   │   └── gtfs/
│   └── persistence/
│       ├── mappers/
│       ├── queries/
│       └── repositories/
├── presentation/
│   ├── controllers/
│   └── middleware/
├── __tests__/
│   ├── integration/
│   ├── unit/
│   └── setup/
├── db/
├── index.ts
├── realtimeCache.ts
└── types.ts
```

## 実施順序

1. 空フォルダを全削除（破壊的変更なし）
2. ドキュメント作成
3. テスト実行して動作確認
4. コミット
5. より深いリファクタリング検討

## 備考

- クリーンアーキテクチャの4層は維持（Domain, Application, Infrastructure, Presentation）
- 過度な抽象化を避ける
- このプロジェクト規模では「最低限」で十分
