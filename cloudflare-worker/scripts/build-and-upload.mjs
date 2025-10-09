#!/usr/bin/env node
/**
 * Pre-process GTFS data and upload to Cloudflare KV
 * This runs in GitHub Actions to avoid Worker memory limits
 */
import { unzipSync, strFromU8 } from 'fflate';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load from environment or wrangler.toml
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '19fc1347cce15e26c18cd792616f737c';
const KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID || '49a3e4dd915c4ba08ba21c20cdf0793c';
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

function buildStaticData(files) {
  const text = (filename) => {
    const file = files[filename];
    if (!file) throw new Error(`GTFS file missing: ${filename}`);
    return strFromU8(file);
  };

  console.log('Parsing stop_times.txt...');
  const stopTimesRows = parseCSV(text('stop_times.txt'));
  console.log('Parsing trips.txt...');
  const tripsRows = parseCSV(text('trips.txt'));
  console.log('Parsing calendar.txt...');
  const calendarRows = parseCSV(text('calendar.txt'));
  console.log('Parsing routes.txt...');
  const routesRows = parseCSV(text('routes.txt'));
  console.log('Parsing routes_jp.txt...');
  const routesJpRows = parseCSV(text('routes_jp.txt'));
  console.log('Parsing stops.txt...');
  const stopsRows = parseCSV(text('stops.txt'));

  console.log('Building stop times index...');
  const stopTimesByTrip = {};
  for (const row of stopTimesRows) {
    const tripId = row['trip_id'];
    if (!tripId) continue;
    const bucket = stopTimesByTrip[tripId] ?? (stopTimesByTrip[tripId] = []);
    bucket.push({
      tripId,
      arrivalTime: row['arrival_time'] ?? '00:00:00',
      departureTime: row['departure_time'] ?? row['arrival_time'] ?? '00:00:00',
      stopId: normalizeStopId(row['stop_id'] ?? ''),
      stopSequence: toInt(row['stop_sequence']),
    });
  }
  for (const stops of Object.values(stopTimesByTrip)) {
    stops.sort((a, b) => a.stopSequence - b.stopSequence);
  }

  console.log('Building trips index...');
  const trips = {};
  for (const row of tripsRows) {
    const tripId = row['trip_id'];
    if (!tripId) continue;
    trips[tripId] = {
      tripId,
      routeId: row['route_id'] ?? '',
      serviceId: row['service_id'] ?? '',
      tripHeadsign: row['trip_headsign'] || undefined,
      directionId: row['direction_id'] ? toInt(row['direction_id']) : undefined,
    };
  }

  console.log('Building routes index...');
  const routes = {};
  for (const row of routesRows) {
    const routeId = row['route_id'];
    if (!routeId) continue;
    routes[routeId] = {
      routeId,
      routeShortName: row['route_short_name'] ?? '',
      destinationStop: undefined,
    };
  }
  for (const row of routesJpRows) {
    const routeId = row['route_id'];
    if (!routeId) continue;
    const entry = routes[routeId] ?? { routeId, routeShortName: '', destinationStop: undefined };
    entry.destinationStop = row['destination_stop'] ?? entry.destinationStop;
    routes[routeId] = entry;
  }

  console.log('Building calendar index...');
  const calendar = {};
  let maxEndDate = '00000000';
  for (const row of calendarRows) {
    const serviceId = row['service_id'];
    if (!serviceId) continue;
    const weekdays = WEEKDAY_KEYS.map((key) => row[key] === '1');
    const entry = {
      serviceId,
      startDate: row['start_date'] ?? '00000000',
      endDate: row['end_date'] ?? '00000000',
      weekdays,
    };
    calendar[serviceId] = entry;
    if (entry.endDate > maxEndDate) {
      maxEndDate = entry.endDate;
    }
  }

  console.log('Building stop names index...');
  const stopNames = {};
  for (const row of stopsRows) {
    const stopId = row['stop_id'];
    if (!stopId) continue;
    stopNames[normalizeStopId(stopId)] = row['stop_name'] ?? '';
  }

  return {
    generatedAt: Date.now(),
    maxEndDate,
    stopNames,
    stopTimesByTrip,
    trips,
    routes,
    calendar,
  };
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
  const data = buildStaticData(files);

  const payload = {
    version: 1,
    data,
  };

  const payloadStr = JSON.stringify(payload);
  console.log(`Payload size: ${(payloadStr.length / 1024 / 1024).toFixed(2)} MB`);

  // KVの制限は25MBなので、データを複数のチャンクに分割
  const MAX_CHUNK_SIZE = 20 * 1024 * 1024; // 20MB (安全マージン)

  if (payloadStr.length > MAX_CHUNK_SIZE) {
    console.log('Data exceeds 25MB limit. Splitting into chunks...');

    // メタデータを保存
    const metadata = {
      version: 1,
      chunkCount: Math.ceil(payloadStr.length / MAX_CHUNK_SIZE),
      totalSize: payloadStr.length,
      generatedAt: data.generatedAt,
    };

    console.log(`Splitting into ${metadata.chunkCount} chunks...`);

    // メタデータをアップロード
    console.log('Uploading metadata...');
    await uploadToKV('gtfs:static:meta', JSON.stringify(metadata));

    // チャンクをアップロード
    for (let i = 0; i < metadata.chunkCount; i++) {
      const start = i * MAX_CHUNK_SIZE;
      const end = Math.min(start + MAX_CHUNK_SIZE, payloadStr.length);
      const chunk = payloadStr.slice(start, end);

      console.log(`Uploading chunk ${i + 1}/${metadata.chunkCount} (${(chunk.length / 1024 / 1024).toFixed(2)} MB)...`);
      await uploadToKV(`gtfs:static:chunk:${i}`, chunk);
    }

    console.log('✓ Successfully uploaded GTFS data in chunks!');
  } else {
    console.log('Uploading to Cloudflare KV...');
    await uploadToKV('gtfs:static', payloadStr);
    console.log('✓ Successfully uploaded GTFS data!');
  }
}

async function uploadToKV(key, value) {
  const kvResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${key}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'text/plain',
      },
      body: value,
    }
  );

  if (!kvResponse.ok) {
    const error = await kvResponse.text();
    throw new Error(`Failed to upload to KV: ${kvResponse.status} ${error}`);
  }
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
