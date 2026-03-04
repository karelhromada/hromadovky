const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputDir = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e/';
const outputDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

const pairs = [
    { witch: 'witch_eso_srdce_1772662649462.png', out: 'eso_srdce.png' },
    { witch: 'witch_eso_listy_1772662686208.png', out: 'eso_listy.png' }
];

async function generateCards() {
    for (const pair of pairs) {
        const witchPath = path.join(inputDir, pair.witch);
        const outPath = path.join(outputDir, pair.out);

        if (!fs.existsSync(witchPath)) {
            console.error(`Missing files for ${pair.out}: ${witchPath}`);
            continue;
        }

        try {
            await sharp(witchPath)
                .resize(709, 1004, { fit: 'cover', position: 'center' })
                .png()
                .toFile(outPath);

            console.log(`Generated ${pair.out}`);
        } catch (err) {
            console.error(`Error generating ${pair.out}:`, err);
        }
    }
}

generateCards();
