const sharp = require('sharp');
const path = require('path');

const destDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

const pairs = [
    { name: 'eso_srdce', aiImage: path.join(destDir, 'eso_srdce.png'), symbol: 'znak_srdce.png' },
    { name: 'eso_listy', aiImage: path.join(destDir, 'eso_listy.png'), symbol: 'znak_zelené.png' }
];

async function processAces() {
    for (const pair of pairs) {
        console.log(`Zpracovávám ${pair.name}...`);

        // 1. Ořez, škálování zdrojového obrázku a uložení do paměti jako buffer
        const resizedBuffer = await sharp(pair.aiImage)
            .resize(709, 1004, { fit: 'cover' }) // ořez na střed s aspect ratio 12:17
            .toBuffer();

        // 2. Přidání symbolů (dvakrát nahoře pro eso)
        const symbolPath = path.join(destDir, pair.symbol);
        const symbolSize = 130;

        const resizedSymbol = await sharp(symbolPath)
            .trim()
            .resize(symbolSize, symbolSize, { fit: 'inside' })
            .toBuffer();

        const cardImage = sharp(resizedBuffer);
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
