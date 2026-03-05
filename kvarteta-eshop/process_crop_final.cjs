const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const destDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

const filesToCrop = [
    { src: 'witch_devitka_srdce_1772693693658.png', dest: 'devitka_srdce_oznaceno.png' },
    { src: 'witch_devitka_listy_1772693708096.png', dest: 'devitka_listy_oznaceno.png' },
    { src: 'witch_devitka_zaludy_1772693721438.png', dest: 'devitka_zaludy_oznaceno.png' },
    { src: 'witch_devitka_kule_1772693736055.png', dest: 'devitka_kule_oznaceno.png' },

    { src: 'witch_osmicka_srdce_1772693778055.png', dest: 'osmicka_srdce_oznaceno.png' },
    { src: 'witch_osmicka_listy_1772693789231.png', dest: 'osmicka_listy_oznaceno.png' },
    { src: 'witch_osmicka_zaludy_1772693802058.png', dest: 'osmicka_zaludy_oznaceno.png' },
    { src: 'witch_osmicka_kule_1772693817463.png', dest: 'osmicka_kule_oznaceno.png' },
    { src: 'devitka_srdce.png', dest: 'devitka_srdce_oznaceno.png' } // Záloha
];

async function cropCardsToFormat() {
    for (const file of filesToCrop) {
        let fullSrcPath = path.join(destDir, file.src);
        const fullDestPath = path.join(destDir, file.dest);

        if (!fs.existsSync(fullSrcPath)) {
            // Zkusime jeste jestli uzivatel nepouzil ty zkracene nazvy
            fullSrcPath = path.join(destDir, file.src.replace(/witch_/, '').replace(/_[0-9]+\.png/, '.png'));
            if (!fs.existsSync(fullSrcPath)) {
                console.log(`Soubor nebyl nalezen, přeskakuji: ${fullSrcPath}`);
                continue;
            }
        }

        console.log(`Ořezávám ${file.dest}...`);

        try {
            await sharp(fullSrcPath)
                .resize(709, 1004, { fit: 'cover' })
                .toFile(fullDestPath);

            console.log(`✅ Uloženo oříznuté do cesty e-shopu: ${fullDestPath}`);
        } catch (error) {
            console.error(`❌ Chyba při zpracování ${file.dest}:`, error);
        }
    }
}

cropCardsToFormat().catch(console.error);
