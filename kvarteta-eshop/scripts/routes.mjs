// Single source of truth for indexable routes (used by generate-sitemap.mjs and prerender.mjs).
// IMPORTANT: must stay in sync with INDEXABLE_PATHS in src/data/seo.ts.
// `lastmod` should reflect when the *content* of that page meaningfully changed,
// not when the deploy ran — dynamic `lastmod` per build looks like SEO spam.
export const INDEXABLE_ROUTES = [
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
