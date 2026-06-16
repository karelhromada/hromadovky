#!/usr/bin/env node
// One-shot importer pro hraci karty "Prsi car a kouzel" (Harry Potter tematicka sada):
//   hraci_karty/Harry Potter/Finální karty/*.png -> kvarteta-eshop/public/cards/prsi-car-a-kouzel/*.webp
//
// Prevadi PNG -> WebP (q90, max 1400px) a normalizuje diakriticke nazvy na ASCII
// (Červené_Eso.png -> Cervene_Eso.webp), aby filtr barev v ProductShowcaseKarty fungoval.
// Vzor: scripts/import_new_artwork.mjs (funkce importCardSet/normaliseName).

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const WEBP_QUALITY = 90;
const MAX_DIMENSION = 1400;

const NAME_MAP = {
    'Červené': 'Cervene',
    'Zelené': 'Zelene',
    'Žaludy': 'Zaludy',
    'Král': 'Kral',
    'Svršek': 'Svrsek',
};

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

const SUIT_PATTERN = /^(Červené|Zelené|Žaludy|Kule)_/u;
const VALUE_PATTERN = /_(7|8|9|10|Spodek|Svršek|Král|Eso)$/u;

function normaliseName(stem) {
    let out = stem;
    for (const [from, to] of Object.entries(NAME_MAP)) {
        out = out.split(from).join(to);
    }
    out = out.normalize('NFD').replace(COMBINING_DIACRITICS, '');
    return out;
}

function isAllowedCardName(stem) {
    return SUIT_PATTERN.test(stem) && VALUE_PATTERN.test(stem);
}

async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true });
}

async function convertOne(srcPath, destPath) {
    await ensureDir(path.dirname(destPath));
    const image = sharp(srcPath);
    const meta = await image.metadata();
    let pipeline = image;
    if ((meta.width ?? 0) > MAX_DIMENSION || (meta.height ?? 0) > MAX_DIMENSION) {
        pipeline = pipeline.resize({
            width: MAX_DIMENSION,
            height: MAX_DIMENSION,
            fit: 'inside',
            withoutEnlargement: true,
        });
    }
    await pipeline.webp({ quality: WEBP_QUALITY }).toFile(destPath);
}

async function importCardSet(label, srcDir, destDir) {
    const entries = await fs.readdir(srcDir);
    const pngFiles = entries.filter((name) => name.toLowerCase().endsWith('.png'));
    let converted = 0;
    let skipped = 0;
    for (const file of pngFiles) {
        const stemRaw = path.basename(file, path.extname(file));
        // macOS stores filenames in NFD; normalize to NFC so our patterns match.
        const stem = stemRaw.normalize('NFC');
        if (!isAllowedCardName(stem)) {
            skipped += 1;
            console.log(`  skip ${file} (not a final card name)`);
            continue;
        }
        const normalised = normaliseName(stem);
        const dest = path.join(destDir, `${normalised}.webp`);
        await convertOne(path.join(srcDir, file), dest);
        converted += 1;
    }
    console.log(`[${label}] converted ${converted}, skipped ${skipped} -> ${destDir}`);
    return converted;
}

async function main() {
    console.log('Importing "Prsi car a kouzel" cards into kvarteta-eshop/public ...');

    await importCardSet(
        'Prší čár a kouzel',
        path.join(ROOT, 'hraci_karty/Harry Potter/Finální karty'),
        path.join(ROOT, 'kvarteta-eshop/public/cards/prsi-car-a-kouzel'),
    );

    console.log('Done.');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
