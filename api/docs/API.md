# KuruPiro API 仕様書

## ベースURL

```
https://your-worker.your-subdomain.workers.dev
```

ローカル開発環境:
```
http://localhost:8787
```

## 認証

現在、認証は不要です。すべてのエンドポイントは公開されています。

## エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/` | ヘルスチェック |
| GET | `/api/:stop_id/:dest_stop_id` | 次のバスを検索 |
| GET | `/api/stop/:stop_id/name` | 停留所名を取得 |

---

## 1. ヘルスチェック

APIの稼働状態を確認します。

### リクエスト

```http
GET / HTTP/1.1
Host: your-worker.your-subdomain.workers.dev
```

### レスポンス

**ステータスコード:** `200 OK`

```json
{
  "status": "healthy"
}
```

### フィールド説明

| フィールド | 型 | 説明 |
|----------|-----|------|
| status | string | APIの状態 ("healthy") |

### 使用例

```bash
curl https://your-worker.your-subdomain.workers.dev/
```

---

## 2. 次のバスを検索

出発地と目的地を指定して、次に利用可能なバスを検索します。リアルタイムの遅延情報も含まれます。

### リクエスト

```http
GET /api/:stop_id/:dest_stop_id?response_size=5 HTTP/1.1
Host: your-worker.your-subdomain.workers.dev
```

### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|----------|-----|------|------|
| stop_id | string | ✓ | 出発地の停留所ID |
| dest_stop_id | string | ✓ | 目的地の停留所ID |

### クエリパラメータ

| パラメータ | 型 | 必須 | デフォルト | 範囲 | 説明 |
|----------|-----|------|----------|------|------|
| response_size | integer | - | 5 | 1-20 | 返却する結果の最大件数 |

### レスポンス

**ステータスコード:** `200 OK`

```json
[
  {
    "trip_id": "trip_12345_20250106",
    "trip_short_id": "1",
    "arrival_time": "10:30",
    "remaining_time": "あと35分",
    "delay": "5分遅れ",
    "trip_dest": "○○駅前"
  },
  {
    "trip_id": "trip_12346_20250106",
    "trip_short_id": "2",
    "arrival_time": "10:45",
    "remaining_time": "あと50分",
    "delay": "",
    "trip_dest": "△△ターミナル"
  }
]
```

### フィールド説明

| フィールド | 型 | 説明 |
|----------|-----|------|
| trip_id | string | トリップID（ユニークな運行識別子） |
| trip_short_id | string | 路線番号（例: "1", "2A"） |
| arrival_time | string | 予定到着時刻（HH:mm形式） |
| remaining_time | string | 残り時間の日本語表記（例: "あと35分"） |
| delay | string | 遅延表示（例: "5分遅れ", "2分早着"）。遅延なしの場合は空文字列 |
| trip_dest | string | 行き先（終点の停留所名） |

### エラーレスポンス

#### パラメータ不足

**ステータスコード:** `400 Bad Request`

```json
{
  "error": "stop_id and dest_stop_id are required"
}
```

#### サーバーエラー

**ステータスコード:** `500 Internal Server Error`

```json
{
  "error": "Database connection failed"
}
```

### 使用例

#### 基本的な使用

```bash
curl "https://your-worker.your-subdomain.workers.dev/api/stop_001/stop_010"
```

#### レスポンスサイズを指定

```bash
curl "https://your-worker.your-subdomain.workers.dev/api/stop_001/stop_010?response_size=10"
```

#### JavaScriptでの使用

```javascript
const fetchNextBuses = async (originStopId, destStopId, responseSize = 5) => {
  const url = `https://your-worker.your-subdomain.workers.dev/api/${originStopId}/${destStopId}?response_size=${responseSize}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buses = await response.json();
    return buses;
  } catch (error) {
    console.error('Failed to fetch next buses:', error);
    throw error;
  }
};

// 使用例
fetchNextBuses('stop_001', 'stop_010', 10)
  .then(buses => {
    buses.forEach(bus => {
      console.log(`路線${bus.trip_short_id}: ${bus.arrival_time} (${bus.remaining_time}) ${bus.delay}`);
    });
  });
