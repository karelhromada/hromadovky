const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const brainDir = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e';
const targetDir = path.join(__dirname, 'public/cards/princezny bez pozadi');

// Definice barev pro jednoltivé znaky
const colors = {
    'srdce': '#d32f2f', // Červená
    'zelene': '#2e7d32', // Zelená
    'kule': '#795548',   // Hnědá
    'zaludy': '#fbc02d'  // Zlatá/Žlutá
};

const cards = [
    { in: 'princezny_kralovna_srdce_1772727796863.png', out: 'kralovna_srdce.png', sign: 'znak_srdce.png', color: colors.srdce },
    { in: 'princezny_kralovna_zelene_1772727809507.png', out: 'kralovna_zelene.png', sign: 'znak_zelené.png', color: colors.zelene },
    { in: 'princezny_kral_zaludy_1772727839727.png', out: 'kral_kule.png', sign: 'znak_kule.png', color: colors.kule },
    { in: 'princezny_kral_kule_1772727825833.png', out: 'kral_zaludy.png', sign: 'znak_žaludy.png', color: colors.zaludy }
];

async function processCards() {
    for (const card of cards) {
        const inputPath = path.join(brainDir, card.in);
        const outputPath = path.join(targetDir, card.out);
        const signPath = path.join(targetDir, card.sign);

        try {
            // Priprava znaku: orizneme prebytecne misto a zmensime na presne 130px 
            const signBuffer = await sharp(signPath)
                .trim()
                .resize({
                    width: 130,
                    height: 130,
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .toBuffer();

            // Vytvoření jemného, elegantního vektorového rámečku pomocí SVG
            // Dvojitá linka: jedna tenčí vnější, silnější vnitřní, zaoblené rohy
            const svgFrame = `
                <svg width="709" height="1004" viewBox="0 0 709 1004" xmlns="http://www.w3.org/2000/svg">
                    <rect x="25" y="25" width="659" height="954" rx="20" fill="none" stroke="${card.color}" stroke-width="2" />
                    <rect x="32" y="32" width="645" height="940" rx="15" fill="none" stroke="${card.color}" stroke-width="4" />
                </svg>
            `;

            // Vytvoreni finalni karty na cistem bilym pozadi 709x1004 px s rameckem
            await sharp(inputPath)
                .flatten({ background: { r: 255, g: 255, b: 255 } })
                .resize({
                    width: 709,
                    height: 1004,
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 1 }
                })
                .composite([
                    // Dekorativní rámeček vespod
                    { input: Buffer.from(svgFrame), top: 0, left: 0 },
                    // Dle SKILL.md: Král / Královna na trůnu - 2x Znak symetricky nahoře (zcela totožně jako Eso)
                    { input: signBuffer, top: 45, left: 55 },
                    { input: signBuffer, top: 45, left: 709 - 130 - 55 }
                ])
                .toFile(outputPath);

            console.log(`✅ Uloženo s rámečkem pro Krále/Královny: ${card.out}`);
        } catch (e) {
            console.error(`❌ Chyba při zpracování ${card.out}:`, e);
        }
    }
}

processCards();
