#!/usr/bin/env node
// Migrace zadnich stran karet do sjednocene struktury zadni_strany/{karty,pexeso}/webp/.
// Vystup: WebP soubory + manifest.json pro eshop i tisk.
// Idempotentni: opakovane spusteni prepise vystup, zdrojove soubory se nemeni.

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE = path.resolve(__dirname, '..');

const OUT_KARTY = path.join(BASE, 'zadni_strany/karty/webp');
const OUT_PEXESO = path.join(BASE, 'zadni_strany/pexeso/webp');
const MANIFEST_KARTY = path.join(BASE, 'zadni_strany/karty/manifest.json');
const MANIFEST_PEXESO = path.join(BASE, 'zadni_strany/pexeso/manifest.json');

// Hraci karta = 62 x 88 mm => ratio height/width = 1.41935
const CARD_RATIO = 88 / 62;

// ---------- MAPOVANI ZDROJU NA VYSTUP ----------

const KARTY = [
  // EPIC (600x600 patterny)
  { src: 'kvarteta-eshop/public/cards/backs/epic_gold_scales.webp',       id: 'epic_zlate_supiny',      name: 'Zlate supiny (Epic)',      category: 'epic', strategy: 'pattern-crop' },
  { src: 'kvarteta-eshop/public/cards/backs/epic_arcane_parchment.webp',  id: 'epic_magicky_pergamen',  name: 'Magicky pergamen (Epic)',  category: 'epic', strategy: 'pattern-crop' },
  { src: 'kvarteta-eshop/public/cards/backs/epic_ice_crystal.webp',       id: 'epic_ledovy_krystal',    name: 'Ledovy krystal (Epic)',    category: 'epic', strategy: 'pattern-crop' },
  { src: 'kvarteta-eshop/public/cards/backs/epic_lava_flow.webp',         id: 'epic_lavovy_proud',      name: 'Lavovy proud (Epic)',      category: 'epic', strategy: 'pattern-crop' },
  { src: 'kvarteta-eshop/public/cards/backs/epic_runed_obsidian.webp',    id: 'epic_runovy_obsidian',   name: 'Runovy obsidian (Epic)',   category: 'epic', strategy: 'pattern-crop' },

  // EPIC varianta 1-10 (bezejmenne zdroje v epicka_draci_edice/epic_backs)
  ...Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    return {
      src: `hraci_karty/epicka_draci_edice/epic_backs/back_${n}.png`,
      id: `epic_varianta_${n}`,
      name: `Epic - varianta ${n}`,
      category: 'epic',
      strategy: 'pattern-crop',
    };
  }),

  // DRAK (640x640 patterny)
  { src: 'kvarteta-eshop/public/cards/dragon_scales_vibrant.webp',     id: 'drak_krvave_supiny',  name: 'Krvave supiny',   category: 'drak', strategy: 'pattern-crop' },
  { src: 'kvarteta-eshop/public/cards/dragon_scales_metallic.webp',    id: 'drak_kovove_supiny',  name: 'Kovovy drak',     category: 'drak', strategy: 'pattern-crop' },
  { src: 'kvarteta-eshop/public/cards/dragon_scales_realistic_1.webp', id: 'drak_zelene_supiny',  name: 'Zelene supiny',   category: 'drak', strategy: 'pattern-crop' },
  { src: 'kvarteta-eshop/public/cards/dragon_scales_realistic_2.webp', id: 'drak_zlate_supiny',   name: 'Zlaty drak',      category: 'drak', strategy: 'pattern-crop' },
  { src: 'kvarteta-eshop/public/cards/dragon_scales_seamless.webp',    id: 'drak_platovani',      name: 'Draci platovani', category: 'drak', strategy: 'pattern-crop' },

  // RYTIR (709x1004 native card ratio)
  { src: 'kvarteta-eshop/public/cards/knight_back_iron_steel.webp', id: 'rytir_ocelovy_plat',  name: 'Ocelovy plat',  category: 'rytir', strategy: 'native' },
  { src: 'kvarteta-eshop/public/cards/knight_back_crest.webp',      id: 'rytir_rytirsky_erb',  name: 'Rytirsky erb',  category: 'rytir', strategy: 'native' },
  { src: 'kvarteta-eshop/public/cards/knight_back_gate.webp',       id: 'rytir_hradni_brana',  name: 'Hradni brana',  category: 'rytir', strategy: 'native' },
  { src: 'kvarteta-eshop/public/cards/knight_back_pattern.webp',    id: 'rytir_zamecky_vzor',  name: 'Zamecky vzor',  category: 'rytir', strategy: 'native' },

  // RYTIR (640x640 navic z kvarteta/backs)
  { src: 'kvarteta/backs/knight_back_copper.png', id: 'rytir_medene_platovani', name: 'Medene platovani', category: 'rytir', strategy: 'pattern-crop' },
  { src: 'kvarteta/backs/knight_back_gold.png',   id: 'rytir_zlate_platovani',  name: 'Zlate platovani',  category: 'rytir', strategy: 'pattern-crop' },
  { src: 'kvarteta/backs/knight_back_cute.png',   id: 'rytir_roztomily',        name: 'Roztomily rytir',  category: 'rytir', strategy: 'pattern-crop' },

  // KOCKA (640x640 srst)
  { src: 'kvarteta-eshop/public/cards/cat_fur_orange.webp', id: 'kocka_zrzava_srst',   name: 'Zrzava srst',      category: 'kocka', strategy: 'pattern-crop' },
  { src: 'kvarteta-eshop/public/cards/cat_fur_silver.webp', id: 'kocka_stribrna_srst', name: 'Stribrna srst',    category: 'kocka', strategy: 'pattern-crop' },
  { src: 'kvarteta-eshop/public/cards/cat_fur_calico.webp', id: 'kocka_tribarevna',    name: 'Tribarevna kocka', category: 'kocka', strategy: 'pattern-crop' },

  // DINOSAURUS (640x640)
  { src: 'kvarteta/backs/dino_back_amber.png',    id: 'dinosaurus_jantar',   name: 'Jantar',   category: 'dinosaurus', strategy: 'pattern-crop' },
  { src: 'kvarteta/backs/dino_back_crystals.png', id: 'dinosaurus_krystaly', name: 'Krystaly', category: 'dinosaurus', strategy: 'pattern-crop' },
  { src: 'kvarteta/backs/dino_back_nature.png',   id: 'dinosaurus_priroda',  name: 'Priroda',  category: 'dinosaurus', strategy: 'pattern-crop' },
  { src: 'kvarteta/backs/dino_back_nest.png',     id: 'dinosaurus_hnizdo',   name: 'Hnizdo',   category: 'dinosaurus', strategy: 'pattern-crop' },
  { src: 'kvarteta/backs/dino_back_oasis.png',    id: 'dinosaurus_oaza',     name: 'Oaza',     category: 'dinosaurus', strategy: 'pattern-crop' },

  // MYTOLOGIE (678x921 native)
  { src: 'kvarteta/mytologie/mytologie_back_1_emblem.png',  id: 'mytologie_emblem',  name: 'Mytologie - emblem', category: 'mytologie', strategy: 'native' },
  { src: 'kvarteta/mytologie/mytologie_back_2_runes.png',   id: 'mytologie_runy',    name: 'Mytologie - runy',   category: 'mytologie', strategy: 'native' },
  { src: 'kvarteta/mytologie/mytologie_back_3_gateway.png', id: 'mytologie_gateway', name: 'Mytologie - brana',  category: 'mytologie', strategy: 'native' },

  // MINECRAFT (1024x1024 keep 1:1)
  { src: 'kvarteta-eshop/public/cards/minecraft-prsi/back_dark.png',  id: 'minecraft_tmava',  name: 'Minecraft - tmava',  category: 'minecraft', strategy: 'keep-1to1' },
  { src: 'kvarteta-eshop/public/cards/minecraft-prsi/back_light.png', id: 'minecraft_svetla', name: 'Minecraft - svetla', category: 'minecraft', strategy: 'keep-1to1' },

  // NEUTRALNI
  { src: 'kvarteta-eshop/public/cards/neutral_back_ruby_formatted.webp', id: 'neutralni_magicky_rubin',   name: 'Magicky rubin',    category: 'neutralni', strategy: 'native' },
  { src: 'kvarteta-eshop/public/cards/card_back_pattern.webp',           id: 'neutralni_tajemny_vzor',    name: 'Tajemny vzor',     category: 'neutralni', strategy: 'pattern-crop' },
  { src: 'kvarteta-eshop/public/cards/sugar_glaze_pattern.webp',         id: 'neutralni_cukrova_poleva',  name: 'Cukrova poleva',   category: 'neutralni', strategy: 'pattern-crop' },
  { src: 'kvarteta-eshop/public/cards/neutral_back_stars.webp',          id: 'neutralni_nocni_obloha',    name: 'Nocni obloha',     category: 'neutralni', strategy: 'pattern-crop' },
  { src: 'kvarteta-eshop/public/cards/neutral_back_gradient.webp',       id: 'neutralni_temny_gradient',  name: 'Temny gradient',   category: 'neutralni', strategy: 'pattern-crop' },
];

