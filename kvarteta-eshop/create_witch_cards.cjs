const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, 'public', 'cards');

const pairs = [
    { witch: 'witch_fire.png', frame: 'witch_frame_srdce.png', out: 'witch_card_srdce.png' },
    { witch: 'witch_forest.png', frame: 'witch_frame_listy.png', out: 'witch_card_listy.png' },
    { witch: 'witch_sand.png', frame: 'witch_frame_zaludy.png', out: 'witch_card_zaludy.png' },
    { witch: 'witch_earth.png', frame: 'witch_frame_kule.png', out: 'witch_card_kule.png' }
];

async function generateCards() {
    for (const pair of pairs) {
        const witchPath = path.join(publicDir, pair.witch);
        const framePath = path.join(publicDir, pair.frame);
        const outPath = path.join(publicDir, pair.out);

        if (!fs.existsSync(witchPath) || !fs.existsSync(framePath)) {
            console.error(`Missing files for ${pair.out}`);
            continue;
        }

        try {
            const witchResized = await sharp(witchPath)
                .resize(580, 820, { fit: 'cover', position: 'center' })
                .toBuffer();

            // Background with cream color
            await sharp({
                create: {
                    width: 709,
                    height: 1004,
                    channels: 4,
                    background: { r: 250, g: 249, b: 246, alpha: 1 }
                }
            })
                .composite([
                    { input: witchResized, gravity: 'center' },
                    { input: framePath, blend: 'over' }
                ])
                .png()
                .toFile(outPath);

            console.log(`Generated ${pair.out}`);
        } catch (err) {
            console.error(`Error generating ${pair.out}:`, err);
        }
    }
}

generateCards();
