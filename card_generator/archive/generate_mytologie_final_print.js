const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // Knihovna pro optimalizaci

const cards = [
    'zeus_karta_1773232441103.png', 'poseidon_karta_1773232459144.png', 'hades_karta_1773232474069.png', 'athena_karta_1773232489883.png',
    'herakles_karta_1773232618325.png', 'meduza_karta_1773232636144.png', 'kerberos_karta_1773232651828.png', 'pegas_karta_1773232669889.png',
    'jupiter_karta_1773232768056.png', 'mars_karta_1773232782289.png', 'neptun_karta_1773232797411.png', 'venuse_karta_1773232812348.png',
    'odin_karta_1773232963748.png', 'thor_karta_1773232978954.png', 'loki_karta_1773232994824.png', 'freya_karta_1773233012935.png',
    'fenrir_karta_1773233163130.png', 'jormungandr_karta_1773331719629.png', 'valkyra_karta_1773331735922.png', 'ymir_karta_1773331768521.png',
    'ra_karta_1773332186294.png', 'anubis_karta_1773332202104.png', 'horus_karta_1773332218750.png', 'bastet_karta_1773332236278.png',
    'beowulf_karta_1773332496331.png', 'grendel_karta_1773332517229.png', 'grendel_mother_karta_1773332529832.png', 'fire_dragon_karta_1773332546606.png',
    'minotaurus_karta_1773332802337.png', 'bazilisek_v2_karta_1773333084369.png', 'kraken_karta_1773332833372.png', 'mantikora_karta_1773332852801.png'
];

const backs = [
    { id: '1_emblem', file: 'mytologie_back_1_emblem.png', title: 'Mytický emblém' }
];

const targetDir = path.resolve(__dirname, '../tiskove_archy');
const assetsDir = path.join(targetDir, 'assets_mytologie');

if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Konstanty pro layout (v mm)
const CARD_W = 60;
const CARD_H = 85;
const BLEED = 1;
const GUTTER = 3;
const BOX_W = CARD_W + 2 * BLEED; 
const BOX_H = CARD_H + 2 * BLEED; 

const START_X = (210 - (3 * BOX_W + 2 * GUTTER)) / 2;
const START_Y = (297 - (3 * BOX_H + 2 * GUTTER)) / 2;

const CARDS_PER_PAGE = 9;
const totalFrontPages = Math.ceil(cards.length / CARDS_PER_PAGE);

async function optimizeAndCopy() {
    console.log('Optimalizuji obrázky Mytologie pro PDF (Zmenšování a JPEG)...');
    const srcBase = path.join(__dirname, '../kvarteta-eshop/public/cards/mytologie');

    // Funkce pro optimalizaci jednoho obrázku
    const processImage = async (filename) => {
        const outName = filename.replace('.png', '.jpg');
        await sharp(path.join(srcBase, filename))
            .resize(800) // Dostatečné pro tisk A4 ve skvělé kvalitě, ale mnohem menší soubor
            .jpeg({ quality: 85, progressive: true })
            .toFile(path.join(assetsDir, outName));
        return outName;
    };

    const optimizedCards = [];
    for (const card of cards) {
        optimizedCards.push(await processImage(card));
    }
    
    const optimizedBacks = [];
    for (const back of backs) {
        optimizedBacks.push({
            ...back,
            optimizedFile: await processImage(back.file)
        });
    }

    return { optimizedCards, optimizedBacks };
}

async function generate() {
    const { optimizedCards, optimizedBacks } = await optimizeAndCopy();
    
    let allPagesHtml = '';

    // Čelní strany
    for (let i = 0; i < totalFrontPages; i++) {
        const pageCards = optimizedCards.slice(i * CARDS_PER_PAGE, (i + 1) * CARDS_PER_PAGE);
        let cardsHtml = '';
        pageCards.forEach((card, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            const left = START_X + col * (BOX_W + GUTTER);
            const top = START_Y + row * (BOX_H + GUTTER);
            cardsHtml += `<div class="card" style="left: ${left}mm; top: ${top}mm; background-image: url('assets_mytologie/${card}');"></div>\n`;
        });

        allPagesHtml += `
        <div class="page">
            ${cardsHtml}
        </div>`;
    }

    // Zadní strany
    for (let i = 0; i < totalFrontPages; i++) {
        let backsHtml = '';
        for (let j = 0; j < CARDS_PER_PAGE; j++) {
            const row = Math.floor(j / 3);
            const col = 2 - (j % 3);
            const left = START_X + col * (BOX_W + GUTTER);
            const top = START_Y + row * (BOX_H + GUTTER);
            backsHtml += `<div class="card" style="left: ${left}mm; top: ${top}mm; background-image: url('assets_mytologie/${optimizedBacks[0].optimizedFile}');"></div>\n`;
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
    <title>Mytologie - Optimalizovaný tiskový komplet</title>
    <style>
        body { margin: 0; padding: 0; background: #f0f0f0; font-family: 'Segoe UI', sans-serif; }
        .page { width: 210mm; height: 297mm; background: white; margin: 10mm auto; position: relative; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden; page-break-after: always; }
        .card { width: ${BOX_W}mm; height: ${BOX_H}mm; position: absolute; background-size: cover; background-position: center; border: 0.1mm solid #eee; }
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

    const outputFile = path.join(targetDir, 'mytologie_kompletni_tisk.html');
    fs.writeFileSync(outputFile, finalHtml);

    console.log(`✅ Optimalizovaný dokument Mytologie (JPEG 85q) hotov: ${outputFile}`);
}

generate().catch(console.error);
