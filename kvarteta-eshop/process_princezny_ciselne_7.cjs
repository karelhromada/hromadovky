const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const brainDir = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e';
const targetDir = path.join(__dirname, 'public/cards/princezny bez pozadi');

// Definice barev pro jednoltive znaky ze serie Princezen
const colors = {
    'srdce': '#d32f2f', // Červená
    'zelene': '#2e7d32', // Zelená
    'kule': '#795548',   // Hnědá
    'zaludy': '#fbc02d'  // Zlatá/Žlutá
};

const cards = [
    { in: path.join('/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e', 'princezny_7_srdce_1772745001644.png'), out: 'sedmicka_srdce.png', sign: 'znak_srdce.png', color: colors.srdce, scale: 1.45 },
    { in: path.join('/Users/air2024/.gemini/antigravity/brain/0b6bb8e1-805d-4bad-888b-66a304df3e02', 'princezny_7_zelene_new_1772781065090.png'), out: 'sedmicka_zelene.png', sign: 'znak_zelené.png', color: colors.zelene, scale: 0.75 },
    { in: path.join('/Users/air2024/.gemini/antigravity/brain/0b6bb8e1-805d-4bad-888b-66a304df3e02', 'princezny_7_kule_new_1772781078196.png'), out: 'sedmicka_kule.png', sign: 'znak_kule.png', color: colors.kule, scale: 0.75 },
    { in: path.join('/Users/air2024/.gemini/antigravity/brain/0b6bb8e1-805d-4bad-888b-66a304df3e02', 'princezny_7_zaludy_no_acorn_1772781178839.png'), out: 'sedmicka_zaludy.png', sign: 'znak_žaludy.png', color: colors.zaludy, scale: 0.65 }
];

async function processCards() {
    for (const card of cards) {
        const inputPath = card.in;
        const outputPath = path.join(targetDir, card.out);
        const signPath = path.join(targetDir, card.sign);

        try {
            // Pro ciselne karty zmenšujeme symbol na velikost cca 100x100
            const signBuffer = await sharp(signPath)
                .trim()
                .resize({
                    width: 100,
                    height: 100,
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .toBuffer();

            // Vytvoření jemného vektorového rámečku
            const svgFrame = `
                <svg width="709" height="1004" viewBox="0 0 709 1004" xmlns="http://www.w3.org/2000/svg">
                    <rect x="25" y="25" width="659" height="954" rx="20" fill="none" stroke="${card.color}" stroke-width="2" />
                    <rect x="32" y="32" width="645" height="940" rx="15" fill="none" stroke="${card.color}" stroke-width="4" />
                </svg>
            `;

            const composites = [
                { input: Buffer.from(svgFrame), top: 0, left: 0 }
            ];

            // 3 znaky na leve strane, 3 na prave
            const yPositions = [180, 480, 780];
            const leftColumnX = 65;
            const rightColumnX = 709 - 100 - 65; // 544

            for (const y of yPositions) {
                composites.push({ input: signBuffer, top: y, left: leftColumnX });
                composites.push({ input: signBuffer, top: y, left: rightColumnX });
            }

            // 1 centralni znak nahore
            const middleX = Math.floor((709 - 100) / 2); // 304
            composites.push({ input: signBuffer, top: 45, left: middleX });

            // Zmenšení nebo zvětšení obrázku
            let baseImg = sharp(inputPath).flatten({ background: { r: 255, g: 255, b: 255 } });
            if (card.scale && card.scale !== 1) {
                const meta = await baseImg.metadata();
                if (card.scale < 1) {
                    const padRatio = ((1 / card.scale) - 1) / 2;
                    const padHor = Math.floor(meta.width * padRatio);
                    const padVer = Math.floor(meta.height * padRatio);

                    baseImg = sharp(await baseImg.extend({
                        top: padVer, bottom: padVer, left: padHor, right: padHor,
                        background: { r: 255, g: 255, b: 255, alpha: 1 }
                    }).toBuffer());
                } else if (card.scale > 1) {
                    const targetWidth = Math.round(meta.width * card.scale);
                    const targetHeight = Math.round(meta.height * card.scale);

                    const left = Math.round((targetWidth - meta.width) / 2);
                    const top = Math.round((targetHeight - meta.height) / 2);

                    baseImg = sharp(await baseImg.resize(targetWidth, targetHeight).extract({
                        left: left,
                        top: top,
                        width: meta.width,
                        height: meta.height
                    }).toBuffer());
                }
            }

            // Vytvoreni finalni karty
            await baseImg
                .resize({
                    width: 709,
                    height: 1004,
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 1 }
                })
                .composite(composites)
                .toFile(outputPath);

            console.log(`✅ Uložena sedmička: ${card.out}`);
        } catch (e) {
            console.error(`❌ Chyba při zpracování ${card.out}:`, e);
        }
    }
}

processCards();
