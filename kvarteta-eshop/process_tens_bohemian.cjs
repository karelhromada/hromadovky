const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const srcDir = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e';
const destDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

const tens = [
    { src: 'witch_desitka_srdce_1772691198630.png', suit: 'srdce' },
    { src: 'witch_desitka_listy_1772691213142.png', suit: 'zelen' },
    { src: 'witch_desitka_zaludy_1772691226753.png', suit: 'aludy' },
    { src: 'witch_desitka_kule_1772691240714.png', suit: 'kule' }
];

const symbolSize = 130;

const leftPoints = [120, 220, 320, 420, 520].map(y => ({ cx: 175, cy: y }));
const rightPoints = [120, 220, 320, 420, 520].map(y => ({ cx: 534, cy: y }));
const allPoints = [...leftPoints, ...rightPoints];

// Removed SVG generator for X

async function processBohemianTens() {
    const files = fs.readdirSync(destDir);
    const getSymbolFileName = (suitQuery) => {
        return files.find(f => f.startsWith('znak_') && f.includes(suitQuery));
    };

    for (const card of tens) {
        const fullSrcPath = path.join(srcDir, card.src);
        if (!fs.existsSync(fullSrcPath)) {
            console.log(`Chybí zdroj: ${card.src}`);
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

        // Removed pushing of svgX to compositingArray

        // Translate suit name back
        let outSuit = card.suit;
        if (outSuit === 'aludy') outSuit = 'zaludy';
        if (outSuit === 'zelen') outSuit = 'listy';

        const outputName = `desitka_${outSuit}_oznaceno.png`;
        const outputPath = path.join(destDir, outputName);

        console.log(`Skládám Bohemian 10: ${outputName}`);

        const baseCrop = await sharp(fullSrcPath)
            .resize(709, 1004, { fit: 'cover' })
            .toBuffer();

        await sharp(baseCrop)
            .composite(compositingArray)
            .toFile(outputPath);

        console.log(`✅ Uloženo Bohemian 10: ${outputName}`);
    }
}

processBohemianTens().catch(console.error);
