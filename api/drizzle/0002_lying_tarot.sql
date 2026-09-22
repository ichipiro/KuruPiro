CREATE TABLE IF NOT EXISTS `gtfs_calendar_dates` (
	`service_id` text NOT NULL,
	`date` text NOT NULL,
	`exception_type` integer NOT NULL,
	PRIMARY KEY(`service_id`, `date`)
);
