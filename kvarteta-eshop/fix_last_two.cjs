const sharp = require('sharp');
const path = require('path');

const dir = path.join(__dirname, 'public', 'cards', 'carodejnice');

async function fix() {
    // 1. Oříznout witch_sedmicka_listy
    await sharp(path.join(dir, 'witch_sedmicka_listy_1772697158164.png'))
        .resize(709, 1004, { fit: 'cover' })
        .toFile(path.join(dir, 'sedmicka_listy.png'));
    console.log('✅ sedmicka_listy.png');

    // 2. Oříznout sedmicka_srdce (přepsat sám sebe přes temp)
    const buf = await sharp(path.join(dir, 'sedmicka_srdce.png'))
        .resize(709, 1004, { fit: 'cover' })
        .toBuffer();
    require('fs').writeFileSync(path.join(dir, 'sedmicka_srdce.png'), buf);
    console.log('✅ sedmicka_srdce.png');

    console.log('Hotovo! Obě sedmičky opraveny.');
}

fix().catch(console.error);
