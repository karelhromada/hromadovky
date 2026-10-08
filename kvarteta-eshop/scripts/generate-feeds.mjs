#!/usr/bin/env node
/**
 * Generuje produktové feedy do public/: heureka.xml + zbozi.xml (srovnávače),
 * google.xml (Google Merchant Center → reklamy v Nákupech) a llms.txt (stručný
 * popis obchodu pro AI vyhledávače / GEO). Běží v prebuild — feedy se aktualizují
 * samy s každým deployem, nové produkty stačí přidat do products.ts.
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
    { id: 'ZASILKOVNA', label: 'Zásilkovna', price: 79, cod: 79 + 39 },
    { id: 'PPL', label: 'PPL', price: 99, cod: 99 + 39 },
];
// Rozpad 5 dnů pro Google: výroba 1–3 dny + přeprava 1–2 dny (sync se SHIPPING_DETAILS v seo.ts).
const HANDLING_DAYS = { min: 1, max: 3 };
const TRANSIT_DAYS = { min: 1, max: 2 };
// Google taxonomie — textová cesta je v Merchant Center platná stejně jako číselné ID.
const GOOGLE_CATEGORY = 'Toys & Games > Games > Card Games';
// Produkty odkazující na cizí ochranné známky (Minecraft, Star Wars, Frozen, Harry Potter) do Google feedu NEPOSÍLAT:
// Merchant Center je zamítá (pravidla o padělcích/ochranných známkách) a opakované porušení
// umí suspendovat celý účet. Na webu a ve srovnávačích zůstávají.
const GOOGLE_EXCLUDED_IDS = new Set(['karty-tema-minecraft', 'karty-tema-star-wars', 'pexeso-frozen', 'karty-tema-prsi-car-a-kouzel']);

const CATEGORIES = {
    kartyProducts: {
        urlBase: '/karty',
        label: 'Hrací karty',
        heureka: 'Heureka.cz | Dětské zboží | Hračky | Společenské hry | Karetní hry',
        zbozi: 'Dětské zboží | Hračky | Společenské hry | Karetní hry',
        feedPrice: null, // null = použít price z products.ts
    },
    kvartetaProducts: {
        urlBase: '/kvarteta',
        label: 'Kvarteta',
        heureka: 'Heureka.cz | Dětské zboží | Hračky | Společenské hry | Karetní hry',
        zbozi: 'Dětské zboží | Hračky | Společenské hry | Karetní hry',
        feedPrice: null,
    },
    pexesoProducts: {
        urlBase: '/pexeso',
        label: 'Pexesa',
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
                shortDescription: description,
                categoryLabel: cat.label,
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

const googlePrice = (czk) => `${Number(czk).toFixed(2)} CZK`;

const googleShippingXml = DELIVERIES.map(
    (d) => `      <g:shipping>
        <g:country>CZ</g:country>
        <g:service>${escapeXml(d.label)}</g:service>
        <g:price>${googlePrice(d.price)}</g:price>
        <g:min_handling_time>${HANDLING_DAYS.min}</g:min_handling_time>
        <g:max_handling_time>${HANDLING_DAYS.max}</g:max_handling_time>
        <g:min_transit_time>${TRANSIT_DAYS.min}</g:min_transit_time>
        <g:max_transit_time>${TRANSIT_DAYS.max}</g:max_transit_time>
      </g:shipping>`,
).join('\n');

function googleItem(item) {
    const [main, ...alts] = item.images;
    return `    <item>
      <g:id>${escapeXml(item.id)}</g:id>
      <g:title>${escapeXml(item.name.slice(0, 150))}</g:title>
      <g:description>${escapeXml(item.description.slice(0, 5000))}</g:description>
      <g:link>${escapeXml(item.url)}</g:link>
      <g:image_link>${escapeXml(main)}</g:image_link>
${alts.map((a) => `      <g:additional_image_link>${escapeXml(a)}</g:additional_image_link>`).join('\n')}
      <g:availability>in_stock</g:availability>
      <g:price>${googlePrice(item.price)}</g:price>
      <g:condition>new</g:condition>
      <g:brand>Hromadovky</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>${escapeXml(GOOGLE_CATEGORY)}</g:google_product_category>
      <g:product_type>${escapeXml(item.categoryLabel)}</g:product_type>
${googleShippingXml}
    </item>`;
}

const googleXml = `<?xml version="1.0" encoding="utf-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Hromadovky</title>
    <link>${SITE}</link>
    <description>Ručně malovaná kvarteta, pexesa a hrací karty</description>
${items.filter((i) => !GOOGLE_EXCLUDED_IDS.has(i.id)).map(googleItem).join('\n')}
  </channel>
</rss>
`;

// llms.txt (llmstxt.org) — Markdown shrnutí pro AI vyhledávače. Fakta drž v sync s webem.
function llmsTxt() {
    const byCategory = Object.values(CATEGORIES).map((cat) => {
        const list = items
            .filter((i) => i.categoryLabel === cat.label)
            .map((i) => `- [${i.name}](${i.url}): ${i.shortDescription} Cena ${cat.feedPrice ? 'od ' : ''}${i.price} Kč.`)
            .join('\n');
        return `## ${cat.label}\n\n${list}`;
    });
    const cheapest = Math.min(...DELIVERIES.map((d) => d.price));
    return `# Hromadovky

> Rodinný český e-shop (www.hromadovky.cz) s ručně malovanými kvartety, pexesy a hracími kartami pro děti i dospělé. Vyrábí také kvarteta, pexesa a hrací karty z vlastních fotografií zákazníka — oblíbený osobní dárek.

- Provozovatel: Karel Hromada, IČO 76137767, neplátce DPH (ceny jsou konečné). Kontakt: info@hromadovky.cz
- Výroba a doručení do ${DELIVERY_DATE_DAYS} pracovních dnů po celé ČR. Doprava: ${DELIVERIES.map((d) => `${d.label} ${d.price} Kč`).join(', ')} (dobírka +${DELIVERIES[0].cod - DELIVERIES[0].price} Kč), tedy od ${cheapest} Kč.
- Tisk na prémiový lesklý fotopapír 220 mikronů, oboustranná laminace 200 mikronů (odolné proti ohybu, vodě a zašpinění).
- Vrácení zboží do 14 dnů od převzetí (neplatí pro personalizované sady z vlastních fotek).

## Karty z vlastních fotek

- [Kvarteto, pexeso a hrací karty z vlastních fotek](${SITE}/vlastni-karty): zákazník nahraje fotky v online editoru, náhled vidí hned v prohlížeči. Pexeso z fotek od 249 Kč (16 karet), rodinné hrací karty 299 Kč, vlastní kvarteto 599 Kč.

${byCategory.join('\n\n')}

## Další informace

- [Často kladené otázky](${SITE}/faq)
- [O nás](${SITE}/o-nas): příběh rodiny, která karty navrhuje nejdřív pro vlastní děti
- [Obchodní podmínky](${SITE}/obchodni-podminky)
- [Reklamační řád](${SITE}/reklamacni-rad)
`;
}

writeFileSync(resolve(PUBLIC_DIR, 'heureka.xml'), heurekaXml, 'utf8');
writeFileSync(resolve(PUBLIC_DIR, 'zbozi.xml'), zboziXml, 'utf8');
writeFileSync(resolve(PUBLIC_DIR, 'google.xml'), googleXml, 'utf8');
writeFileSync(resolve(PUBLIC_DIR, 'llms.txt'), llmsTxt(), 'utf8');
console.log(`✓ feedy vygenerovány: heureka.xml + zbozi.xml + google.xml + llms.txt (${items.length} produktů)`);
