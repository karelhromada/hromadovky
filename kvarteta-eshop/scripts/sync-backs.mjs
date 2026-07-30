#!/usr/bin/env node
// Kopiruje zadni_strany/{kvarteta,hraci_karty,pexeso}/webp/* z rootu do kvarteta-eshop/public/zadni_strany/.
// Take kopiruje manifest do src/data/backs-manifest.json pro TypeScript import.
// Spousti se automaticky v predev / prebuild.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ESHOP_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(ESHOP_ROOT, '..');

const SRC_ROOT = path.join(REPO_ROOT, 'zadni_strany');
const SRC_MANIFEST = path.join(SRC_ROOT, 'manifest.json');
const DST_PUBLIC = path.join(ESHOP_ROOT, 'public', 'zadni_strany');
const DST_TS_MANIFEST = path.join(ESHOP_ROOT, 'src', 'data', 'backs-manifest.json');

const CATEGORIES = ['kvarteta', 'hraci_karty', 'pexeso'];

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const from = path.join(src, entry.name);
    const to = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      await copyDir(from, to);
    } else if (entry.isFile()) {
      await fs.copyFile(from, to);
    }
  }
}

async function main() {
  try {
    await fs.access(SRC_ROOT);
  } catch {
    console.warn(`[sync-backs] ${SRC_ROOT} neexistuje, preskakuji.`);
    return;
  }

  // Vycistime cilovy public adresar, abychom nenechali stare backy za sebou.
  await fs.rm(DST_PUBLIC, { recursive: true, force: true });

  for (const category of CATEGORIES) {
    const src = path.join(SRC_ROOT, category);
    try {
      await fs.access(src);
    } catch {
      console.warn(`[sync-backs] ${src} neexistuje, preskakuji.`);
      continue;
    }
    await copyDir(src, path.join(DST_PUBLIC, category));
  }

  // Kopirujeme manifest take do public/ pro pripadne runtime cteni.
  try {
    await fs.copyFile(SRC_MANIFEST, path.join(DST_PUBLIC, 'manifest.json'));
  } catch (err) {
    console.warn(`[sync-backs] manifest.json se nepodarilo zkopirovat do public/: ${err.message}`);
  }

  // Kopirujeme manifest do src/data/ pro TypeScript import.
  try {
    await fs.mkdir(path.dirname(DST_TS_MANIFEST), { recursive: true });
    await fs.copyFile(SRC_MANIFEST, DST_TS_MANIFEST);
  } catch (err) {
    console.warn(`[sync-backs] manifest.json se nepodarilo zkopirovat do src/data/: ${err.message}`);
  }

  // Guard: public/zadni_strany je gitignorovany a vznika jen tady. Kdyby zdrojova
  // slozka chybela/prejmenovala se, build by proseal zeleny a nasadil web, kde jsou
  // vsechny ruby 404 (manifest je z gitu, takze UI je dal nabizi).
  const manifest = JSON.parse(await fs.readFile(SRC_MANIFEST, 'utf8'));
  const expected = Array.isArray(manifest) ? manifest.length : Object.values(manifest).flat().length;
  let copied = 0;
  for (const game of await fs.readdir(DST_PUBLIC)) {
    const webpDir = path.join(DST_PUBLIC, game, 'webp');
    try {
      copied += (await fs.readdir(webpDir)).filter((f) => f.endsWith('.webp')).length;
    } catch { /* kategorie bez webp slozky */ }
  }
  if (copied < expected) {
    console.error(`[sync-backs] CHYBA: zkopirovano ${copied} webp, manifest ocekava ${expected}.`);
    process.exit(1);
  }

  console.log(`[sync-backs] OK -> public/${path.relative(path.join(ESHOP_ROOT, 'public'), DST_PUBLIC)} (${copied} webp)`);
  console.log(`[sync-backs] manifest -> src/data/backs-manifest.json`);
}

main().catch((err) => {
  console.error('[sync-backs] selhalo:', err);
  process.exit(1);
});
