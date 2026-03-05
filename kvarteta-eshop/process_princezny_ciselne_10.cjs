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
    { in: 'princezny_10_srdce_1772744123110.png', out: 'desitka_srdce.png', sign: 'znak_srdce.png', color: colors.srdce },
    { in: 'princezny_10_zelene_1772744137572.png', out: 'desitka_zelene.png', sign: 'znak_zelené.png', color: colors.zelene },
    { in: 'princezny_10_kule_1772744151008.png', out: 'desitka_kule.png', sign: 'znak_kule.png', color: colors.kule },
    { in: 'princezny_10_zaludy_1772744164901.png', out: 'desitka_zaludy.png', sign: 'znak_žaludy.png', color: colors.zaludy }
];

async function processCards() {
    for (const card of cards) {
        const inputPath = path.join(brainDir, card.in);
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

            // Vytvoření jemného vektorového rámečku jako mají Princezny
            const svgFrame = `
                <svg width="709" height="1004" viewBox="0 0 709 1004" xmlns="http://www.w3.org/2000/svg">
                    <rect x="25" y="25" width="659" height="954" rx="20" fill="none" stroke="${card.color}" stroke-width="2" />
                    <rect x="32" y="32" width="645" height="940" rx="15" fill="none" stroke="${card.color}" stroke-width="4" />
                </svg>
            `;

            // Vytvoreni rozmisteni 10 znaku symetricky podel praveho a leveho okraje
            const composites = [
                { input: Buffer.from(svgFrame), top: 0, left: 0 }
            ];

            // Rovnomerné vertikalne odsazeni aby znaky pokryvaly cely okraj
            const yPositions = [80, 270, 460, 650, 840];
            const leftColumnX = 65;
            const rightColumnX = 709 - 100 - 65; // 544

            for (const y of yPositions) {
                composites.push({ input: signBuffer, top: y, left: leftColumnX });
                composites.push({ input: signBuffer, top: y, left: rightColumnX });
            }

            // Vytvoreni finalni karty
            await sharp(inputPath)
                .flatten({ background: { r: 255, g: 255, b: 255 } })
                .resize({
                    width: 709,
                    height: 1004,
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 1 }
                })
                .composite(composites)
                .toFile(outputPath);

            console.log(`✅ Uložena desítka: ${card.out}`);
        } catch (e) {
            console.error(`❌ Chyba při zpracování ${card.out}:`, e);
        }
    }
}

processCards();
