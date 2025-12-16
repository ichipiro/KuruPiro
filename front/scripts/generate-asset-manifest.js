import fs from 'fs';
import path from 'path';

const distDir = './dist';
const assetsDir = path.join(distDir, 'assets');
const outputFile = path.join(distDir, 'asset-manifest.json');

// 画像拡張子
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];

function getImageAssets() {
  if (!fs.existsSync(assetsDir)) {
    console.log('Assets directory not found');
    return [];
  }

  const files = fs.readdirSync(assetsDir);
  const imageAssets = files
    .filter(file => IMAGE_EXTENSIONS.some(ext => file.toLowerCase().endsWith(ext)))
    .map(file => `/assets/${file}`);

  return imageAssets;
}

const assets = getImageAssets();
fs.writeFileSync(outputFile, JSON.stringify(assets, null, 2));
console.log(`Generated asset-manifest.json with ${assets.length} images`);
