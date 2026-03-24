const sharp = require('sharp');
const path = require('path');

const cardsDir = path.join(__dirname, 'public', 'cards', 'carodejnice');
const src = path.join(cardsDir, 'witch_desitka_kule_1772691240714.png');
const dest = path.join(cardsDir, 'desitka_kule.png');

console.log('Zpracovávám:', src);
console.log('Zapisuji do:', dest);

sharp(src)
    .resize(709, 1004, { fit: 'cover' })
    .toFile(dest)
    .then(() => {
        console.log('✅ Úspěšně oříznuto a uloženo jako desitka_kule.png');
    })
    .catch(err => {
        console.error('❌ Nastala chyba při ořezávání:', err);
    });
