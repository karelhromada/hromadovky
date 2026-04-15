#!/usr/bin/env node
// Kopiruje zadni_strany/{karty,pexeso}/webp/* z rootu do kvarteta-eshop/public/zadni_strany/.
// Spousti se automaticky v predev / prebuild.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ESHOP_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(ESHOP_ROOT, '..');

const SRC_ROOT = path.join(REPO_ROOT, 'zadni_strany');
const DST_ROOT = path.join(ESHOP_ROOT, 'public', 'zadni_strany');

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

  // Vycistime cilovy adresar, abychom nenechali smazane backy za sebou.
  await fs.rm(DST_ROOT, { recursive: true, force: true });

  for (const subset of ['karty', 'pexeso']) {
    const src = path.join(SRC_ROOT, subset);
    try {
      await fs.access(src);
    } catch {
      console.warn(`[sync-backs] ${src} neexistuje, preskakuji.`);
      continue;
    }
    await copyDir(src, path.join(DST_ROOT, subset));
  }

  console.log(`[sync-backs] OK -> ${path.relative(ESHOP_ROOT, DST_ROOT)}`);
}

main().catch((err) => {
  console.error('[sync-backs] selhalo:', err);
  process.exit(1);
});
