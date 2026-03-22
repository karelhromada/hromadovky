const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Load Data
const DATA_FILE = path.join(__dirname, 'mytologie_data.json');
const rawData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Target and Asset Directories
const targetDir = path.resolve(__dirname, '../tiskove_archy');
const assetsDir = path.join(targetDir, 'assets_mytologie_v2');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Stats & Layout (mm)
const CARD_W = 60;
const CARD_H = 81.5;
const BLEED = 1;
const GUTTER = 3;
const BOX_W = CARD_W + 2 * BLEED; 
const BOX_H = CARD_H + 2 * BLEED; 

const START_X = (210 - (3 * BOX_W + 2 * GUTTER)) / 2;
const START_Y = (297 - (3 * BOX_H + 2 * GUTTER)) / 2;

const CARDS_PER_PAGE = 9;

async function run() {
    console.log('--- Preparing Mythology Print Sheets (V2) ---');
    
    // 2. Optimize images (JPEG 85q)
    const srcBase = path.join(__dirname, '../kvarteta-eshop/public/cards/mytologie');
    const optimizedFiles = [];

    for (const char of rawData) {
        const v2Name = char.img.replace('_karta_', '_v2_');
        const srcPath = path.join(srcBase, v2Name);
        const outName = v2Name.replace('.png', '.jpg');
        const outPath = path.join(assetsDir, outName);

        if (fs.existsSync(srcPath)) {
            await sharp(srcPath)
                .resize(1200) // High quality for print, but optimized
                .modulate({ brightness: 1.2, saturation: 1.1 }) // +20% jas, +10% saturace pro matnou fólii
                .sharpen(1.5) // Doostření hran pro tisk
                .jpeg({ quality: 85, chromaSubsampling: '4:4:4' })
                .toFile(outPath);
            optimizedFiles.push(outName);
        } else {
            console.warn(`⚠️ Warning: Skip missing file ${v2Name}`);
        }
    }

    // 3. Optimize Back Side
    const backFile = 'mytologie_back_1_emblem.png';
    const backOutName = 'back_mythology_optimized.jpg';
    await sharp(path.join(srcBase, backFile))
        .resize(1200)
        .modulate({ brightness: 1.2, saturation: 1.1 }) // Aplikace stejného filtru i na rubovou stranu
        .sharpen(1.5)
        .jpeg({ quality: 85 })
        .toFile(path.join(assetsDir, backOutName));

    // 4. Generate A4 HTML
    let pagesHtml = '';
    const totalPages = Math.ceil(optimizedFiles.length / CARDS_PER_PAGE);

    for (let p = 0; p < totalPages; p++) {
        // Front Page
        let frontCardsHtml = '';
        const pageCards = optimizedFiles.slice(p * CARDS_PER_PAGE, (p + 1) * CARDS_PER_PAGE);
        
        pageCards.forEach((file, index) => {
            const char = rawData.find(c => {
                const v2Name = c.img.replace('_karta_', '_v2_');
                const outName = v2Name.replace('.png', '.jpg');
                return outName === file;
            });
            const color = char ? char.color : 'transparent';
            
            const row = Math.floor(index / 3);
            const col = index % 3;
            const x = START_X + col * (BOX_W + GUTTER);
            const y = START_Y + row * (BOX_H + GUTTER);
            frontCardsHtml += `<div class="card" style="left:${x}mm; top:${y}mm; background-image:url('assets_mytologie_v2/${file}'); --card-color: ${color};"></div>\n`;
        });

        pagesHtml += `<div class="page front">${frontCardsHtml}</div>\n`;

        // Back Page (Mirrored for Duplex)
        let backCardsHtml = '';
        const backCount = pageCards.length;
        for (let b = 0; b < backCount; b++) {
            const row = Math.floor(b / 3);
            const col = 2 - (b % 3); // MIRRORING
            const x = START_X + col * (BOX_W + GUTTER);
            const y = START_Y + row * (BOX_H + GUTTER);
            backCardsHtml += `<div class="card" style="left:${x}mm; top:${y}mm; background-image:url('assets_mytologie_v2/${backOutName}'); --card-color: transparent;"></div>\n`;
        }

        pagesHtml += `<div class="page back">${backCardsHtml}</div>\n`;
    }

    const finalHtml = `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <title>Mytologie - Kompletní tisk (V2)</title>
    <style>
        body { margin: 0; padding: 0; background: #eee; }
        .page { width: 210mm; height: 297mm; background: #fff; margin: 10mm auto; position: relative; overflow: hidden; page-break-after: always; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .card { width: ${BOX_W}mm; height: ${BOX_H}mm; position: absolute; background-color: #000; background-size: cover; background-position: center; border-radius: 15px; overflow: hidden; }
        
        /* Zaoblující vnější černý okraj překrývající staré ostré hrany */
        .card::before {
            content: ''; position: absolute; inset: 0;
            border: 1.4mm solid #000;
            border-radius: 15px;
            pointer-events: none;
            z-index: 2;
        }
        
        /* Nový perfektně zaoblený barevný rámeček tažený z dat */
        .card::after {
            content: ''; position: absolute; inset: 1.4mm;
            border: 0.6mm solid var(--card-color);
            border-radius: 10px;
            pointer-events: none;
            z-index: 3;
        }
        
        @media print {
            body { background: none; }
            .page { margin: 0; box-shadow: none; border: none; }
            @page { size: A4 portrait; margin: 0; }
        }
    </style>
</head>
<body>
    ${pagesHtml}
</body>
</html>`;

    const outputPath = path.join(targetDir, 'mytologie_kompletni_tisk.html');
    fs.writeFileSync(outputPath, finalHtml);
    console.log(`✅ Print document generated: ${outputPath}`);
}

run().catch(console.error);