```

### 備考

- 結果は到着時刻が早い順（残り時間が短い順）にソートされています
- リアルタイムの遅延情報が利用可能な場合、`delay`フィールドに遅延時間が表示されます
- リアルタイムデータは15分ごとに更新されます
- GTFS仕様に従い、24時間を超える時刻（例: 25:30）も扱えます（翌日の1:30を意味）
- 該当するバスが見つからない場合、空の配列`[]`が返されます

---

## 3. 停留所名を取得

停留所IDから停留所の名称を取得します。

### リクエスト

```http
GET /api/stop/:stop_id/name HTTP/1.1
Host: your-worker.your-subdomain.workers.dev
```

### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|----------|-----|------|------|
| stop_id | string | ✓ | 停留所ID |

### レスポンス

**ステータスコード:** `200 OK`

```json
{
  "stop_id": "stop_001",
  "name": "東京駅八重洲口"
}
```

### フィールド説明

| フィールド | 型 | 説明 |
|----------|-----|------|
| stop_id | string | リクエストされた停留所ID |
| name | string \| null | 停留所名。存在しない場合は`null` |

### エラーレスポンス

#### パラメータ不足

**ステータスコード:** `400 Bad Request`

```json
{
  "error": "stop_id is required"
}
```

#### サーバーエラー

**ステータスコード:** `500 Internal Server Error`

```json
{
  "error": "Database query failed"
}
```

### 使用例

#### 基本的な使用

```bash
curl "https://your-worker.your-subdomain.workers.dev/api/stop/stop_001/name"
```

#### 存在しない停留所

```bash
curl "https://your-worker.your-subdomain.workers.dev/api/stop/unknown_stop/name"
```

レスポンス:
```json
{
  "stop_id": "unknown_stop",
  "name": null
}
```

#### JavaScriptでの使用

```javascript
const getStopName = async (stopId) => {
  const url = `https://your-worker.your-subdomain.workers.dev/api/stop/${stopId}/name`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.name;
  } catch (error) {
    console.error('Failed to fetch stop name:', error);
    throw error;
  }
};

// 使用例
getStopName('stop_001')
  .then(name => {
    if (name) {
      console.log(`停留所名: ${name}`);
    } else {
      console.log('停留所が見つかりませんでした');
    }
  });
```

### 備考

- 停留所が存在しない場合でも、ステータスコード`200`が返され、`name`フィールドが`null`になります
- エラー（ステータスコード`4xx`/`5xx`）は、パラメータ不足またはサーバー内部エラーの場合のみ発生します

---

## HTTPステータスコード一覧

| コード | 説明 |
|-------|------|
| 200 | 成功 |
| 400 | リクエストパラメータが不正 |
| 500 | サーバー内部エラー |

## エラーハンドリング

すべてのエラーレスポンスは以下の形式で返されます:

```json
{
  "error": "エラーメッセージ"
}
```

クライアント側では、HTTPステータスコードと`error`フィールドを確認してエラーハンドリングを行ってください。

## レート制限

現在、レート制限は設定されていません。

## CORS (Cross-Origin Resource Sharing)

すべてのオリジンからのリクエストを許可しています。

## データ更新頻度

- **GTFSスタティックデータ**: 日次更新（午前3時JST、GitHub Actions経由）
- **GTFSリアルタイムデータ**: 15分ごとに更新（Durable Objects経由でキャッシュ）

## パフォーマンス

- **平均レスポンス時間**: < 100ms (エッジロケーションに依存)
- **キャッシュ戦略**:
  - リアルタイムデータ: Durable Objectsで15分間キャッシュ
  - 静的データ: Cloudflare D1（SQLite）で永続化
- **最適化**: バッチデータフェッチによるN+1問題の解消

## バージョニング

現在のバージョン: `v0.1.0`

APIのバージョニングは、将来的にパスに含める予定です（例: `/v1/api/...`）。

## サポート

問題や質問がある場合は、GitHubリポジトリのIssuesセクションで報告してください。
