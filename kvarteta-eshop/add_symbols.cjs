const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const cardsDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

const pairs = [
    { symbol: 'znak_kule.png', card: 'kral_kule.png', out: 'kral_kule_oznaceno.png' },
    { symbol: 'znak_žaludy.png', card: 'kral_zaludy.png', out: 'kral_zaludy_oznaceno.png' }
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
                .toBuffer();

            // 2. Provedeme kompozici na samotnou kartu
            // Karta má rozlišení 709 x 1004.
            // Rohové odsazení dáme např. 40px od kraje a 40px ze shora.

            // Znak vpravo nahoře bude zrcadlově obrácen podle osy Y (horizontálně)? - u klasických karet se znaky většinou jen přesouvají, srdce je symetrické, takže flop (překlopení) dělat nutně nemusíme.
            // Spíše jde o to umístit ho napravo nahoru se stejným odsazením.

            const cardImage = sharp(cardPath);
            const metadata = await cardImage.metadata();
            const symbolMetadata = await sharp(resizedSymbol).metadata();

            const paddingLeftRight = 45; // 15 + 30 od hrany
            const paddingTop = 25; // 15 + 10 od vrchu

            await cardImage
                .composite([
                    // Levý horní roh
                    { input: resizedSymbol, top: paddingTop, left: paddingLeftRight },
                    // Pravý horní roh symetricky s ohledem na skutečnou odvozenou šířku symbolu
                    { input: resizedSymbol, top: paddingTop, left: metadata.width - symbolMetadata.width - paddingLeftRight }
                ])
                .toFile(outPath);

            console.log("Hotovo! Výsledek uložen jako:", outPath);

        } catch (err) {
            console.error(`Chyba během kompozice u ${pair.card}:`, err);
        }
    }
}

addSymbolsToCard();
