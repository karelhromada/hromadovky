const sharp = require('sharp');
const path = require('path');

async function processSymbol(inputPath, outputPath) {
    console.log(`Processing: ${inputPath}...`);
    
    // 1. Získání syrových pixelů
    const image = sharp(inputPath);
    const { data, info } = await image
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    // 2. Nahrazení bílé (a téměř bílé) barvy průhledností
    const threshold = 245;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] > threshold && data[i+1] > threshold && data[i+2] > threshold) {
            data[i+3] = 0;
        }
    }

    // 3. Oříznutí prázdných okrajů a uložení
    await sharp(data, {
        raw: {
            width: info.width,
            height: info.height,
            channels: 4
        }
    })
    .trim()
    .toFile(outputPath);

    console.log(`Saved: ${outputPath}`);
}

async function run() {
    const brainDir = '/Users/air2024/.gemini/antigravity/brain/34995c3b-e9de-46dd-97c8-0b4146852165';
    const targetDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

    const files = [
        { 
            input: path.join(brainDir, 'witch_acorn_vertical_v2_1774278802085.png'), 
            output: path.join(targetDir, 'znak_žaludy.png') 
        },
        { 
            input: path.join(brainDir, 'witch_leaf_vertical_final_v1_1774278920383.png'),
            output: path.join(targetDir, 'znak_zelené.png') 
        },
        { 
            input: path.join(brainDir, 'witch_heart_vertical_v1_1774279025227.png'),
            output: path.join(targetDir, 'znak_srdce.png') 
        },
        { 
            input: path.join(brainDir, 'witch_bell_vertical_v1_1774279040365.png'),
            output: path.join(targetDir, 'znak_kule.png') 
        }
    ];

    for (const file of files) {
        try {
            await processSymbol(file.input, file.output);
        } catch (err) {
            console.error(`Error processing ${file.input}:`, err);
        }
    }
}

run();
