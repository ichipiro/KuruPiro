#!/usr/bin/env node
/**
 * Pre-process GTFS data and upload to Cloudflare D1
 * This runs in GitHub Actions
 */
import { unzipSync, strFromU8 } from 'fflate';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '19fc1347cce15e26c18cd792616f737c';
const DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID || '072a7020-ff60-4958-8def-48017c0df486';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const GTFS_URL = process.env.GTFS_STATIC_URL || 'https://ajt-mobusta-gtfs.mcapps.jp/static/8/current_data.zip';

if (!API_TOKEN) {
  console.error('Error: CLOUDFLARE_API_TOKEN environment variable required');
  process.exit(1);
}

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

async function uploadToD1(sql) {
  const tempFile = join(__dirname, 'temp-import.sql');
  writeFileSync(tempFile, sql);

  console.log('Uploading to D1 via Cloudflare API...');

  // D1のバッチAPIを使用
  const chunks = [];
  const statements = sql.split('\n').filter(line => line.trim() && !line.startsWith('--'));

  // 1000行ごとにチャンク分割（D1の制限）
  const BATCH_SIZE = 1000;
  for (let i = 0; i < statements.length; i += BATCH_SIZE) {
    chunks.push(statements.slice(i, i + BATCH_SIZE));
  }

  console.log(`Uploading ${chunks.length} batches...`);

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Uploading batch ${i + 1}/${chunks.length}...`);
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: chunks[i].join('\n')
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to upload batch ${i + 1}: ${response.status} ${error}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(`D1 query failed: ${JSON.stringify(result.errors)}`);
    }
  }
}

async function getCurrentETag() {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: "SELECT value FROM gtfs_metadata WHERE key = 'gtfs_etag'"
        })
      }
    );

    if (!response.ok) {
      console.log('Could not fetch current ETag (database might be empty)');
      return null;
    }

    const result = await response.json();
    if (result.success && result.result?.[0]?.results?.length > 0) {
      return result.result[0].results[0].value;
    }
    return null;
  } catch (error) {
    console.log('Error fetching current ETag:', error.message);
    return null;
  }
}

async function main() {
  // Step 1: Check ETag without downloading
  console.log('Checking GTFS data ETag from:', GTFS_URL);
  const headResponse = await fetch(GTFS_URL, { method: 'HEAD' });
  if (!headResponse.ok) {
    throw new Error(`Failed to check GTFS data: ${headResponse.status}`);
  }

  const newETag = headResponse.headers.get('etag')?.replace(/"/g, '');
  const lastModified = headResponse.headers.get('last-modified');
  console.log(`Remote ETag: ${newETag}`);
  console.log(`Last Modified: ${lastModified}`);

  const currentETag = await getCurrentETag();
  console.log(`Current ETag in D1: ${currentETag || 'none'}`);

  if (currentETag === newETag) {
    console.log('✓ GTFS data unchanged (ETag match). Skipping update.');
    return;
  }

  console.log('GTFS data changed. Downloading and updating D1...');

  // Step 2: Download and process
  console.log('Downloading GTFS data...');
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
  console.log(`Generated ${sql.split('\n').length} SQL statements`);

  // Step 3: Upload to D1
  await uploadToD1(sql);

  // Step 4: Save new ETag
  console.log('Saving new ETag to D1...');
  const etagSql = `INSERT INTO gtfs_metadata (key, value, updated_at) VALUES ('gtfs_etag', '${newETag}', ${Date.now()}) ON CONFLICT(key) DO UPDATE SET value = '${newETag}', updated_at = ${Date.now()};`;
  await uploadToD1(etagSql);

  console.log('✓ Successfully uploaded GTFS data to D1!');
  console.log(`✓ Updated ETag to: ${newETag}`);
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
