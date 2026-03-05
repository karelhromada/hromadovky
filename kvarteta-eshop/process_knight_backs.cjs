const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const INPUT_DIR = path.join(__dirname, '../card_generator');
const OUTPUT_DIR = path.join(__dirname, 'public/cards');

const filesToProcess = [
    { in: 'knight_back_crest.png', out: 'knight_back_crest.webp' },
    { in: 'knight_back_gate.png', out: 'knight_back_gate.webp' },
    { in: 'knight_back_iron_steel.png', out: 'knight_back_iron_steel.webp' },
    { in: 'knight_back_pattern.png', out: 'knight_back_pattern.webp' }
];

async function processImages() {
    for (const file of filesToProcess) {
        const inputPath = path.join(INPUT_DIR, file.in);
        const outputPath = path.join(OUTPUT_DIR, file.out);

        if (fs.existsSync(inputPath)) {
            console.log(`Processing ${file.in}...`);
            await sharp(inputPath)
                .rotate(90) // Apply the 90-deg rotation they had on the A4 template
                .resize(709, 1004, {
                    fit: 'cover',
                    position: 'center'
                })
                .webp({ quality: 90 })
                .toFile(outputPath);
            console.log(`Saved ${file.out}`);
        } else {
            console.log(`File not found: ${inputPath}`);
        }
    }
}

processImages();
