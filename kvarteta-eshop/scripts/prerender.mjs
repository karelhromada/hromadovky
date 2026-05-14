#!/usr/bin/env node
/**
 * Post-build prerender: spawns `vite preview`, walks routes with Puppeteer,
 * saves rendered HTML per route into dist/<route>/index.html.
 *
 * Why custom: vite-plugin-prerender 1.0.8 ships a broken .mjs that mixes
 * `require()` with ESM. Writing this directly is cleaner.
 *
 * Skip with DISABLE_PRERENDER=1.
 */
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { INDEXABLE_ROUTES } from './routes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');
const PORT = 4185;
const HELMET_FLUSH_MS = 1500;
const PAGE_NAV_TIMEOUT_MS = 60000;
const SERVER_READY_TIMEOUT_MS = 30000;

const ROUTES = INDEXABLE_ROUTES.map((r) => r.path);

if (process.env.DISABLE_PRERENDER === '1') {
  console.log('[prerender] DISABLE_PRERENDER=1 — skipping.');
  process.exit(0);
}

/**
 * Removes duplicate SEO tags from <head>. Helmet often injects copies alongside
 * the static fallback from index.html — keep first/last per key so each page
 * settles on the per-route values.
 */
function dedupeSeoTags(html) {
  const headMatch = html.match(/<head([^>]*)>([\s\S]*?)<\/head>/i);
  if (!headMatch) return html;
  const headAttrs = headMatch[1];
  let headInner = headMatch[2];

  // strategy: 'first' = Helmet inject (DOM order earliest) wins
  //           'last'  = last write wins (default for meta tags Helmet manages)
  const patterns = [
    { re: /<title>[\s\S]*?<\/title>/gi, key: () => 'title', strategy: 'first' },
    { re: /<meta\s+name="description"[^>]*>/gi, key: () => 'meta:name=description', strategy: 'last' },
    { re: /<meta\s+name="robots"[^>]*>/gi, key: () => 'meta:name=robots', strategy: 'last' },
    { re: /<link\s+rel="canonical"[^>]*>/gi, key: () => 'link:rel=canonical', strategy: 'last' },
    { re: /<meta\s+property="og:[^"]+"[^>]*>/gi, key: (m) => m.match(/property="(og:[^"]+)"/i)?.[1] ?? 'og:_', strategy: 'last' },
    { re: /<meta\s+name="twitter:[^"]+"[^>]*>/gi, key: (m) => m.match(/name="(twitter:[^"]+)"/i)?.[1] ?? 'twitter:_', strategy: 'last' },
  ];

  for (const { re, key, strategy } of patterns) {
    const matches = [...headInner.matchAll(re)];
    if (matches.length <= 1) continue;
    const kept = new Map();
    for (const m of matches) {
      const k = key(m[0]);
      if (strategy === 'first' && kept.has(k)) continue;
      kept.set(k, m[0]);
    }
    headInner = headInner.replace(re, '');
    for (const tag of kept.values()) headInner += '\n  ' + tag;
  }

  return html.replace(/<head[^>]*>[\s\S]*?<\/head>/i, `<head${headAttrs}>${headInner}</head>`);
}

if (!existsSync(distDir)) {
  console.error('[prerender] dist/ missing — run `vite build` first.');
  process.exit(1);
}

console.log(`[prerender] starting preview server on port ${PORT}…`);
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: resolve(__dirname, '..'),
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'production' },
});

let serverReady = false;
const waitForServer = new Promise((res, rej) => {
  const timer = setTimeout(() => rej(new Error('preview server timeout')), SERVER_READY_TIMEOUT_MS);
  server.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    if (text.includes('Local:') || text.includes(`localhost:${PORT}`)) {
      serverReady = true;
      clearTimeout(timer);
      res();
    }
  });
  server.stderr.on('data', (chunk) => process.stderr.write(`[preview] ${chunk}`));
  server.on('exit', (code) => {
    if (!serverReady) rej(new Error(`preview exited prematurely (code ${code})`));
  });
});

function cleanup() {
  return new Promise((res) => {
    if (server.exitCode !== null) return res();
    server.once('exit', () => res());
    try {
      server.kill('SIGTERM');
    } catch {
      res();
    }
    // fallback if SIGTERM is ignored
    setTimeout(() => {
      try { server.kill('SIGKILL'); } catch { /* noop */ }
      res();
    }, 3000);
  });
}

process.on('SIGINT', () => cleanup().then(() => process.exit(130)));
process.on('SIGTERM', () => cleanup().then(() => process.exit(143)));

try {
  await waitForServer;
  await new Promise((r) => setTimeout(r, 500)); // grace period for static asset binding
  console.log('[prerender] preview ready, launching browser…');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const route of ROUTES) {
    const url = `http://localhost:${PORT}${route}`;
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    console.log(`[prerender] rendering ${route}`);
    // `domcontentloaded` is more reliable than `networkidle0` — Helmet inject runs
    // synchronously after React mount, then HELMET_FLUSH_MS waits for it to settle.
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_NAV_TIMEOUT_MS });
    await new Promise((r) => setTimeout(r, HELMET_FLUSH_MS));

    const rawHtml = await page.content();
    const html = dedupeSeoTags(rawHtml);
    const outDir = route === '/' ? distDir : join(distDir, route);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), html, 'utf8');
    await page.close();
  }

  await browser.close();
  console.log(`[prerender] ✓ ${ROUTES.length} routes prerendered.`);
} catch (err) {
  console.error('[prerender] FAILED:', err);
  process.exitCode = 1;
} finally {
  await cleanup();
}
