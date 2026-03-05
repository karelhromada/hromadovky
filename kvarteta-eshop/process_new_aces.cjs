const sharp = require('sharp');
const path = require('path');

const srcZaludy = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e/witch_eso_zaludy_1772690553579.png';
const srcKule = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e/witch_eso_kule_1772690568090.png';

const destDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

const pairs = [
    { name: 'eso_zaludy', aiImage: srcZaludy, symbol: 'znak_žaludy.png' },
    { name: 'eso_kule', aiImage: srcKule, symbol: 'znak_kule.png' }
];

async function processAces() {
    for (const pair of pairs) {
        console.log(`Zpracovávám ${pair.name}...`);

        // 1. Ořez a škálování zdrojového AI obrázku
        const resizedPath = path.join(destDir, `${pair.name}.png`);
        await sharp(pair.aiImage)
            .resize(709, 1004, { fit: 'cover' }) // ořez na střed s aspect ratio 12:17
            .toFile(resizedPath);

        // 2. Přidání symbolů (dvakrát nahoře pro eso)
        const symbolPath = path.join(destDir, pair.symbol);
        const symbolSize = 130;

        const resizedSymbol = await sharp(symbolPath)
            .trim()
            .resize(symbolSize, symbolSize, { fit: 'inside' })
            .toBuffer();

        const cardImage = sharp(resizedPath);
        const metadata = await cardImage.metadata();
        const symbolMetadata = await sharp(resizedSymbol).metadata();

        const paddingLeftRight = 45;
        const paddingTop = 25;

        const outPath = path.join(destDir, `${pair.name}_oznaceno.png`);

        await cardImage
            .composite([
                // Levý horní roh
                { input: resizedSymbol, top: paddingTop, left: paddingLeftRight },
                // Pravý horní roh
                { input: resizedSymbol, top: paddingTop, left: metadata.width - symbolMetadata.width - paddingLeftRight }
            ])
            .toFile(outPath);

        console.log(`Hotovo: ${outPath}`);
    }
}

processAces().catch(console.error);
