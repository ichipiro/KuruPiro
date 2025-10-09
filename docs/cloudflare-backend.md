# Cloudflare ベースのバックエンド移行設計

## 目的
既存の FastAPI バックエンドを撤廃し、Cloudflare のみでフロント・バックエンドをホスティングできる構成へ移行する。GTFS 静的データとリアルタイムデータを活用した現在の API 仕様を維持しつつ、Cloudflare Workers / KV / Cron Triggers を利用したサーバーレス構成を構築する。

## 要求仕様の整理
- エンドポイント
  - `GET /api/{stop_id}/{dest_stop_id}?response_size=5`
  - `GET /api/stop/{stop_id}/name`
- 必要データ
  - 静的データ: `stop_times.txt`, `trips.txt`, `calendar.txt`, `routes.txt`, `routes_jp.txt`, `stops.txt`
  - リアルタイムデータ: `trip_updates.bin`, `vehicle_position.bin`, `alerts.bin`
- 共通ロジック
  - バス停 ID 正規化（スペース→アンダースコア）
  - 目的地 ID の前方一致パターン (`*_`)
  - 曜日判定 (`calendar.txt`)
  - リアルタイム遅延情報の適用（遅延・ステータス）

## Cloudflare 構成案
### 1. Cloudflare Workers (TypeScript)
- `wrangler.toml` で `main = src/index.ts` を指定。
- 環境変数/バインディング
  - `GTFS_CACHE` : KV Namespace（静的データキャッシュ）
  - `GTFS_REALTIME_CACHE_TTL` : オプション、リアルタイムデータの TTL（デフォルト 15 秒）
- エントリポイント
  - リクエストルータ (`handleRequest`) を実装し、既存 API エンドポイントと互換の JSON レスポンスを返す。
  - レスポンススキーマは既存と同一。

### 2. KV ストレージ
- キー: `gtfs:static` に最新の静的データ（JSON シリアライズ）を保存。
- 保存内容
  - `generatedAt`: 更新時刻
  - `maxEndDate`: `calendar.txt` の `end_date` 最大値
  - `calendar`: service_id -> 曜日フラグ
  - `routes`: route_id -> `route_short_name`, `destination_stop`
  - `trips`: trip_id -> `service_id`, `route_id`
  - `stops`: stop_id -> stop_name
  - `stopTimesByTrip`: trip_id -> `[{ stopId, stopSequence, arrivalTime, departureTime }]`
- 期限管理
  - `calendar.end_date < today` または 24 時間以上経過で再フェッチ。

### 3. Cron Trigger
- 1 日 1 回の Cron (`0 3 * * *`) で静的データの事前更新を実行。
- Worker の `scheduled` ハンドラを実装し、強制的に静的データを再取得。

### 4. リアルタイムデータ
- Cloudflare Worker から `fetch` で `trip_updates.bin` 等を取得。
- `protobufjs/light` + `gtfs-realtime.proto` の JSON Descriptor を利用しデコード。
- 取得結果を 1 リクエスト毎に解析し、`Map<trip_id, TripUpdate>` の形でメモリキャッシュ。
- `Date.now()` と比較し `update_interval`（15 秒）を超えたら再フェッチ。

### 5. 静的データ更新アルゴリズム
1. KV から `gtfs:static` を取得し、JSON をデシリアライズ。
2. `maxEndDate < 今日` または `generatedAt` が 6 時間より古い場合に再取得。
3. 再取得時
   - GTFS ZIP をダウンロードし `fflate` で解凍。
   - 各 CSV を UTF-8 文字列へ変換し、独自 CSV パーサで配列化。
   - 前処理
     - `stop_times` を trip_id ごとにグルーピング＆ stop_sequence 昇順ソート。
     - `trips` と `routes`/`routes_jp` をマージする中間マップを構築。
   - 生成した JSON を KV に保存（`metadata: { maxEndDate }` などを付与して高速判定）。

### 6. リクエスト処理フロー
1. Worker 受信 → `normalizeStopId` → `destination_pattern` 判定。
2. `getStaticData(env)` → `StaticData` を取得。
3. `findCandidateTrips(staticData, origin, destination_pattern, weekday)`
   - 各 `trip_id` の stop_sequence を参照し、`origin.sequence < destination.sequence` を満たすものを抽出。
   - 曜日フラグを参照。
4. `getRealtimeDelay(env, trip_id, origin_sequence)` で遅延を取得。
5. 遅延を加味した出発時刻計算 → `remaining_time`/`delay`/`status` を整形。
6. レスポンス配列を `arrival_time` 昇順で `response_size` 件に絞り返却。

### 7. ローカル開発フロー
1. `cd cloudflare-worker`
2. `npm install`
3. `npm run dev`（`wrangler dev`）でローカル確認。
4. `npm run deploy`（`wrangler deploy`）で Cloudflare にデプロイ。

### 8. マイグレーション手順
1. Cloudflare アカウントで KV Namespace 作成 (`wrangler kv:namespace create "GTFS_CACHE"`)。
2. `wrangler.toml` にバインド ID を追加。
3. GitHub Actions または Cloudflare Pages Deploy Hooks で `npm run deploy` を実行し、自動デプロイを構築。
4. Frontend 側の API ベース URL を Cloudflare Worker のエンドポイントに変更。

## 実装方針のまとめ
- TypeScript ベースの Cloudflare Worker にフルリプレース。
- 静的データは KV + メモリキャッシュで高速化。
- リアルタイムデータは `protobufjs` を用いて Worker 内でデコード。
- Cron Trigger により静的データを安定供給。
- 今回の PR では Worker プロジェクトの雛形と主要ロジックを実装し、既存 FastAPI は保持（段階的切替を想定）。

