const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const cardsDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

const pairs = [
    { symbol: 'znak_srdce.png', card: 'spodek_srdce.png', out: 'spodek_srdce_oznaceno.png' },
    { symbol: 'znak_zelené.png', card: 'spodek_listy.png', out: 'spodek_listy_oznaceno.png' },
    { symbol: 'znak_žaludy.png', card: 'spodek_zaludy.png', out: 'spodek_zaludy_oznaceno.png' },
    { symbol: 'znak_kule.png', card: 'spodek_kule.png', out: 'spodek_kule_oznaceno.png' }
];

async function addSymbolsToCard() {
    for (const pair of pairs) {
        const symbolPath = path.join(cardsDir, pair.symbol);
        const cardPath = path.join(cardsDir, pair.card);
        const outPath = path.join(cardsDir, pair.out);

        if (!fs.existsSync(symbolPath) || !fs.existsSync(cardPath)) {
            console.error(`Nenalezeny vstupní soubory pro ${pair.card}! Zkontroluj '${pair.symbol}' a '${pair.card}'.`);
            continue;
        }

        try {
            console.log("Začínám kompozici znaku...");

            // 1. Zmenšíme srdce trochu zvětšeně vůči předchozím 90px
            const newSize = 130;
            const resizedSymbol = await sharp(symbolPath)
                .trim()
                .resize(newSize, newSize, { fit: 'inside' })
                .rotate(180) // Otočíme znak vzhůru nohama
                .toBuffer();

            // 2. Provedeme kompozici na samotnou kartu
            const cardImage = sharp(cardPath);
            const metadata = await cardImage.metadata();
            const symbolMetadata = await sharp(resizedSymbol).metadata();

            const paddingLeftRight = 45; // 15 + 30 od hrany
            const paddingBottom = 25; // odsazení odspodu

            await cardImage
                .composite([
                    // Levý dolní roh (top: výška karty - výška znaku - odsazení zespoda)
                    { input: resizedSymbol, top: metadata.height - symbolMetadata.height - paddingBottom, left: paddingLeftRight }
                ])
                .toFile(outPath);

            console.log("Hotovo! Výsledek uložen jako:", outPath);

        } catch (err) {
            console.error(`Chyba během kompozice u ${pair.card}:`, err);
        }
    }
}

addSymbolsToCard();
