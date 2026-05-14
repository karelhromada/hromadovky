#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { INDEXABLE_ROUTES } from './routes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://hromadovky.cz';
const PUBLIC_DIR = resolve(__dirname, '..', 'public');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${INDEXABLE_ROUTES.map(
  (r) => `  <url>
    <loc>${SITE}${r.path}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`,
).join('\n')}
</urlset>
`;

writeFileSync(resolve(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf8');
console.log(`✓ sitemap.xml generated with ${INDEXABLE_ROUTES.length} URLs`);
