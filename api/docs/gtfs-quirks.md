# GTFS Realtime フィードの仕様上の癖

このドキュメントでは、KuruPiroプロジェクトで使用しているGTFS Realtimeフィードの特殊な挙動と対応方法を説明します。

## 1. stopIdにスペースが含まれる（GTFS仕様違反）

### 問題
GTFS仕様では、IDフィールドにスペースを含めることは推奨されていませんが、このフィードでは停留所IDにスペースが含まれています。

**例:**
- `"6410 1"`
- `"10 50"`

### 対応
`ProtobufDecoder`でスペースをアンダースコアに置換して処理しています。

```typescript
// スペースをアンダースコアに変換
const normalizedStopId = stopId.replace(/ /g, '_');
```

---

## 2. scheduleRelationshipは常に0 (SCHEDULED)

### 問題
GTFS Realtimeの`scheduleRelationship`フィールドは、通常以下の値を取ります：
- `0`: SCHEDULED（予定通り）
- `1`: SKIPPED（スキップ）
- `2`: NO_DATA（データなし）

しかし、このフィードでは**常に0 (SCHEDULED)** が設定されます。

### 影響
`scheduleRelationship`を使ってバスの到着判定を行うことができません。

---

## 3. 到着済み停留所はフィードから削除される ⭐重要

### 挙動
バスが停留所に到着すると、その停留所の`StopTimeUpdate`がフィードから**完全に削除**されます。

### 到着判定方法
これが最も正確な到着判定方法です：

```typescript
// StopTimeUpdateが存在しない = 到着済み
const hasArrived = !tripUpdate.stopTimeUpdates.some(
  stu => stu.stopId === targetStopId
);
```

### 実装例
リアルタイムフィードに停留所が存在しない場合、そのバスは既に到着済みと判定し、候補から除外します。

---

## 4. Unix timestampが利用可能

### 提供されるフィールド
各`StopTimeUpdate`には以下のタイムスタンプフィールドが含まれます：
- `arrivalTime`: 到着時刻（Unix timestamp）
- `departureTime`: 出発時刻（Unix timestamp）

### メリット
遅延（delay）から計算するよりも、これらのタイムスタンプを直接使用する方が正確です。

```typescript
// タイムスタンプから直接時刻を取得
const arrivalTimestamp = stopTimeUpdate.arrivalTime;
const arrivalDate = new Date(arrivalTimestamp * 1000);
```

---

## 5. 遅延情報の優先度

### 利用可能な遅延フィールド
- `arrivalDelay`: 到着遅延（秒）
- `departureDelay`: 出発遅延（秒）

### 優先順位
**departureDelay > arrivalDelay**

出発遅延が設定されている場合はそちらを優先し、なければ到着遅延を使用します。

### 実装
`StopTimeUpdate.getRepresentativeDelay()`メソッドで適切な遅延値を取得します：

```typescript
getRepresentativeDelay(): number | undefined {
  return this.departureDelay ?? this.arrivalDelay;
}
```

---

## まとめ

このGTFS Realtimeフィードを扱う際の重要なポイント：

1. ✅ **到着判定**: フィードから削除されているかどうかで判断（最も信頼性が高い）
2. ✅ **時刻計算**: Unix timestampを直接使用
3. ✅ **遅延情報**: departureDelay → arrivalDelay の優先順位で取得
4. ❌ **使えない**: scheduleRelationship（常に0）
5. ⚠️ **注意**: stopIdのスペースは正規化が必要
