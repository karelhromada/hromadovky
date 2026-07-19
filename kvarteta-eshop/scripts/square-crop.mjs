#!/usr/bin/env node
// Orizne portretove obrazky karet na ctverec (pro pexeso — karticky jsou ctvercove).
// Orez pouziva sharp "attention" strategii — ctverec se umisti na nejvyraznejsi
// oblast obrazku (motiv), ne na geometricky stred.
// Pouziti: node scripts/square-crop.mjs <cilova-slozka> <soubor.webp> [dalsi...]
// Priklad: node scripts/square-crop.mjs public/pexeso/baby-dracci public/cards/pexeso_baby_*.webp

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

async function squareCrop(file, destDir) {
  const input = await fs.readFile(file);
  const meta = await sharp(input).metadata();
  const size = Math.min(meta.width, meta.height);

  const output = await sharp(input)
    .resize(size, size, { fit: 'cover', position: sharp.strategy.attention })
    .webp({ quality: 95 })
    .toBuffer();

  const dest = path.join(destDir, path.basename(file));
  await fs.writeFile(dest, output);
  console.log(`[square-crop] ${path.basename(file)}: ${meta.width}x${meta.height} → ${size}x${size}`);
}

async function main() {
  const [destDir, ...files] = process.argv.slice(2);
  if (!destDir || files.length === 0) {
    console.error('Pouziti: node scripts/square-crop.mjs <cilova-slozka> <soubor.webp> [dalsi...]');
    process.exit(1);
  }
  await fs.mkdir(destDir, { recursive: true });
  for (const file of files) {
    await squareCrop(file, destDir);
  }
  console.log(`[square-crop] hotovo: ${files.length} souboru → ${destDir}`);
}

main().catch((err) => {
  console.error('[square-crop] chyba:', err);
  process.exit(1);
});
