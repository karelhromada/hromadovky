const sharp = require('sharp');
const path = require('path');

const srcSrdce = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e/witch_desitka_srdce_1772691198630.png';
const srcListy = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e/witch_desitka_listy_1772691213142.png';
const srcZaludy = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e/witch_desitka_zaludy_1772691226753.png';
const srcKule = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e/witch_desitka_kule_1772691240714.png';

const destDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

const pairs = [
    { name: 'desitka_srdce', aiImage: srcSrdce, symbol: 'znak_srdce.png' },
    { name: 'desitka_listy', aiImage: srcListy, symbol: 'znak_zelené.png' },
    { name: 'desitka_zaludy', aiImage: srcZaludy, symbol: 'znak_žaludy.png' },
    { name: 'desitka_kule', aiImage: srcKule, symbol: 'znak_kule.png' }
];

async function processTens() {
    for (const pair of pairs) {
        console.log(`Zpracovávám ${pair.name}...`);

        // 1. Ořez a škálování zdrojového AI obrázku
        const resizedBuffer = await sharp(pair.aiImage)
            .resize(709, 1004, { fit: 'cover' }) // ořez na střed s aspect ratio 12:17
            .toBuffer();

        // 2. Přidání symbolů (desítky: pro jistotu nahoře stejné jako Eso a Král)
        // Pokud si uživatel bude pro desítky přát jen jeden znak či levý/pravý roh, doladíme.
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

processTens().catch(console.error);
