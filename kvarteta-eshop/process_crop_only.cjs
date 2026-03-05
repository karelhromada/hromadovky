const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const destDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

const filesToCrop = [
    'devitka_srdce.png', 'devitka_listy.png', 'devitka_zaludy.png', 'devitka_kule.png',
    'osmicka_srdce.png', 'osmicka_listy.png', 'osmicka_zaludy.png', 'osmicka_kule.png'
];

async function cropCardsToFormat() {
    for (const filename of filesToCrop) {
        const fullPath = path.join(destDir, filename);
        
        // Cesta pro nový soubor - rovnou "_oznaceno", i když jsou zatím bez znaku,
        // at je to konzistentni a muzeme je nalinkovat do webu stejne jako ostatni
        const outPath = path.join(destDir, filename.replace('.png', '_oznaceno.png'));
        
        if (!fs.existsSync(fullPath)) {
            console.log(`Soubor nebyl nalezen, přeskakuji: ${fullPath}`);
            continue;
        }

        console.log(`Ořezávám ${filename}...`);
        
        try {
            // Jen raw ořez na přesný rozměr 709x1004 bez přidávání loga (zatím)
            await sharp(fullPath)
                .resize(709, 1004, { fit: 'cover' }) 
                .toFile(outPath);
                
            console.log(`✅ Uloženo oříznuté: ${outPath}`);
        } catch (error) {
            console.error(`❌ Chyba při zpracování ${filename}:`, error);
        }
    }
}

cropCardsToFormat().catch(console.error);
