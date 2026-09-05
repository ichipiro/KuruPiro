#!/usr/bin/env node
/**
 * Pre-process GTFS data and upload to LOCAL D1 for development
 */
import { unzipSync } from 'fflate';
import { writeFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { generateImportStatements } from './gtfs-sql.mjs';

const execAsync = promisify(exec);

const GTFS_URL = process.env.GTFS_STATIC_URL || 'https://ajt-mobusta-gtfs.mcapps.jp/static/8/current_data.zip';

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
  const statements = generateImportStatements(files);

  const sqlFile = './scripts/temp-import-local.sql';
  writeFileSync(sqlFile, statements.join('\n'));
  console.log(`Wrote SQL to ${sqlFile}`);
  console.log(`Total statements: ${statements.length}`);

  console.log('Uploading to local D1...');
  const { stdout, stderr } = await execAsync(`cd .. && npx wrangler d1 execute kurupiro-db --local --file=./database/scripts/temp-import-local.sql`, {
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
