const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const srcDir = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e';
const destDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

const eights = [
    { src: 'witch_osmicka_srdce_1772693778055.png', suit: 'srdce' },
    { src: 'witch_osmicka_listy_1772693789231.png', suit: 'zelen' },
    { src: 'witch_osmicka_zaludy_1772693802058.png', suit: 'aludy' },
    { src: 'witch_osmicka_kule_1772693817463.png', suit: 'kule' }
];

const symbolSize = 130;

// Bohemian coordinates for 8s
const leftPoints = [100, 215, 330, 445].map(y => ({ cx: 175, cy: y }));
const rightPoints = [100, 215, 330, 445].map(y => ({ cx: 534, cy: y }));
const allPoints = [...leftPoints, ...rightPoints];

async function processBohemianEights() {
    const files = fs.readdirSync(destDir);
    const getSymbolFileName = (suitQuery) => {
        return files.find(f => f.startsWith('znak_') && f.includes(suitQuery));
    };

    for (const card of eights) {
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

        // Translate suit name back
        let outSuit = card.suit;
        if (outSuit === 'aludy') outSuit = 'zaludy';
        if (outSuit === 'zelen') outSuit = 'listy';

        const outputName = `osmicka_${outSuit}_oznaceno.png`;
        const outputPath = path.join(destDir, outputName);

        console.log(`Skládám Bohemian 8: ${outputName}`);

        const baseCrop = await sharp(fullSrcPath)
            .resize(709, 1004, { fit: 'cover' })
            .toBuffer();

        await sharp(baseCrop)
            .composite(compositingArray)
            .toFile(outputPath);

        console.log(`✅ Uloženo Bohemian 8: ${outputName}`);
    }
}

processBohemianEights().catch(console.error);
