const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const srcDir = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e';
const destDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

async function processSevens() {
    const files = fs.readdirSync(srcDir);
    let processed = 0;

    for (const file of files) {
        if (!file.endsWith('.png')) continue;
        if (!file.includes('witch_sedmicka_')) continue;

        const fullSrcPath = path.join(srcDir, file);

        // Vytvořit čisté jméno (např. 'witch_sedmicka_srdce_123.png' -> 'sedmicka_srdce_oznaceno.png')
        let cleanName = file.replace(/^witch_/, '').replace(/_[0-9]+\.png$/, '.png');
        if (!cleanName.endsWith('.png')) cleanName += '.png';

        const finalDestName = cleanName.replace('.png', '_oznaceno.png');
        const fullDestPath = path.join(destDir, finalDestName);

        console.log(`Zpracovávám: ${file} -> ořezávám přímo do: ${finalDestName} ...`);

        try {
            await sharp(fullSrcPath)
                .resize(709, 1004, { fit: 'cover' })
                .toFile(fullDestPath);

            console.log(`✅ Úspěšně uloženo a oříznuto k použití: ${finalDestName}`);
            processed++;
        } catch (error) {
            console.error(`❌ Chyba při zpracování ${file}:`, error);
        }
    }

    console.log(`Hotovo, zprocesováno Sedmiček: ${processed}`);
}

processSevens().catch(console.error);
