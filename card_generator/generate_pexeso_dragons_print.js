const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcDir = path.resolve(__dirname, 'Pexeso/Dračí pexeso');
const targetDir = path.resolve(__dirname, '../tiskove_archy');
const assetsDir = path.join(targetDir, 'assets_pexeso_draci');

if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// 1. Načtení a příprava obrázků (32 unikátních draků)
const dragonFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.png') && !f.startsWith('.'));

// Layout Konstanty (v mm)
const CARD_SIZE = 50;
const P_GUTTER = 2;
const P_START_X = (210 - (4 * CARD_SIZE + 3 * P_GUTTER)) / 2;
const P_START_Y = (297 - (5 * CARD_SIZE + 4 * P_GUTTER)) / 2;
const CARDS_PER_PAGE = 20;

async function optimizeAssets() {
    console.log('Optimalizuji obrázky Pexesa pro PDF (Zmenšování a JPEG)...');
    
    const optimizedMapping = {};
    
    // Optimalizace draků
    for (const file of dragonFiles) {
        const outName = file.replace('.png', '.jpg');
        await sharp(path.join(srcDir, file))
            .resize(600) // 50mm @ 300DPI je ~590px
            .modulate({ brightness: 1.2, saturation: 1.1 }) // Úprava jasnosti/sytosti kvůli matné fólii
            .sharpen(1.5) // Doostření hran pro tisk
            .jpeg({ quality: 85, progressive: true })
            .toFile(path.join(assetsDir, outName));
        optimizedMapping[file] = outName;
    }

    // Zadní strana
    const backFile = 'dragon_scales_realistic_1.png';
    const optimizedBack = backFile.replace('.png', '.jpg');
    if (fs.existsSync(path.join(__dirname, backFile))) {
        await sharp(path.join(__dirname, backFile))
            .resize(600)
            .modulate({ brightness: 1.2, saturation: 1.1 })
            .sharpen(1.5)
            .jpeg({ quality: 85, progressive: true })
            .toFile(path.join(assetsDir, optimizedBack));
    }

    return { optimizedMapping, optimizedBack };
}

async function generate() {
    const { optimizedMapping, optimizedBack } = await optimizeAssets();
    
    // Pexeso vyžaduje dvojice (použijeme optimalizované názvy)
    let pexesoCards = [];
    dragonFiles.forEach(file => {
        pexesoCards.push(optimizedMapping[file], optimizedMapping[file]);
    });

    const totalPages = Math.ceil(pexesoCards.length / CARDS_PER_PAGE);
    let allPagesHtml = '';

    // Čelní strany
    for (let i = 0; i < totalPages; i++) {
        const pageCards = pexesoCards.slice(i * CARDS_PER_PAGE, (i + 1) * CARDS_PER_PAGE);
        let cardsHtml = '';
        pageCards.forEach((card, index) => {
            // Název vyloupneme ze jména souboru (např. 'Aeris.jpg' -> 'AERIS')
            const dragonName = card.replace('.jpg', '').replace('.png', '').toUpperCase();
            
            const row = Math.floor(index / 4);
            const col = index % 4;
            const left = P_START_X + col * (CARD_SIZE + P_GUTTER);
            const top = P_START_Y + row * (CARD_SIZE + P_GUTTER);
            cardsHtml += `<div class="card" style="left: ${left}mm; top: ${top}mm; background-image: url('assets_pexeso_draci/${card}');">\n`;
            cardsHtml += `    <div class="name-overlay">${dragonName}</div>\n`;
            cardsHtml += `</div>\n`;
        });

        allPagesHtml += `
        <div class="page">
            ${cardsHtml}
        </div>`;
    }

    // Zadní strany
    for (let i = 0; i < totalPages; i++) {
        let backsHtml = '';
        for (let j = 0; j < CARDS_PER_PAGE; j++) {
            const row = Math.floor(j / 4);
            const col = 3 - (j % 4); 
            const left = P_START_X + col * (CARD_SIZE + P_GUTTER);
            const top = P_START_Y + row * (CARD_SIZE + P_GUTTER);
            backsHtml += `<div class="card" style="left: ${left}mm; top: ${top}mm; background-image: url('assets_pexeso_draci/${optimizedBack}');"></div>\n`;
        }

        allPagesHtml += `
        <div class="page page-back">
            ${backsHtml}
        </div>`;
    }

    const finalHtml = `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <title>Dračí Pexeso - Optimalizovaný tisk</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600&display=swap" rel="stylesheet">
    <style>
        body { margin: 0; padding: 0; background: #f0f0f0; font-family: 'Segoe UI', sans-serif; }
        .page { width: 210mm; height: 297mm; background: white; margin: 10mm auto; position: relative; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden; page-break-after: always; }
        .card { width: ${CARD_SIZE}mm; height: ${CARD_SIZE}mm; position: absolute; background-size: cover; background-position: center; border: 0.1mm solid #eee; border-radius: 5px; overflow: hidden; }
        .name-overlay { position: absolute; bottom: 2mm; left: 0; right: 0; color: #fff; font-family: 'Cinzel', serif; font-size: 8pt; text-align: center; letter-spacing: 0.5px; z-index: 2; text-shadow: 0 1px 3px rgba(0,0,0,1), 0 0 5px rgba(0,0,0,1); }
        @media print { 
            body { background: none; } 
            .page { margin: 0; box-shadow: none; border: none; }
        }
    </style>
</head>
<body>
    ${allPagesHtml}
</body>
</html>`;

    const outputFile = path.join(targetDir, 'draci_pexeso_kompletni_tisk.html');
    fs.writeFileSync(outputFile, finalHtml);

    console.log(`✅ Optimalizované pexeso (JPEG 85q) hotovo: ${outputFile}`);
}

generate().catch(console.error);
