const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputFile = path.join(__dirname, 'public/cards/neutral_back_ruby.png');
const outputFile = path.join(__dirname, 'public/cards/neutral_back_ruby_formatted.png');

async function processBack() {
    try {
        console.log(`Zpracovávám rubínové pozadí...`);

        await sharp(inputFile)
            .resize({
                width: 709,
                height: 1004,
                fit: 'cover',
                position: 'center'
            })
            .toFile(outputFile);

        console.log(`✅ Uloženo formátované rubínové pozadí: ${outputFile}`);
    } catch (err) {
        console.error('Chyba při zpracování:', err);
    }
}

processBack();
