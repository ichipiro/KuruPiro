# くるぴろ API ドキュメント

## 概要

広島市立大学周辺のバス到着時刻情報を提供するREST APIです。GTFSリアルタイムフィードを活用し、遅延情報や現在位置を含むリアルタイムなバス情報を返します。

**Base URL:** `https://kurupiro.ichipiro.net`

---

## エンドポイント

### 1. 次のバス到着時刻を取得

指定したバス停から目的地への次のバス到着時刻を取得します。

#### リクエスト

```
GET /api/{stop_id}/{dest_stop_id}
```

#### クエリパラメータ

| パラメータ | 型 | 必須 | デフォルト | 説明 | 例 |
|----------|-----|------|-----------|------|-----|
| `origin` | string | ✓ | - | 出発地のバス停ID（GTFS stop_id） | `22030_2` |
| `destination` | string | ✓ | - | 目的地のバス停IDパターン | `51240_` |
| `limit` | integer | - | 5 | 取得するバスの最大件数 | `8` |
| `via` | string | - | - | 経由地のバス停ID（カンマ区切り可） | `STOP_C,STOP_D` |

#### レスポンス

**Status Code:** `200 OK`

```json
[
  {
    "trip_id": "20250101_001",
    "trip_short_id": "63",
    "arrival_time": "14:25",
    "remaining_time": "あと5分",
    "delay": "2分遅れ",
    "trip_dest": "広島バスセンター",
    "current_location": "大塚駅前"
  },
  {
    "trip_id": "20250101_002",
    "trip_short_id": "62",
    "arrival_time": "14:35",
    "remaining_time": "あと15分",
    "delay": "",
    "trip_dest": "広島バスセンター",
    "current_location": null
  }
]
```

#### レスポンスフィールド

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `trip_id` | string | 便ID（GTFS trip_id） |
| `trip_short_id` | string | 路線番号（例: "63", "62"） |
| `arrival_time` | string | 到着予定時刻（HH:MM形式） |
| `remaining_time` | string | 残り時間の表示文字列 |
| `delay` | string | 遅延情報（遅延がない場合は空文字） |
| `trip_dest` | string | 目的地のバス停名 |
| `current_location` | string \| null | バスの現在位置（最寄りバス停名）、運行前は`null` |

#### remaining_timeの値

- `"まもなく到着"` - 残り1分以内
- `"あと{N}分"` - 残りN分

#### 使用例

**リクエスト:**

```bash
GET /api/trips?origin=22030_2&destination=51240_&limit=5
```

**説明:**

- 市立大学前（`22030_2`）から
- 広島バスセンター経由（`51240_`）または中広町経由直行（`10_`）
- 次の5本のバスを取得

---

### 2. バス停名を取得

バス停IDからバス停名を取得します。

#### リクエスト

```
GET /api/stop/{stop_id}/name
```

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 | 例 |
|----------|-----|------|------|-----|
| `stop_id` | string | ✓ | バス停ID（GTFS stop_id） | `22030_2` |

#### レスポンス

**Status Code:** `200 OK`

```json
{
  "stop_id": "22030_2",
  "name": "市立大学前"
}
```

#### 使用例

**リクエスト:**

```bash
GET /api/stop/22030_2/name
```

---

## データソース

### GTFS静的データ

- バス停の位置情報（緯度経度）
- 時刻表（定刻）
- 路線情報

### GTFSリアルタイムフィード

- **trip_updates.bin** - 遅延情報
- **vehicle_position.bin** - バスのGPS位置
- **alerts.bin** - 運行情報

---

## 主要な仕様

### 1. 目的地パターンマッチング

`dest_stop_id`に`_`で終わるパターンを指定すると、前方一致でマッチします。

**例:**

- `51240_` → `51240_1`, `51240_2`, `51240_3` などすべてにマッチ
- `51240_,10_` → 複数パターンをカンマ区切りで指定可能

### 2. 遅延情報の取得

GTFSリアルタイムの`trip_updates`から、該当バス停の`stop_sequence`に対応する遅延秒数を取得し、分単位に変換します。

**計算式:**

```
実際の到着時刻 = GTFS静的データの定刻 + リアルタイムのdelay
```

### 3. 現在位置の算出

GTFSリアルタイムの`vehicle_position`からバスのGPS位置を取得し、ハバサイン公式で経由停留所との距離を計算。最も近い停留所名を`current_location`として返します。

**アルゴリズム:**

1. バスのGPS位置（緯度経度）を取得
2. その便が通る全停留所との距離を計算
3. 最短距離の停留所名を返す
4. 位置情報がない場合は`null`

### 4. フィルタリング

- 発車済みのバス（`remainingSeconds < 0`）は除外
- 到着時刻順にソート
- `response_size`件数まで返す

---

## エラーレスポンス

### バス停が見つからない場合

**Status Code:** `500 Internal Server Error` （要改善）

現在、バス停が見つからない場合でも空配列`[]`を返しますが、エラーハンドリングは今後の改善点です。

---

## 使用技術

- **FastAPI** - APIフレームワーク
- **Python 3.11+**
- **pandas** - GTFS静的データの処理
- **google.transit (protobuf)** - GTFSリアルタイムフィードのパース

---

## 実装例（フロントエンド）

### SWRを使った取得

```typescript
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useBusData(stopId: string, destinations: string = '51240_') {
  const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/trips/${stopId}/${destinations}?response_size=8`

  const { data, error, isLoading } = useSWR(apiUrl, fetcher, {
    refreshInterval: 15 * 1000,  // 15秒ごとに更新
    revalidateOnFocus: false,
  })

  return { data, error, isLoading }
}
```

### 使用例

```typescript
// 市立大学前から広島バスセンター行きのバスを取得
const { data } = usePiroBusData()

// 沼田料金所前から広島バスセンター行きのバスを取得
const { data } = useNumaBusData()
```

---

## よくある質問

### Q1. `current_location`が`null`になるのはいつ？

**A:** 以下の場合に`null`になります：

- バスがまだ運行開始していない（追跡前）
- GTFSリアルタイムに位置情報がない
- GPS情報が取得できない

### Q2. 遅延情報はどのくらいの頻度で更新される？

**A:** GTFSリアルタイムフィードの更新頻度に依存します（通常15〜30秒間隔）。フロントエンドでは15秒ごとにポーリングしています。

### Q3. 過去のバスも取得できる？

**A:** いいえ。`remainingSeconds >= 0`でフィルタリングしているため、発車済みのバスは取得できません。

---

## 今後の改善点

- [ ] エラーハンドリングの強化（適切なHTTPステータスコード）
- [ ] APIドキュメントの自動生成（OpenAPI/Swagger）
- [ ] レート制限の実装
- [ ] キャッシュ戦略の最適化
- [ ] ヘルスチェックエンドポイントの追加
