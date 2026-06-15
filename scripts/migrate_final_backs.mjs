#!/usr/bin/env node
// Migrace finalnich zadnich stran karet ze slozky 'Zadni strany_finale_ostatni smazem/'
// do sjednocene struktury zadni_strany/{kvarteta,hraci_karty,pexeso}/webp/.
//
// Vstup: PNG soubory v root slozce + CSV mapa scripts/back_rename_map.csv
// Vystup: WebP soubory + zadni_strany/manifest.json (jednotny pro vsechny 3 kategorie)
// Idempotentni: opakovane spusteni prepise vystup, zdrojove PNG se nemeni.

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE = path.resolve(__dirname, '..');

const SOURCE_ROOT = path.join(BASE, 'Zadní strany_finále_ostatní smažem');
const SOURCE_DIRS = {
  kvarteta: 'Kvarteta_rozměr 65x95',
  hraci_karty: 'Hrací karty_rozměr   63x105',
  pexeso: 'Pexesa_čtverce',
};

const CATEGORY_META = {
  kvarteta: { size: '65x95mm', aspect_ratio: 95 / 65 },
  hraci_karty: { size: '63x105mm', aspect_ratio: 105 / 63 },
  pexeso: { size: 'square', aspect_ratio: 1 },
};

const OUT_ROOT = path.join(BASE, 'zadni_strany');
const MANIFEST_PATH = path.join(OUT_ROOT, 'manifest.json');
const CSV_PATH = path.join(__dirname, 'back_rename_map.csv');

// ---------- CSV PARSING ----------

async function loadRenameMap() {
  const raw = await fs.readFile(CSV_PATH, 'utf8');
  const lines = raw.split('\n').filter(Boolean);
  const [header, ...rows] = lines;
  const cols = header.split(',').map((s) => s.trim());

  const idx = {
    kategorie: cols.indexOf('kategorie'),
    puvodni: cols.indexOf('puvodni_nazev'),
    novy: cols.indexOf('novy_nazev'),
    popis: cols.indexOf('popis'),
  };

  const map = { kvarteta: [], hraci_karty: [], pexeso: [] };

  for (const line of rows) {
    const fields = line.split(',');
    const kategorie = fields[idx.kategorie].trim();
    const puvodni = fields[idx.puvodni].trim();
    const novy = fields[idx.novy].trim();
    const popis = (fields[idx.popis] || '').trim();

    if (kategorie === 'kvarteta_a_hraci_karty') {
      // Stejny soubor (jen jiny rozmer) jde do obou kategorii
      map.kvarteta.push({ src: puvodni, id: novy.replace(/\.webp$/, ''), name: popis || novy });
      map.hraci_karty.push({ src: puvodni, id: novy.replace(/\.webp$/, ''), name: popis || novy });
    } else if (kategorie === 'hraci_karty') {
      // Pouze do hraci_karty (zdroj jen v 63x105 slozce)
      map.hraci_karty.push({ src: puvodni, id: novy.replace(/\.webp$/, ''), name: popis || novy });
    } else if (kategorie === 'pexeso') {
      map.pexeso.push({ src: puvodni, id: novy.replace(/\.webp$/, ''), name: popis || novy });
    } else if (kategorie === 'kvarteta') {
      // Jen kvarteta (zdroj pouze v 65x95 slozce, nepatri do hraci_karty)
      map.kvarteta.push({ src: puvodni, id: novy.replace(/\.webp$/, ''), name: popis || novy });
    } else {
      console.warn(`Neznama kategorie: ${kategorie}`);
    }
  }

  return map;
}

// ---------- ZPRACOVANI ----------

async function processOne(entry, category, outDir) {
  const srcPath = path.join(SOURCE_ROOT, SOURCE_DIRS[category], entry.src);
  const dstPath = path.join(outDir, `${entry.id}.webp`);

  const img = sharp(srcPath);
  const meta = await img.metadata();

  // Bez cropu - zdrojove obrazky uz maji spravny pomer pro kazdou kategorii.
  await img.webp({ quality: 90, effort: 6 }).toFile(dstPath);
  const outMeta = await sharp(dstPath).metadata();

  return {
    id: entry.id,
    name: entry.name,
    file: `${category}/webp/${entry.id}.webp`,
    width: outMeta.width,
    height: outMeta.height,
    source_width: meta.width,
    source_height: meta.height,
  };
}

async function migrateCategory(category, entries) {
  const outDir = path.join(OUT_ROOT, category, 'webp');
  await fs.mkdir(outDir, { recursive: true });

  const items = [];
  let okCount = 0;
  let failCount = 0;

  for (const entry of entries) {
    try {
      const result = await processOne(entry, category, outDir);
      items.push(result);
      okCount++;
    } catch (err) {
      failCount++;
      console.error(`  [FAIL] ${category}/${entry.src} -> ${entry.id}: ${err.message}`);
    }
  }

  console.log(`  [${category}] ${okCount} OK, ${failCount} FAIL`);
  return items;
}

async function injectDuplexBacks(manifest) {
  const htmlPath = path.join(BASE, 'tiskove_archy/duplex_konfigurator_pro.html');
  try {
    await fs.access(htmlPath);
  } catch {
    console.warn(`[duplex] ${htmlPath} neexistuje, preskakuji injekci.`);
    return;
  }

  const lines = [];
  for (const category of ['kvarteta', 'hraci_karty', 'pexeso']) {
    for (const item of manifest.categories[category].items) {
      lines.push(`            '../zadni_strany/${category}/webp/${item.id}.webp'`);
    }
  }
  const block =
    '        // BACKS:START (automaticky generováno scripts/migrate_final_backs.mjs – needitovat ručně)\n' +
    '        const BACKS = [\n' +
    lines.join(',\n') +
    '\n        ];\n' +
    '        // BACKS:END';

  const html = await fs.readFile(htmlPath, 'utf8');
  const re = /\s*\/\/ BACKS:START[\s\S]*?\/\/ BACKS:END/;
  if (!re.test(html)) {
    console.warn('[duplex] Nenalezeny znacky BACKS:START / BACKS:END – injekce preskocena.');
    return;
  }
  const updated = html.replace(re, '\n' + block);
  await fs.writeFile(htmlPath, updated);
  console.log(`[duplex] Injektovan BACKS (${lines.length} polozek) do ${path.relative(BASE, htmlPath)}`);
}

async function main() {
  const startTime = Date.now();
  console.log('Nacitani prejmenovaci mapy z', path.relative(BASE, CSV_PATH));
  const renameMap = await loadRenameMap();

  console.log(
    `Mapa: kvarteta=${renameMap.kvarteta.length}, hraci_karty=${renameMap.hraci_karty.length}, pexeso=${renameMap.pexeso.length}`
  );

  const manifest = {
    version: 2,
    generated_at: new Date().toISOString(),
    categories: {},
  };

  for (const category of ['kvarteta', 'hraci_karty', 'pexeso']) {
    console.log(`\nMigrace ${category} -> ${path.relative(BASE, path.join(OUT_ROOT, category, 'webp'))}`);
    const items = await migrateCategory(category, renameMap[category]);
    manifest.categories[category] = {
      ...CATEGORY_META[category],
      items,
    };
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\nManifest: ${path.relative(BASE, MANIFEST_PATH)}`);

  console.log('');
  await injectDuplexBacks(manifest);

  const totalItems = Object.values(manifest.categories).reduce((sum, cat) => sum + cat.items.length, 0);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nHotovo. ${totalItems} polozek za ${elapsed}s.`);
}

main().catch((err) => {
  console.error('Migrace selhala:', err);
  process.exit(1);
});
