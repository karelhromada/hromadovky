const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const cardsDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

const suits = [
    { id: 'srdce', symbolFile: 'znak_srdce.png' },
    { id: 'listy', symbolFile: 'znak_zelené.png' },
    { id: 'zaludy', symbolFile: 'znak_žaludy.png' },
    { id: 'kule', symbolFile: 'znak_kule.png' }
];

const figures = [
    { id: 'eso', name: 'Eso', coords: [{ left: 80, top: 80 }, { left: 409, top: 80 }] },
    { id: 'kral', name: 'Král', coords: [{ left: 80, top: 80 }, { left: 409, top: 80 }] },
    { id: 'svrsek', name: 'Svršek', coords: [{ left: 75, top: 75 }] },
    { id: 'spodek', name: 'Spodek', coords: [{ left: 75, top: 869 }] }
];

async function addSymbolsToCards() {
    for (const suit of suits) {
        for (const figure of figures) {
            const symbolPath = path.join(cardsDir, suit.symbolFile);
            const cardPath = path.join(cardsDir, `${figure.id}_${suit.id}.png`);
            const outPath = path.join(cardsDir, `${figure.id}_${suit.id}_oznaceno.png`);

            if (!fs.existsSync(symbolPath) || !fs.existsSync(cardPath)) {
                console.error(`Nenalezeny vstupní soubory pro ${figure.id}_${suit.id}! Přeskakuji...`);
                continue;
            }

            try {
                console.log(`Zpracovávám: ${figure.id}_${suit.id}...`);

                // Příprava znaku
                const newSize = 130;
                const resizedSymbol = await sharp(symbolPath)
                    .trim()
                    .resize(newSize, newSize, { fit: 'inside' })
                    .toBuffer();

                // Vybudování seznamu operací pro Sharp compositing (včetně více znaků pro A, K)
                const composeOps = figure.coords.map(coord => ({
                    input: resizedSymbol,
                    top: coord.top,
                    left: coord.left
                }));

                await sharp(cardPath)
                    .composite(composeOps)
                    .toFile(outPath);

                console.log(`Úspěšně uloženo: ${outPath}`);

            } catch (err) {
                console.error(`Chyba během kompozice u ${figure.id}_${suit.id}:`, err);
            }
        }
    }
}

addSymbolsToCards();
