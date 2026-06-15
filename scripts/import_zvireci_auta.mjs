#!/usr/bin/env node
// One-shot importer pro kvarteto "Zvířecí auta":
//   kvarteta/Zvířecí auta/Finální karty/q_*.png
//     -> kvarteta-eshop/public/cards/zvireci_auta/q_*.webp
//
// Vzor: scripts/import_lesni_bytosti.mjs. Jediný rozdíl: zdroj je přímo ve
// "Finální karty" (bez mezisložky ...65x95). Rozměr zachováváme (741×1083 < 1400).

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const WEBP_QUALITY = 90;
const WEBP_EFFORT = 6;
const MAX_DIMENSION = 1400;

const SRC_DIR = path.join(ROOT, 'kvarteta/Zvířecí auta/Finální karty');
const DEST_DIR = path.join(ROOT, 'kvarteta-eshop/public/cards/zvireci_auta');

async function convertOne(srcPath, destPath) {
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
    await pipeline.webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT }).toFile(destPath);
}

async function main() {
    console.log('Importing "Zvířecí auta" cards into kvarteta-eshop/public/cards/zvireci_auta ...');
    await fs.mkdir(DEST_DIR, { recursive: true });

    const entries = await fs.readdir(SRC_DIR);
    const pngFiles = entries
        .filter((name) => /^q_\d+[A-D]\.png$/i.test(name))
        .sort();

    if (pngFiles.length === 0) {
        throw new Error(`No q_*.png files found in ${SRC_DIR}`);
    }

    let converted = 0;
    for (const file of pngFiles) {
        const stem = path.basename(file, path.extname(file));
        const dest = path.join(DEST_DIR, `${stem}.webp`);
        await convertOne(path.join(SRC_DIR, file), dest);
        converted += 1;
    }
    console.log(`[Zvířecí auta] converted ${converted} -> ${DEST_DIR}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
