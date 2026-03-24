const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const cardsDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

// Explicitní mapování: surový soubor -> čistý název
const fileMap = {
    'witch_desitka_kule_1772691240714.png': 'desitka_kule.png',
    'witch_desitka_listy_1772691213142.png': 'desitka_listy.png',
    'witch_desitka_srdce_1772691198630.png': 'desitka_srdce.png',
    'witch_desitka_zaludy_1772691226753.png': 'desitka_zaludy.png',
    'witch_devitka_kule_1772693736055.png': 'devitka_kule.png',
    'witch_devitka_listy_1772693708096.png': 'devitka_listy.png',
    'witch_devitka_srdce_1772693693658.png': 'devitka_srdce.png',
    'witch_devitka_zaludy_1772693721438.png': 'devitka_zaludy.png',
    'witch_osmicka_kule_1772693817463.png': 'osmicka_kule.png',
    'witch_osmicka_listy_1772693789231.png': 'osmicka_listy.png',
    'witch_osmicka_srdce_1772693778055.png': 'osmicka_srdce.png',
    'witch_osmicka_zaludy_1772693802058.png': 'osmicka_zaludy.png',
    'witch_sedmicka_kule_bg_1772713123748.png': 'sedmicka_kule.png',
    'witch_sedmicka_listy_1772697168164.png': 'sedmicka_listy.png',
    'witch_sedmicka_srdce_1772697143688.png': 'sedmicka_srdce.png',
    'witch_sedmicka_zaludy_1772697171931.png': 'sedmicka_zaludy.png'
};

async function processAll() {
    let processed = 0;
    let skipped = 0;

    for (const [srcName, destName] of Object.entries(fileMap)) {
        const srcPath = path.join(cardsDir, srcName);
        const destPath = path.join(cardsDir, destName);

        if (!fs.existsSync(srcPath)) {
            console.log(`⚠️  Přeskakuji (soubor nenalezen): ${srcName}`);
            skipped++;
            continue;
        }

        try {
            await sharp(srcPath)
                .resize(709, 1004, { fit: 'cover' })
                .toFile(destPath);
            console.log(`✅ ${srcName} -> ${destName}`);
            processed++;
        } catch (err) {
            console.error(`❌ Chyba u ${srcName}:`, err.message);
        }
    }

    console.log(`\nHotovo! Oříznuto: ${processed}, přeskočeno: ${skipped}`);
}

processAll();
