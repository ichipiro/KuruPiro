-- GTFS Static Data Tables for KuruPiro

-- Trips table
CREATE TABLE IF NOT EXISTS gtfs_trips (
  trip_id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  trip_headsign TEXT,
  direction_id INTEGER
);

-- Stop Times table (largest table)
CREATE TABLE IF NOT EXISTS gtfs_stop_times (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id TEXT NOT NULL,
  stop_id TEXT NOT NULL,
  stop_sequence INTEGER NOT NULL,
  arrival_time TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES gtfs_trips(trip_id)
);

-- Routes table
CREATE TABLE IF NOT EXISTS gtfs_routes (
  route_id TEXT PRIMARY KEY,
  route_short_name TEXT NOT NULL,
  destination_stop TEXT
);

-- Calendar table
CREATE TABLE IF NOT EXISTS gtfs_calendar (
  service_id TEXT PRIMARY KEY,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  monday INTEGER NOT NULL,
  tuesday INTEGER NOT NULL,
  wednesday INTEGER NOT NULL,
  thursday INTEGER NOT NULL,
  friday INTEGER NOT NULL,
  saturday INTEGER NOT NULL,
  sunday INTEGER NOT NULL
);

-- Stops table
CREATE TABLE IF NOT EXISTS gtfs_stops (
  stop_id TEXT PRIMARY KEY,
  stop_name TEXT NOT NULL
);

-- Metadata table to track data freshness
CREATE TABLE IF NOT EXISTS gtfs_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stop_times_stop_id ON gtfs_stop_times(stop_id);
CREATE INDEX IF NOT EXISTS idx_stop_times_trip_id ON gtfs_stop_times(trip_id);
CREATE INDEX IF NOT EXISTS idx_stop_times_trip_stop ON gtfs_stop_times(trip_id, stop_sequence);
CREATE INDEX IF NOT EXISTS idx_trips_service_id ON gtfs_trips(service_id);
CREATE INDEX IF NOT EXISTS idx_trips_route_id ON gtfs_trips(route_id);
