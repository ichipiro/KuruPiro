#!/usr/bin/env bash
set -euo pipefail

GTFS_URL='https://ajt-mobusta-gtfs.mcapps.jp/static/8/current_data.zip'
DEST_DIR="$(dirname "$0")/tmp"
ZIP_PATH="${DEST_DIR}/current_data.zip"
GTFS_DIR="${DEST_DIR}/gtfs"

mkdir -p "${GTFS_DIR}"

echo "Downloading GTFS from ${GTFS_URL}"
curl -fsSL --retry 3 --retry-delay 5 -o "${ZIP_PATH}" "${GTFS_URL}"

echo "Extracting to ${GTFS_DIR}"
unzip -o "${ZIP_PATH}" -d "${GTFS_DIR}"

echo "Done."
