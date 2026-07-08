#!/usr/bin/env node
/**
 * Generuje produktové XML feedy pro Heureka.cz a Zboží.cz do public/
 * (heureka.xml + zbozi.xml). Běží v prebuild — feedy se aktualizují samy
 * s každým deployem, nové produkty stačí přidat do products.ts.
 *
 * Zdroj dat: src/data/products.ts — parsuje se textově (Node ESM neumí import TS),
 * stejný vzor jako scripts/routes.mjs. Každý produkt MUSÍ mít id, slug, name,
 * description, price a aspoň jeden obrázek — jinak build spadne (loudly).
 *
 * Ceny: Karel je neplátce DPH → PRICE_VAT = koncová cena. Pexesa mají na webu
 * „od 199 Kč" (16 karet) → feed uvádí 199, aby cena seděla s landing page.
 * Doprava: Zásilkovna 79 Kč, PPL 99 Kč, dobírka +39 Kč (viz CheckoutPage.tsx).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://www.hromadovky.cz';
const PUBLIC_DIR = resolve(__dirname, '..', 'public');

const DELIVERY_DATE_DAYS = 5; // výroba + doručení do 5 pracovních dnů
const DELIVERIES = [
    { id: 'ZASILKOVNA', price: 79, cod: 79 + 39 },
    { id: 'PPL', price: 99, cod: 99 + 39 },
];

const CATEGORIES = {
    kartyProducts: {
        urlBase: '/karty',
        heureka: 'Heureka.cz | Dětské zboží | Hračky | Společenské hry | Karetní hry',
        zbozi: 'Dětské zboží | Hračky | Společenské hry | Karetní hry',
        feedPrice: null, // null = použít price z products.ts
    },
    kvartetaProducts: {
        urlBase: '/kvarteta',
        heureka: 'Heureka.cz | Dětské zboží | Hračky | Společenské hry | Karetní hry',
        zbozi: 'Dětské zboží | Hračky | Společenské hry | Karetní hry',
        feedPrice: null,
    },
    pexesoProducts: {
        urlBase: '/pexeso',
        heureka: 'Heureka.cz | Dětské zboží | Hračky | Společenské hry',
        zbozi: 'Dětské zboží | Hračky | Společenské hry',
        feedPrice: 199, // web uvádí „od 199 Kč" (varianta 16 karet)
    },
};

const escapeXml = (s) =>
    String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');

function parseProducts() {
    const src = readFileSync(resolve(__dirname, '..', 'src', 'data', 'products.ts'), 'utf8');
    const sections = src.split(/export const (\w+) = \[/).slice(1);
    const items = [];
    for (let i = 0; i + 1 < sections.length; i += 2) {
        const exportName = sections[i];
        const body = sections[i + 1];
        const cat = CATEGORIES[exportName];
        if (!cat) continue;

        const expectedCount = [...body.matchAll(/^\s{8}id: '[^']+'/gm)].length;
        // bloky produktů: oddělené "    {" na začátku řádku (8 mezer = pole objektu)
        const blocks = body.split(/^ {4}\{\s*$/m).filter((b) => /^\s{8}id: '/m.test(b));
        if (blocks.length !== expectedCount) {
            throw new Error(`[feeds] ${exportName}: našel jsem ${blocks.length} bloků, ale ${expectedCount} id — formát products.ts se změnil?`);
        }

        for (const block of blocks) {
            const field = (name) => block.match(new RegExp(`^\\s*${name}: '([^']*)'`, 'm'))?.[1];
            const id = field('id');
            const slug = field('slug');
            const name = field('name');
            const description = field('description');
            const longDescription = field('longDescription');
            const price = block.match(/^\s*price: (\d+)/m)?.[1];
            const imgArray = block.match(/(?:images|image): \[([\s\S]*?)\]/)?.[1] ?? '';
            const images = [...imgArray.matchAll(/'([^']+)'/g)].map((m) => m[1]);

            if (!id || !slug || !name || !description || !price || images.length === 0) {
                throw new Error(`[feeds] ${exportName}: produkt ${id ?? '???'} nemá všechna povinná pole (id/slug/name/description/price/obrázek).`);
            }

            items.push({
                id,
                name,
                // dlouhý popis bez \n\n escapů; fallback na krátký popis
                description: (longDescription ?? description).replaceAll('\\n\\n', ' ').replaceAll('\\n', ' '),
                url: `${SITE}${cat.urlBase}/${slug}`,
                images: images.slice(0, 3).map((img) => `${SITE}${encodeURI(img)}`),
                price: cat.feedPrice ?? Number(price),
                heurekaCategory: cat.heureka,
                zboziCategory: cat.zbozi,
            });
        }
    }
    if (items.length === 0) throw new Error('[feeds] z products.ts se nepodařilo vyparsovat žádný produkt.');
    return items;
}

const deliveryXml = DELIVERIES.map(
    (d) => `    <DELIVERY>
      <DELIVERY_ID>${d.id}</DELIVERY_ID>
      <DELIVERY_PRICE>${d.price}</DELIVERY_PRICE>
      <DELIVERY_PRICE_COD>${d.cod}</DELIVERY_PRICE_COD>
    </DELIVERY>`,
).join('\n');

function shopItem(item, categoryField) {
    const [main, ...alts] = item.images;
    return `  <SHOPITEM>
    <ITEM_ID>${escapeXml(item.id)}</ITEM_ID>
    <PRODUCTNAME>${escapeXml(item.name)}</PRODUCTNAME>
    <DESCRIPTION>${escapeXml(item.description)}</DESCRIPTION>
    <URL>${escapeXml(item.url)}</URL>
    <IMGURL>${escapeXml(main)}</IMGURL>
${alts.map((a) => `    <IMGURL_ALTERNATIVE>${escapeXml(a)}</IMGURL_ALTERNATIVE>`).join('\n')}
    <PRICE_VAT>${item.price}</PRICE_VAT>
    <MANUFACTURER>Hromadovky</MANUFACTURER>
    <CATEGORYTEXT>${escapeXml(item[categoryField])}</CATEGORYTEXT>
    <DELIVERY_DATE>${DELIVERY_DATE_DAYS}</DELIVERY_DATE>
${deliveryXml}
  </SHOPITEM>`;
}

const items = parseProducts();

const heurekaXml = `<?xml version="1.0" encoding="utf-8"?>
<SHOP>
${items.map((i) => shopItem(i, 'heurekaCategory')).join('\n')}
</SHOP>
`;

const zboziXml = `<?xml version="1.0" encoding="utf-8"?>
<SHOP xmlns="http://www.zbozi.cz/ns/offer/1.0">
${items.map((i) => shopItem(i, 'zboziCategory')).join('\n')}
</SHOP>
`;

writeFileSync(resolve(PUBLIC_DIR, 'heureka.xml'), heurekaXml, 'utf8');
writeFileSync(resolve(PUBLIC_DIR, 'zbozi.xml'), zboziXml, 'utf8');
console.log(`✓ feedy vygenerovány: heureka.xml + zbozi.xml (${items.length} produktů)`);
