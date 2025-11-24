CREATE TABLE `gtfs_calendar` (
	`service_id` text PRIMARY KEY NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`monday` integer NOT NULL,
	`tuesday` integer NOT NULL,
	`wednesday` integer NOT NULL,
	`thursday` integer NOT NULL,
	`friday` integer NOT NULL,
	`saturday` integer NOT NULL,
	`sunday` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gtfs_metadata` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gtfs_routes` (
	`route_id` text PRIMARY KEY NOT NULL,
	`route_short_name` text NOT NULL,
	`destination_stop` text
);
--> statement-breakpoint
CREATE TABLE `gtfs_stop_times` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trip_id` text NOT NULL,
	`stop_id` text NOT NULL,
	`stop_sequence` integer NOT NULL,
	`arrival_time` text NOT NULL,
	`departure_time` text NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `gtfs_trips`(`trip_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_stop_times_stop_id` ON `gtfs_stop_times` (`stop_id`);--> statement-breakpoint
CREATE INDEX `idx_stop_times_trip_id` ON `gtfs_stop_times` (`trip_id`);--> statement-breakpoint
CREATE INDEX `idx_stop_times_trip_stop` ON `gtfs_stop_times` (`trip_id`,`stop_sequence`);--> statement-breakpoint
CREATE TABLE `gtfs_stops` (
	`stop_id` text PRIMARY KEY NOT NULL,
	`stop_name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gtfs_trips` (
	`trip_id` text PRIMARY KEY NOT NULL,
	`route_id` text NOT NULL,
	`service_id` text NOT NULL,
	`trip_headsign` text,
	`direction_id` integer
);
--> statement-breakpoint
CREATE INDEX `idx_trips_service_id` ON `gtfs_trips` (`service_id`);--> statement-breakpoint
CREATE INDEX `idx_trips_route_id` ON `gtfs_trips` (`route_id`);