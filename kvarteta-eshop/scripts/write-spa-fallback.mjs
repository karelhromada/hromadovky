#!/usr/bin/env node
/**
 * Vyrobí dist/spa-fallback.html — neutrální SPA shell pro routy BEZ prerenderovaného
 * souboru (/checkout, /login, neznámé URL…). Vercel catch-all rewrite míří sem
 * (viz vercel.json), protože dist/index.html po prerenderu obsahuje snapshot
 * HOMEPAGE (canonical na /, bez noindex) — ten se pro cizí routy servírovat nesmí.
 *
 * Všechny routy, které na fallback spadnou, mají být noindex → fallback zahodí
 * canonical a přidá statický robots noindex. Helmet po mountu Reactu nastaví
 * správné tagy dané routy.
 *
 * Běží jako `postbuild` (vždy po `vite build`), takže fallback existuje i při
 * buildu bez prerenderu (DISABLE_PRERENDER=1) — jinak by rewrite vracel 404.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const shell = readFileSync(join(distDir, 'index.html'), 'utf8');

const fallback = shell
  .replace(/\s*<link rel="canonical"[^>]*>/i, '')
  .replace('</title>', '</title>\n  <meta name="robots" content="noindex">');

if (!fallback.includes('name="robots"')) {
  console.error('[spa-fallback] FAILED: could not inject robots noindex (missing </title> in dist/index.html?)');
  process.exit(1);
}

writeFileSync(join(distDir, 'spa-fallback.html'), fallback, 'utf8');
console.log('[spa-fallback] ✓ dist/spa-fallback.html (noindex, bez canonical)');
