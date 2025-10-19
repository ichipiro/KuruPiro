#!/usr/bin/env node
/**
 * Pre-process GTFS data and upload to LOCAL D1 for development
 */
import { unzipSync, strFromU8 } from 'fflate';
import { writeFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const GTFS_URL = process.env.GTFS_STATIC_URL || 'https://ajt-mobusta-gtfs.mcapps.jp/static/8/current_data.zip';

const WEEKDAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function parseCSV(content) {
  const rows = [];
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  if (lines.length === 0) return rows;

  const header = splitCsvLine(lines[0]);
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cols = splitCsvLine(line);
    const row = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = cols[j] ?? '';
    }
    rows.push(row);
  }
  return rows;
}

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === ',') {
        result.push(current);
        current = '';
      } else if (char === '"') {
        inQuotes = true;
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

function toInt(value, fallback = 0) {
  if (!value) return fallback;
  const num = parseInt(value, 10);
  return isNaN(num) ? fallback : num;
}

function normalizeStopId(stopId) {
  return stopId.replace(/ /g, '_');
}

function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function generateInsertStatements(files) {
  const text = (filename) => {
    const file = files[filename];
    if (!file) throw new Error(`GTFS file missing: ${filename}`);
    return strFromU8(file);
  };

  console.log('Parsing GTFS files...');
  const stopTimesRows = parseCSV(text('stop_times.txt'));
  const tripsRows = parseCSV(text('trips.txt'));
  const calendarRows = parseCSV(text('calendar.txt'));
  const routesRows = parseCSV(text('routes.txt'));
  const routesJpRows = parseCSV(text('routes_jp.txt'));
  const stopsRows = parseCSV(text('stops.txt'));

  let sql = '-- Clear existing data\n';
  sql += 'DELETE FROM gtfs_stop_times;\n';
  sql += 'DELETE FROM gtfs_trips;\n';
  sql += 'DELETE FROM gtfs_routes;\n';
  sql += 'DELETE FROM gtfs_calendar;\n';
  sql += 'DELETE FROM gtfs_stops;\n';
  sql += 'DELETE FROM gtfs_metadata;\n\n';

  // Insert stops
  console.log('Generating stops inserts...');
  for (const row of stopsRows) {
    const stopId = normalizeStopId(row['stop_id'] ?? '');
    const stopName = row['stop_name'] ?? '';
    if (!stopId) continue;
    sql += `INSERT INTO gtfs_stops (stop_id, stop_name) VALUES (${escapeSQL(stopId)}, ${escapeSQL(stopName)});\n`;
  }

  // Insert routes
  console.log('Generating routes inserts...');
  const routesMap = {};
  for (const row of routesRows) {
    const routeId = row['route_id'];
    if (!routeId) continue;
    routesMap[routeId] = {
      routeId,
      routeShortName: row['route_short_name'] ?? '',
      destinationStop: null,
    };
  }
  for (const row of routesJpRows) {
    const routeId = row['route_id'];
    if (!routeId) continue;
    if (routesMap[routeId]) {
      routesMap[routeId].destinationStop = row['destination_stop'] || null;
    }
  }
  for (const route of Object.values(routesMap)) {
    sql += `INSERT INTO gtfs_routes (route_id, route_short_name, destination_stop) VALUES (${escapeSQL(route.routeId)}, ${escapeSQL(route.routeShortName)}, ${escapeSQL(route.destinationStop)});\n`;
  }

  // Insert calendar
  console.log('Generating calendar inserts...');
  for (const row of calendarRows) {
    const serviceId = row['service_id'];
    if (!serviceId) continue;
    const weekdays = WEEKDAY_KEYS.map((key) => row[key] === '1' ? 1 : 0);
    sql += `INSERT INTO gtfs_calendar (service_id, start_date, end_date, monday, tuesday, wednesday, thursday, friday, saturday, sunday) VALUES (${escapeSQL(serviceId)}, ${escapeSQL(row['start_date'])}, ${escapeSQL(row['end_date'])}, ${weekdays.join(', ')});\n`;
  }

  // Insert trips
  console.log('Generating trips inserts...');
  for (const row of tripsRows) {
    const tripId = row['trip_id'];
    if (!tripId) continue;
    const directionId = row['direction_id'] ? toInt(row['direction_id']) : null;
    sql += `INSERT INTO gtfs_trips (trip_id, route_id, service_id, trip_headsign, direction_id) VALUES (${escapeSQL(tripId)}, ${escapeSQL(row['route_id'])}, ${escapeSQL(row['service_id'])}, ${escapeSQL(row['trip_headsign'] || null)}, ${directionId === null ? 'NULL' : directionId});\n`;
  }

  // Insert stop_times
  console.log('Generating stop_times inserts...');
  for (const row of stopTimesRows) {
    const tripId = row['trip_id'];
    if (!tripId) continue;
    const stopId = normalizeStopId(row['stop_id'] ?? '');
    const stopSequence = toInt(row['stop_sequence']);
    const arrivalTime = row['arrival_time'] ?? '00:00:00';
    const departureTime = row['departure_time'] ?? arrivalTime;
    sql += `INSERT INTO gtfs_stop_times (trip_id, stop_id, stop_sequence, arrival_time, departure_time) VALUES (${escapeSQL(tripId)}, ${escapeSQL(stopId)}, ${stopSequence}, ${escapeSQL(arrivalTime)}, ${escapeSQL(departureTime)});\n`;
  }

  // Insert metadata
  sql += `INSERT INTO gtfs_metadata (key, value, updated_at) VALUES ('last_updated', '${new Date().toISOString()}', ${Date.now()});\n`;

  return sql;
}

async function main() {
  console.log('Downloading GTFS data from:', GTFS_URL);
  const response = await fetch(GTFS_URL);
  if (!response.ok) {
    throw new Error(`Failed to download GTFS: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  console.log(`Downloaded ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);

  console.log('Unzipping...');
  const files = unzipSync(new Uint8Array(arrayBuffer));
  console.log(`Extracted ${Object.keys(files).length} files`);

  console.log('Processing GTFS data...');
  const sql = generateInsertStatements(files);

  const sqlFile = './scripts/temp-import-local.sql';
  writeFileSync(sqlFile, sql);
  console.log(`Wrote SQL to ${sqlFile}`);
  console.log(`Total statements: ${sql.split('\n').filter(l => l.trim() && !l.startsWith('--')).length}`);

  console.log('Uploading to local D1...');
  const { stdout, stderr } = await execAsync(`npx wrangler d1 execute kurupiro-db --local --file=${sqlFile}`, {
    maxBuffer: 50 * 1024 * 1024 // 50MB
  });
  console.log(stdout);
  if (stderr) console.error(stderr);

  console.log('✓ Successfully uploaded GTFS data to local D1!');
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