const PEXESO = [
  { src: 'kvarteta-eshop/public/cards/pexeso_back_linen.webp',    id: 'pexeso_klasicke_platno', name: 'Klasicke platno', category: 'pexeso', strategy: 'square' },
  { src: 'kvarteta-eshop/public/cards/pexeso_back_stars.webp',    id: 'pexeso_hvezdna_noc',     name: 'Hvezdna noc',     category: 'pexeso', strategy: 'square' },
  { src: 'kvarteta-eshop/public/cards/pexeso_back_blue_geo.webp', id: 'pexeso_modre_diamanty',  name: 'Modre diamanty',  category: 'pexeso', strategy: 'square' },
  { src: 'kvarteta-eshop/public/cards/pexeso_back_red_geo.webp',  id: 'pexeso_cervene_vzory',   name: 'Cervene vzory',   category: 'pexeso', strategy: 'square' },
];

// ---------- ZPRACOVANI ----------

async function processOne(entry, outDir) {
  const srcPath = path.join(BASE, entry.src);
  const dstPath = path.join(outDir, `${entry.id}.webp`);

  const img = sharp(srcPath);
  const meta = await img.metadata();
  let pipeline = img;

  if (entry.strategy === 'pattern-crop') {
    // Center-crop tak, aby vystup mel ratio 1:1.41935 (karta na sirku = vysska / 1.4194).
    const targetW = Math.round(meta.height / CARD_RATIO);
    if (targetW < meta.width) {
      const left = Math.round((meta.width - targetW) / 2);
      pipeline = pipeline.extract({ left, top: 0, width: targetW, height: meta.height });
    } else {
      // Zdroj je uz uzsi nez cilovy pomer -> crop vysku.
      const targetH = Math.round(meta.width * CARD_RATIO);
      const top = Math.round((meta.height - targetH) / 2);
      pipeline = pipeline.extract({ left: 0, top, width: meta.width, height: targetH });
    }
  }
  // 'native' | 'keep-1to1' | 'square' -> zadny crop, jen prevod formatu.

  await pipeline.webp({ quality: 90, effort: 6 }).toFile(dstPath);
  const outMeta = await sharp(dstPath).metadata();

  return {
    id: entry.id,
    name: entry.name,
    category: entry.category,
    file: `webp/${entry.id}.webp`,
    width: outMeta.width,
    height: outMeta.height,
    strategy: entry.strategy,
  };
}

async function migrate(entries, outDir, manifestPath, aspectRatio) {
  await fs.mkdir(outDir, { recursive: true });

  const backs = [];
  for (const entry of entries) {
    try {
      const result = await processOne(entry, outDir);
      backs.push(result);
      console.log(`  [OK] ${entry.id} (${result.width}x${result.height})`);
    } catch (err) {
      console.error(`  [FAIL] ${entry.id}: ${err.message}`);
      throw err;
    }
  }

  await fs.writeFile(
    manifestPath,
    JSON.stringify({ version: 1, aspectRatio, backs }, null, 2) + '\n',
  );
}

async function main() {
  console.log('Migrace KARTY ->', path.relative(BASE, OUT_KARTY));
  await migrate(KARTY, OUT_KARTY, MANIFEST_KARTY, '1:1.4194');

  console.log('\nMigrace PEXESO ->', path.relative(BASE, OUT_PEXESO));
  await migrate(PEXESO, OUT_PEXESO, MANIFEST_PEXESO, '1:1');

  console.log(`\nHotovo. karty: ${KARTY.length} | pexeso: ${PEXESO.length}`);
}

main().catch((err) => {
  console.error('Migrace selhala:', err);
  process.exit(1);
});
