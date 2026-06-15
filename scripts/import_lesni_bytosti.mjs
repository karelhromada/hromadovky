#!/usr/bin/env node
// One-shot importer pro kvarteto "Lesní bytosti":
//   kvarteta/Lesní bytosti/Finální karty/Lesní_bytosti 65x95/q_*.png
//     -> kvarteta-eshop/public/cards/lesni_bytosti/q_*.webp
//
// Vzor: scripts/import_new_artwork.mjs (sharp, quality 90). Rozměr zachováváme
// (zdroj 741×1083 < 1400 px), jen převádíme PNG -> webp.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const WEBP_QUALITY = 90;
const WEBP_EFFORT = 6;
const MAX_DIMENSION = 1400;

const SRC_DIR = path.join(ROOT, 'kvarteta/Lesní bytosti/Finální karty/Lesní_bytosti 65x95');
const DEST_DIR = path.join(ROOT, 'kvarteta-eshop/public/cards/lesni_bytosti');

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
    console.log('Importing "Lesní bytosti" cards into kvarteta-eshop/public/cards/lesni_bytosti ...');
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
    console.log(`[Lesní bytosti] converted ${converted} -> ${DEST_DIR}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
