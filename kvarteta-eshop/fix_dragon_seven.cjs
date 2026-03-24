const sharp = require('sharp');
const path = require('path');

async function fixDragonSevenFinalFinal() {
    const acePath = path.join(__dirname, 'public/cards/prsi/prsi_listy_A.webp');
    const symbolPathAbs = '/Users/air2024/.gemini/antigravity/brain/53861bfb-f3ba-4cb8-9d5b-edf3eb09e88a/dragon_leaf_symbol_clean_1774344927532.png';
    const newBaseAbs = '/Users/air2024/.gemini/antigravity/brain/53861bfb-f3ba-4cb8-9d5b-edf3eb09e88a/dragon_listy_7_new_base_1774344349323.png';
    const outputPath = path.join(__dirname, 'public/cards/prsi/prsi_listy_7.webp');

    console.log('Processing symbol with precise transparency...');
    
    // Create the alpha mask: high brightness -> transparent
    const mask = await sharp(symbolPathAbs)
        .greyscale()
        .negate() // white background becomes black (0), symbol becomes light
        .linear(1.5, -20) // boost contrast to ensure black is really black
        .toBuffer();

    const finalSymbol = await sharp(symbolPathAbs)
        .ensureAlpha()
        .joinChannel(mask) // This adds the mask as the alpha channel
        .resize(110, 110)
        .toBuffer();

    console.log('Creating frame mask...');
    const holeSvg = `
        <svg width="709" height="1004">
            <rect x="68" y="68" width="573" height="868" rx="20" ry="20" fill="black" />
        </svg>
    `;
    const frameBuffer = await sharp(acePath)
        .resize(709, 1004)
        .composite([{ input: Buffer.from(holeSvg), blend: 'dest-out' }])
        .toBuffer();

    console.log('Composing final card...');
    // Shifted Y positions lower to avoid frame gems
    const topCenter = { cx: 354, cy: 165 };
    const leftPoints = [330, 530, 730].map(y => ({ cx: 185, cy: y }));
    const rightPoints = [330, 530, 730].map(y => ({ cx: 524, cy: y }));
    const allPoints = [topCenter, ...leftPoints, ...rightPoints];

    const symbolComposites = allPoints.map(pt => ({
        input: finalSymbol,
        top: Math.round(pt.cy - 55),
        left: Math.round(pt.cx - 55)
    }));

    await sharp(newBaseAbs)
        .resize(709, 1004, { fit: 'cover' })
        .composite([
            { input: frameBuffer, top: 0, left: 0 },
            ...symbolComposites
        ])
        .toFile(outputPath);

    console.log('✅ VERSION 3.0 SUCCESS at: ' + outputPath);
}

fixDragonSevenFinalFinal().catch(console.error);
