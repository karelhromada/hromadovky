const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const cardsDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

const pairs = [
    { symbol: 'znak_srdce.png', card: 'svrsek_srdce.png', out: 'svrsek_srdce_oznaceno.png' },
    { symbol: 'znak_zelené.png', card: 'svrsek_listy.png', out: 'svrsek_listy_oznaceno.png' },
    { symbol: 'znak_žaludy.png', card: 'svrsek_zaludy.png', out: 'svrsek_zaludy_oznaceno.png' },
    { symbol: 'znak_kule.png', card: 'svrsek_kule.png', out: 'svrsek_kule_oznaceno.png' }
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

            // Znak vlevo nahoře (bez rotace)
            const newSize = 130;
            const resizedSymbol = await sharp(symbolPath)
                .trim()
                .resize(newSize, newSize, { fit: 'inside' })
                .toBuffer();

            // 2. Provedeme kompozici na samotnou kartu
            const cardImage = sharp(cardPath);
            const metadata = await cardImage.metadata();
            const symbolMetadata = await sharp(resizedSymbol).metadata();

            const paddingLeftRight = 45; // 15 + 30 od hrany
            const paddingTop = 25; // odsazení shora

            await cardImage
                .composite([
                    // Levý horní roh 
                    { input: resizedSymbol, top: paddingTop, left: paddingLeftRight }
                ])
                .toFile(outPath);

            console.log("Hotovo! Výsledek uložen jako:", outPath);

        } catch (err) {
            console.error(`Chyba během kompozice u ${pair.card}:`, err);
        }
    }
}

addSymbolsToCard();
