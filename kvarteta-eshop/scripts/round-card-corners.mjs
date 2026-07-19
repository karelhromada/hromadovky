#!/usr/bin/env node
// Zapece zaoblene rohy (alfa kanal) do webp obrazku karet, ktere maji ostre rohy.
// Web resi zaobleni karet vyhradne pruhlednymi rohy v obrazku (zadny CSS border-radius),
// takze sady exportovane jako plny obdelnik pusobi na strance ostre.
// Pouziti: node scripts/round-card-corners.mjs <slozka-s-webp> [radius-v-% sirky, vychozi 5.4]
// Priklad: node scripts/round-card-corners.mjs public/cards/draci

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const RADIUS_PCT_DEFAULT = 5.4; // ~40 px na 741 px sirky — shodne s ostatnimi sadami na webu

async function roundCorners(file, radiusPct) {
  const input = await fs.readFile(file); // do bufferu — sharp neumi cist a psat tentyz soubor
  const meta = await sharp(input).metadata();

  if (meta.hasAlpha) {
    console.log(`[round-corners] preskakuji (uz ma alfu): ${path.basename(file)}`);
    return false;
  }

  const radius = Math.round(meta.width * (radiusPct / 100));
  const mask = Buffer.from(
    `<svg width="${meta.width}" height="${meta.height}">` +
    `<rect x="0" y="0" width="${meta.width}" height="${meta.height}" rx="${radius}" ry="${radius}"/></svg>`
  );

  const output = await sharp(input)
    .composite([{ input: mask, blend: 'dest-in' }])
    .webp({ quality: 95, alphaQuality: 100 })
    .toBuffer();

  await fs.writeFile(file, output);
  console.log(`[round-corners] ${path.basename(file)}: ${meta.width}x${meta.height}, radius ${radius}px`);
  return true;
}

async function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error('Pouziti: node scripts/round-card-corners.mjs <slozka-s-webp> [radius-v-%]');
    process.exit(1);
  }
  const radiusPct = process.argv[3] ? Number(process.argv[3]) : RADIUS_PCT_DEFAULT;
  if (!Number.isFinite(radiusPct) || radiusPct <= 0 || radiusPct > 50) {
    console.error(`Neplatny radius: ${process.argv[3]} (ocekavam % sirky, 0-50)`);
    process.exit(1);
  }

  const files = (await fs.readdir(dir))
    .filter((f) => f.toLowerCase().endsWith('.webp'))
    .map((f) => path.join(dir, f));
  if (files.length === 0) {
    console.error(`[round-corners] zadne .webp v ${dir}`);
    process.exit(1);
  }

  let changed = 0;
  for (const file of files) {
    if (await roundCorners(file, radiusPct)) changed += 1;
  }
  console.log(`[round-corners] hotovo: ${changed}/${files.length} souboru upraveno`);
}

main().catch((err) => {
  console.error('[round-corners] chyba:', err);
  process.exit(1);
});
