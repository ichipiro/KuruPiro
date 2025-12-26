import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const trips = sqliteTable('gtfs_trips', {
  tripId: text('trip_id').primaryKey(),
  routeId: text('route_id').notNull(),
  serviceId: text('service_id').notNull(),
  tripHeadsign: text('trip_headsign'),
  directionId: integer('direction_id'),
}, (table) => [
  index('idx_trips_service_id').on(table.serviceId),
  index('idx_trips_route_id').on(table.routeId),
]);

export const stopTimes = sqliteTable('gtfs_stop_times', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tripId: text('trip_id').notNull().references(() => trips.tripId),
  stopId: text('stop_id').notNull(),
  stopSequence: integer('stop_sequence').notNull(),
  arrivalTime: text('arrival_time').notNull(),
  departureTime: text('departure_time').notNull(),
}, (table) => [
  index('idx_stop_times_stop_id').on(table.stopId),
  index('idx_stop_times_trip_id').on(table.tripId),
  index('idx_stop_times_trip_stop').on(table.tripId, table.stopSequence),
]);

export const routes = sqliteTable('gtfs_routes', {
  routeId: text('route_id').primaryKey(),
  routeShortName: text('route_short_name').notNull(),
  destinationStop: text('destination_stop'),
});

export const calendar = sqliteTable('gtfs_calendar', {
  serviceId: text('service_id').primaryKey(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  monday: integer('monday').notNull(),
  tuesday: integer('tuesday').notNull(),
  wednesday: integer('wednesday').notNull(),
  thursday: integer('thursday').notNull(),
  friday: integer('friday').notNull(),
  saturday: integer('saturday').notNull(),
  sunday: integer('sunday').notNull(),
});

export const stops = sqliteTable('gtfs_stops', {
  stopId: text('stop_id').primaryKey(),
  stopName: text('stop_name').notNull(),
});

export const metadata = sqliteTable('gtfs_metadata', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
