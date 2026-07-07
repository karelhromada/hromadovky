// Single source of truth for indexable routes (used by generate-sitemap.mjs and prerender.mjs).
// IMPORTANT: static routes must stay in sync with INDEXABLE_PATHS in src/data/seo.ts.
// Product routes are derived automatically from src/data/products.ts (see below) — do NOT
// list them here manually.
// `lastmod` should reflect when the *content* of that page meaningfully changed,
// not when the deploy ran — dynamic `lastmod` per build looks like SEO spam.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const STATIC_ROUTES = [
  { path: '/',                   lastmod: '2026-05-13', changefreq: 'weekly',  priority: 1.0 },
  { path: '/kvarteta',           lastmod: '2026-05-13', changefreq: 'weekly',  priority: 0.9 },
  { path: '/pexeso',             lastmod: '2026-05-13', changefreq: 'weekly',  priority: 0.9 },
  { path: '/karty',              lastmod: '2026-05-13', changefreq: 'weekly',  priority: 0.9 },
  { path: '/faq',                lastmod: '2026-05-13', changefreq: 'monthly', priority: 0.6 },
  { path: '/o-nas',              lastmod: '2026-05-13', changefreq: 'monthly', priority: 0.5 },
  { path: '/obchodni-podminky',  lastmod: '2026-01-01', changefreq: 'yearly',  priority: 0.3 },
  { path: '/reklamacni-rad',     lastmod: '2026-01-01', changefreq: 'yearly',  priority: 0.3 },
  { path: '/gdpr',               lastmod: '2026-01-01', changefreq: 'yearly',  priority: 0.3 },
];

// When product texts change meaningfully, bump this date.
const PRODUCT_LASTMOD = '2026-07-07';

// Node ESM cannot import the TS module, so product slugs are extracted from the
// source text. Every product object MUST have a `slug: '...'` field — the id/slug
// count check below fails the build loudly when one is missing.
const CATEGORY_BY_EXPORT = {
  kartyProducts: '/karty',
  kvartetaProducts: '/kvarteta',
  pexesoProducts: '/pexeso',
};

function extractProductRoutes() {
  const src = readFileSync(resolve(__dirname, '..', 'src', 'data', 'products.ts'), 'utf8');
  const sections = src.split(/export const (\w+) = \[/).slice(1);
  const routes = [];
  for (let i = 0; i + 1 < sections.length; i += 2) {
    const exportName = sections[i];
    const body = sections[i + 1];
    const base = CATEGORY_BY_EXPORT[exportName];
    if (!base) continue;
    // product ids are quoted strings; badge ids are numeric and won't match
    const ids = [...body.matchAll(/^\s*id:\s*'[^']+'/gm)];
    const slugs = [...body.matchAll(/^\s*slug:\s*'([^']+)'/gm)].map((m) => m[1]);
    if (ids.length !== slugs.length) {
      throw new Error(
        `[routes] ${exportName}: ${ids.length} produktů, ale ${slugs.length} slugů — každý produkt v src/data/products.ts musí mít pole slug.`,
      );
    }
    for (const slug of slugs) {
      routes.push({ path: `${base}/${slug}`, lastmod: PRODUCT_LASTMOD, changefreq: 'monthly', priority: 0.8 });
    }
  }
  if (routes.length === 0) {
    throw new Error('[routes] z products.ts se nepodařilo extrahovat žádné produktové routy — zkontroluj formát exportů.');
  }
  return routes;
}

export const INDEXABLE_ROUTES = [...STATIC_ROUTES, ...extractProductRoutes()];
