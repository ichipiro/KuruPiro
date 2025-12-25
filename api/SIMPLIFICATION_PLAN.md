# シンプル化計画

現在: 46ファイル → 目標: 20ファイル程度

## 統合方針

### 1. Value Objects: 6ファイル → 2ファイル

**統合前:**
- `TripId.ts`, `StopId.ts`, `Delay.ts`, `RemainingTime.ts` (小さい)
- `GTFSTime.ts`, `JSTDateTime.ts` (時間系)

**統合後:**
- `domain/value-objects/identifiers.ts` - ID系とシンプルなVO
  - TripId, StopId, Delay, RemainingTime
- `domain/value-objects/time.ts` - 時間系VO
  - GTFSTime, JSTDateTime

削減: **4ファイル**

---

### 2. Repository Interfaces: 6ファイル → 1ファイル

**統合前:**
- 各リポジトリごとに1ファイル（6個）

**統合後:**
- `domain/repositories.ts` にすべてのインターフェースをまとめる

削減: **5ファイル**

---

### 3. Mappers: 5ファイル → 1ファイル

**統合前:**
- RouteMapper, CalendarMapper, TripMapper, StopMapper, StopTimeMapper

**統合後:**
- `infrastructure/persistence/mappers.ts` に全Mapperをまとめる

削減: **4ファイル**

---

### 4. Controllers: 2ファイル → 1ファイル

**統合前:**
- BusController.ts, StopController.ts

**統合後:**
- `presentation/controllers.ts` に両方を含める

削減: **1ファイル**

---

### 5. Middleware: 2ファイル → 1ファイル

**統合前:**
- errorHandler.ts, serviceFactory.ts

**統合後:**
- `presentation/middleware.ts` に統合

削減: **1ファイル**

---

### 6. Repositories: 5ファイル → そのまま（統合しない）

理由: 各リポジトリは十分に大きく、統合すると逆に読みにくくなる

---

### 7. Entities: 6ファイル → そのまま（統合しない）

理由: ドメインの中核概念なので、分離したまま保持

---

### 8. その他の小さな統合

**DTOフォルダ削除:**
- `application/dto/NextBusDTO.ts` → `application/use-cases/FindNextBusesUseCase.ts` 内に移動

削減: **1ファイル** + フォルダ削減

---

## 合計削減数

- Value Objects: -4
- Repository Interfaces: -5
- Mappers: -4
- Controllers: -1
- Middleware: -1
- DTO: -1

**合計: 16ファイル削減**

**最終: 46 → 30ファイル**

---

## 実装順序

1. ✅ types/api.ts を復元
2. Value Objectsを統合
3. Repository interfacesを統合
4. Mappersを統合
5. Controllers/Middlewareを統合
6. DTOを移動
7. テスト実行
8. ドキュメント更新
