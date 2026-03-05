const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const destDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

async function processCards() {
    const files = fs.readdirSync(destDir);
    let processed = 0;

    for (const file of files) {
        if (!file.endsWith('.png')) continue;
        if (file.includes('_oznaceno')) continue; // already processed
        if (!file.includes('devitka') && !file.includes('osmicka')) continue; // only 8s and 9s

        const fullSrcPath = path.join(destDir, file);

        // Vytvorit ciste jmeno (odstranit 'witch_' a timestamp)
        // Ocekavane: 'witch_devitka_srdce_1772693693658.png' -> 'devitka_srdce_oznaceno.png'
        let cleanName = file.replace(/^witch_/, '').replace(/_[0-9]+\.png$/, '.png');
        if (!cleanName.endsWith('.png')) cleanName += '.png'; // Fallback

        const finalDestName = cleanName.replace('.png', '_oznaceno.png');
        const fullDestPath = path.join(destDir, finalDestName);

        console.log(`Zpracovávám: ${file} -> ořezávám do: ${finalDestName} ...`);

        try {
            await sharp(fullSrcPath)
                .resize(709, 1004, { fit: 'cover' })
                .toFile(fullDestPath);

            console.log(`✅ Úspěšně uloženo: ${finalDestName}`);
            processed++;

            // Delete original file to clean up
            fs.unlinkSync(fullSrcPath);
        } catch (error) {
            console.error(`❌ Chyba při zpracování ${file}:`, error);
        }
    }

    if (processed === 0) {
        console.log('⚠️ Žádné syrové devítky nebo osmičky k oříznutí nebyly ve složce nalezeny.');
    } else {
        console.log(`Hotovo, zprocesováno karet: ${processed}`);
    }
}

processCards().catch(console.error);
