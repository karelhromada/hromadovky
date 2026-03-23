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
    // FIGURKY (A, K, Q, J equivalent) - Size 130
    { id: 'eso', size: 130, coords: [{ left: 80, top: 80 }, { left: 499, top: 80 }] },
    { id: 'kral', size: 130, coords: [{ left: 80, top: 80 }, { left: 499, top: 80 }] },
    { id: 'svrsek', size: 130, coords: [{ left: 75, top: 65 }] },
    { id: 'spodek', size: 130, coords: [{ left: 75, top: 859 }] },
    
    // ČÍSLA (10 - 7) - Size 130
    { 
        id: 'desitka', size: 130, coords: [
            { left: 110, top: 70 }, { left: 110, top: 170 }, { left: 110, top: 270 }, { left: 110, top: 370 }, { left: 110, top: 470 },
            { left: 469, top: 70 }, { left: 469, top: 170 }, { left: 469, top: 270 }, { left: 469, top: 370 }, { left: 469, top: 470 }
        ] 
    },
    { 
        id: 'devitka', size: 130, coords: [
            { left: 289, top: 30 },
            { left: 110, top: 120 }, { left: 110, top: 235 }, { left: 110, top: 350 }, { left: 110, top: 465 },
            { left: 469, top: 120 }, { left: 469, top: 235 }, { left: 469, top: 350 }, { left: 469, top: 465 }
        ] 
    },
    { 
        id: 'osmicka', size: 130, coords: [
            { left: 110, top: 50 }, { left: 110, top: 165 }, { left: 110, top: 280 }, { left: 110, top: 395 },
            { left: 469, top: 50 }, { left: 469, top: 165 }, { left: 469, top: 280 }, { left: 469, top: 395 }
        ] 
    },
    { 
        id: 'sedmicka', size: 130, coords: [
            { left: 289, top: 30 },
            { left: 110, top: 150 }, { left: 110, top: 265 }, { left: 110, top: 380 },
            { left: 469, top: 150 }, { left: 469, top: 265 }, { left: 469, top: 380 }
        ] 
    }
];

async function addSymbolsToCards() {
    for (const suit of suits) {
        for (const figure of figures) {
            const symbolPath = path.join(cardsDir, suit.symbolFile);
            const cardBaseName = `${figure.id}_${suit.id}.png`;
            const cardPath = path.join(cardsDir, cardBaseName);
            const outPath = path.join(cardsDir, `${figure.id}_${suit.id}_oznaceno.png`);

            if (!fs.existsSync(symbolPath) || !fs.existsSync(cardPath)) {
                console.error(`Nenalezeny vstupní soubory pro ${figure.id}_${suit.id}! Přeskakuji... (${cardBaseName})`);
                continue;
            }

            try {
                console.log(`Zpracovávám: ${figure.id}_${suit.id}...`);

                // 1. Příprava znaku ve správné velikosti pro danou hodnost
                const newSize = figure.size;
                const resizedSymbol = await sharp(symbolPath)
                    .trim()
                    .resize(newSize, newSize, { fit: 'inside' })
                    .toBuffer();

                // 2. Vybudování seznamu operací pro compositing
                const composeOps = figure.coords.map(coord => ({
                    input: resizedSymbol,
                    top: coord.top,
                    left: coord.left
                }));

                // 3. Spojení a uložení
                await sharp(cardPath)
                    .composite(composeOps)
                    .toFile(outPath);

                console.log(`✅ Úspěšně uloženo: ${outPath}`);

            } catch (err) {
                console.error(`❌ Chyba během kompozice u ${figure.id}_${suit.id}:`, err);
            }
        }
    }
}

addSymbolsToCards();
