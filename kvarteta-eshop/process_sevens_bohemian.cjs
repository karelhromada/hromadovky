const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const srcDir = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e';
const destDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

const sevens = [
    { src: 'witch_sedmicka_srdce_1772697143688.png', suit: 'srdce' },
    { src: 'witch_sedmicka_listy_1772697158164.png', suit: 'zelen' },
    { src: 'witch_sedmicka_zaludy_1772697171931.png', suit: 'aludy' }
    // kule chybí kvůli API limitu
];

const symbolSize = 130;

// Bohemian coordinates for 7s
const topCenter = { cx: 354, cy: 80 };
const leftPoints = [200, 315, 430].map(y => ({ cx: 175, cy: y }));
const rightPoints = [200, 315, 430].map(y => ({ cx: 534, cy: y }));
const allPoints = [topCenter, ...leftPoints, ...rightPoints];

async function processBohemianSevens() {
    const files = fs.readdirSync(destDir);
    const getSymbolFileName = (suitQuery) => {
        return files.find(f => f.startsWith('znak_') && f.includes(suitQuery));
    };

    for (const card of sevens) {
        const fullSrcPath = path.join(srcDir, card.src);
        if (!fs.existsSync(fullSrcPath)) {
            console.log(`Chybí zdroj pro skládání sedmičky: ${card.src}`);
            continue;
        }

        const symbolFileName = getSymbolFileName(card.suit);
        if (!symbolFileName) {
            console.log(`Nenalezen symbol pro: ${card.suit}`);
            continue;
        }

        const symbolPath = path.join(destDir, symbolFileName);

        // Prepare symbol buffer with trim to match AKQJ sizes
        const symbolBuffer = await sharp(symbolPath)
            .trim()
            .resize(symbolSize, symbolSize, { fit: 'inside' })
            .toBuffer();

        const compositingArray = allPoints.map(pt => ({
            input: symbolBuffer,
            top: Math.round(pt.cy - symbolSize / 2),
            left: Math.round(pt.cx - symbolSize / 2)
        }));

        // Translate suit name back
        let outSuit = card.suit;
        if (outSuit === 'aludy') outSuit = 'zaludy';
        if (outSuit === 'zelen') outSuit = 'listy';

        const outputName = `sedmicka_${outSuit}_oznaceno.png`;
        const outputPath = path.join(destDir, outputName);

        console.log(`Skládám Bohemian 7: ${outputName}`);

        const baseCrop = await sharp(fullSrcPath)
            .resize(709, 1004, { fit: 'cover' })
            .toBuffer();

        await sharp(baseCrop)
            .composite(compositingArray)
            .toFile(outputPath);

        console.log(`✅ Uloženo Bohemian 7: ${outputName}`);
    }
}

processBohemianSevens().catch(console.error);
