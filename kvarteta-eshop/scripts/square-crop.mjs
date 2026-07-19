#!/usr/bin/env node
// Orizne portretove obrazky karet na ctverec (pro pexeso — karticky jsou ctvercove).
// Vychozi orez je STREDEM — shodne s tiskovym archem (pexeso/<sada>/tiskovy_arch_*.html
// pouziva background-size: cover + background-position: center), takze web ukazuje
// presne to, co zakaznik dostane vytistene. Volitelne --position=attention orizne
// na nejvyraznejsi oblast obrazku.
// Pouziti: node scripts/square-crop.mjs [--position=center|attention] <cilova-slozka> <soubor.webp> [dalsi...]
// Priklad: node scripts/square-crop.mjs public/pexeso/baby-dracci public/cards/pexeso_baby_*.webp

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

async function squareCrop(file, destDir, position) {
  const input = await fs.readFile(file);
  const meta = await sharp(input).metadata();
  const size = Math.min(meta.width, meta.height);

  const output = await sharp(input)
    .resize(size, size, { fit: 'cover', position })
    .webp({ quality: 95 })
    .toBuffer();

  const dest = path.join(destDir, path.basename(file));
  await fs.writeFile(dest, output);
  console.log(`[square-crop] ${path.basename(file)}: ${meta.width}x${meta.height} → ${size}x${size}`);
}

async function main() {
  const args = process.argv.slice(2);
  let position = 'centre';
  if (args[0]?.startsWith('--position=')) {
    const value = args.shift().split('=')[1];
    if (value === 'attention') position = sharp.strategy.attention;
    else if (value !== 'center' && value !== 'centre') {
      console.error(`Neplatna pozice: ${value} (ocekavam center nebo attention)`);
      process.exit(1);
    }
  }
  const [destDir, ...files] = args;
  if (!destDir || files.length === 0) {
    console.error('Pouziti: node scripts/square-crop.mjs [--position=center|attention] <cilova-slozka> <soubor.webp> [dalsi...]');
    process.exit(1);
  }
  await fs.mkdir(destDir, { recursive: true });
  for (const file of files) {
    await squareCrop(file, destDir, position);
  }
  console.log(`[square-crop] hotovo: ${files.length} souboru → ${destDir}`);
}

main().catch((err) => {
  console.error('[square-crop] chyba:', err);
  process.exit(1);
});
