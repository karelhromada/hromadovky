const fs = require('fs');
const path = require('path');

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

function generateMarks() {
    // Shodné s backs pro přesné lícování
    const xPositions = [13, 73, 75, 135, 137, 197];
    const yPositions = [19, 104, 106, 191, 193, 278];
    let marksHtml = '';
    yPositions.forEach(y => {
        xPositions.forEach(x => {
            marksHtml += `<div class="mark" style="left: ${x - 5}mm; top: ${y - 5}mm;"></div>\n`;
        });
    });
    return marksHtml;
}

const templatePath = path.resolve(__dirname, 'mytologie_print_backs_template.html');
let template = fs.readFileSync(templatePath, 'utf8');

// Upravíme šablonu pro čelní strany (místo varianty budeme vkládat konkrétní karty)
template = template.replace(/background-image: url\('mytologie_back_VARIANT\.png'\);/g, "background-image: url('${CARD_FILE}');");
template = template.replace(/VARIANT_TITLE/g, "Mytologie - Čelní strany");

const CARDS_PER_PAGE = 9;
const totalPages = Math.ceil(cards.length / CARDS_PER_PAGE);

for (let i = 0; i < totalPages; i++) {
    const pageCards = cards.slice(i * CARDS_PER_PAGE, (i + 1) * CARDS_PER_PAGE);
    const marks = generateMarks();
    
    let cardsHtml = '';
    pageCards.forEach((card, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const left = 13 + col * 62;
        const top = 19 + row * 87;
        
        cardsHtml += `<div class="card" style="left: ${left}mm; top: ${top}mm; background-image: url('${card}');"></div>\n`;
    });

    // Vytvoříme finální HTML pro danou stránku
    let pageHtml = `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <title>Mytologie - Tiskový arch ${i + 1}</title>
    <style>
        body { margin: 0; padding: 0; background: #f0f0f0; font-family: sans-serif; }
        .page { width: 210mm; height: 297mm; background: white; margin: 10mm auto; position: relative; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden; }
        .card { width: 62mm; height: 87mm; position: absolute; background-size: 106% 106%; background-position: center; border: 0.1mm solid #eee; }
        .mark { width: 10mm; height: 10mm; position: absolute; }
        .mark::before, .mark::after { content: ''; position: absolute; background: #000; }
        .mark::before { width: 10mm; height: 0.1mm; top: 5mm; left: 0; }
        .mark::after { width: 0.1mm; height: 10mm; left: 5mm; top: 0; }
        .info { position: absolute; top: 5mm; left: 10mm; font-size: 10px; color: #888; }
        @media print { body { background: none; } .page { margin: 0; box-shadow: none; page-break-after: always; } }
    </style>
</head>
<body>
    <div class="page">
        <div class="info">Mytologie - Arch ${i + 1} / ${totalPages}</div>
        ${cardsHtml}
        ${marks}
    </div>
</body>
</html>`;

    const outputFile = path.join(__dirname, `mytologie_print_cards_page_${i + 1}.html`);
    fs.writeFileSync(outputFile, pageHtml);
    console.log(`Vygenerován arch ${i + 1}: ${outputFile}`);
}

console.log('✅ Všech 32 karet Mytologie bylo připraveno do tiskových archů.');
