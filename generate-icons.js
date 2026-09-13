import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function generate() {
  const svg = readFileSync(join(__dirname, 'public/icon.svg'));
  
  await sharp(svg).resize(192, 192).toFile(join(__dirname, 'public/pwa-192x192.png'));
  await sharp(svg).resize(512, 512).toFile(join(__dirname, 'public/pwa-512x512.png'));
  await sharp(svg).resize(512, 512).toFile(join(__dirname, 'public/pwa-maskable-512x512.png'));
  await sharp(svg).resize(180, 180).toFile(join(__dirname, 'public/apple-touch-icon.png'));
  console.log('Icons generated successfully.');
}

generate().catch(console.error);
