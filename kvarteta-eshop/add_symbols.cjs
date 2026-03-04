const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const cardsDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

// Obrázek srdce, který uživatel nahrál
const symbolPath = path.join(cardsDir, 'znak_srdce.png');
// Karta, na kterou to budeme aplikovat
const cardPath = path.join(cardsDir, 'kral_srdce.png');
// Výstupní soubor
const outPath = path.join(cardsDir, 'kral_srdce_oznaceno.png');

async function addSymbolsToCard() {
    if (!fs.existsSync(symbolPath) || !fs.existsSync(cardPath)) {
        console.error("Nenalezeny vstupní soubory! Zkontroluj 'znak_srdce.png' a 'kral_srdce.png'.");
        return;
    }

    try {
        console.log("Začínám kompozici znaku...");

        // 1. Zmenšíme srdce (nyní 450x450px)
        const newSize = 450;
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

        const padding = 40; // Odsazení od kraje

        await cardImage
            .composite([
                // Levý horní roh
                { input: resizedSymbol, top: padding, left: padding },
                // Pravý horní roh symetricky s ohledem na skutečnou odvozenou šířku symbolu
                { input: resizedSymbol, top: padding, left: metadata.width - symbolMetadata.width - padding }
            ])
            .toFile(outPath);

        console.log("Hotovo! Výsledek uložen jako:", outPath);

    } catch (err) {
        console.error("Chyba během kompozice:", err);
    }
}

addSymbolsToCard();
