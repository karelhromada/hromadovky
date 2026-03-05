const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const brainDir = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e';
const targetDir = path.join(__dirname, 'public/cards/princezny bez pozadi');

const colors = {
    'kule': '#e65100',  // Oranžovo-hnědá (saddle brown)
    'zaludy': '#fbc02d' // Zlatá (golden rod)
};

const cards = [
    { in: 'princezny_spodek_kule2_1772743834603.png', out: 'spodek_kule.png', sign: 'znak_kule.png', color: colors.kule },
    { in: 'princezny_spodek_zaludy_1772743820750.png', out: 'spodek_zaludy.png', sign: 'znak_žaludy.png', color: colors.zaludy }
];

async function processCards() {
    for (const card of cards) {
        const inputPath = path.join(brainDir, card.in);
        const outputPath = path.join(targetDir, card.out);
        const signPath = path.join(targetDir, card.sign);

        try {
            const signBuffer = await sharp(signPath)
                .trim()
                .resize({
                    width: 130,
                    height: 130,
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .toBuffer();

            const svgFrame = `
                <svg width="709" height="1004" viewBox="0 0 709 1004" xmlns="http://www.w3.org/2000/svg">
                    <rect x="25" y="25" width="659" height="954" rx="20" fill="none" stroke="${card.color}" stroke-width="2" />
                    <rect x="32" y="32" width="645" height="940" rx="15" fill="none" stroke="${card.color}" stroke-width="4" />
                </svg>
            `;

            await sharp(inputPath)
                .flatten({ background: { r: 255, g: 255, b: 255 } })
                .resize({
                    width: 709,
                    height: 1004,
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 1 }
                })
                .composite([
                    { input: Buffer.from(svgFrame), top: 0, left: 0 },
                    // SKILL.md: Spodek (Učedník) - 1x Znak vlevo dole (padding-left: 45px, padding-bottom: 25px)
                    // Upraveno pro rámeček na left: 55, bottom: 45 (1004 - 130 - 45 = 829)
                    { input: signBuffer, top: 829, left: 55 }
                ])
                .toFile(outputPath);

            console.log(`✅ Uloženo s novým dynamickým princem a rámečkem: ${card.out}`);
        } catch (e) {
            console.error(`❌ Chyba při zpracování ${card.out}:`, e);
        }
    }
}

processCards();
