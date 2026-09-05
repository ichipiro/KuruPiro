-- gtfs_stop_times のインデックスを 3本 → 2本（カバリング）に張り替える。
--
-- D1 の rows written はインデックスへの書き込みも計上するため、本数を減らすことが
-- そのまま日次GTFS取り込みの書き込み行数削減になる。
-- 同時に、出発地側は (stop_id, arrival_time) でシークでき、目的地側は
-- (trip_id, stop_id) で範囲シークできるようになり、rows read も大きく減る。
--
-- 注: drizzle-kit が生成する `id` の AUTOINCREMENT 除去はテーブル再作成（26万行のコピー）を
--     伴い書き込み枠を浪費するため、ここでは行わない。
--     database/scripts/build-and-upload-d1.mjs が DROP TABLE / CREATE TABLE で
--     新しい定義を適用するので、次回のGTFS取り込み時に反映される。
DROP INDEX IF EXISTS `idx_stop_times_stop_id`;--> statement-breakpoint
DROP INDEX IF EXISTS `idx_stop_times_trip_id`;--> statement-breakpoint
DROP INDEX IF EXISTS `idx_stop_times_trip_stop`;--> statement-breakpoint
CREATE INDEX `idx_stop_times_stop_arrival` ON `gtfs_stop_times` (`stop_id`,`arrival_time`,`trip_id`,`stop_sequence`);--> statement-breakpoint
CREATE INDEX `idx_stop_times_trip_stop` ON `gtfs_stop_times` (`trip_id`,`stop_id`,`stop_sequence`);--> statement-breakpoint
ANALYZE;
