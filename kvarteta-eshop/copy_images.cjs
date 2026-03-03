const fs = require('fs');
const path = require('path');

const srcDestMap = [
    { src: '../card_generator/Obrázky dinosaurů', prefix: 'dino' },
    { src: '../card_generator/Baby dráčci', prefix: 'baby' },
    { src: '../card_generator/Obrázky draků', prefix: 'drag' },
    { src: '../card_generator/Obrázky koček', prefix: 'cat' }
];

const dest = './public/cards';

srcDestMap.forEach(mapping => {
    // try different normalization forms if directory not found
    let srcDir = mapping.src;
    if (!fs.existsSync(srcDir)) {
        srcDir = srcDir.normalize('NFD');
    }
    if (!fs.existsSync(srcDir)) {
        srcDir = srcDir.normalize('NFC');
    }

    if (fs.existsSync(srcDir)) {
        const files = fs.readdirSync(srcDir).filter(f => !f.startsWith('.'));
        const toCopy = files.slice(0, 8);
        toCopy.forEach((file, index) => {
            const srcPath = path.join(srcDir, file);
            const ext = path.extname(file);
            const destPath = path.join(dest, `${mapping.prefix}_${index + 1}${ext}`);
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied ${mapping.prefix}_${index + 1}${ext}`);
        });
    } else {
        console.error(`Directory not found: ${mapping.src}`);
    }
});
