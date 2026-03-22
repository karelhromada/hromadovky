const fs = require('fs');
const path = require('path');

const EPIC_BACKS = [
    { id: 'gold_scales', name: 'Zlaté šupiny', file: 'epic_gold_scales.png' },
    { id: 'lava_flow', name: 'Lávový proud', file: 'epic_lava_flow.png' },
    { id: 'ice_crystal', name: 'Ledový krystal', file: 'epic_ice_crystal.png' },
    { id: 'arcane_parchment', name: 'Prastarý pergamen', file: 'epic_arcane_parchment.png' },
    { id: 'runed_obsidian', name: 'Runový obsidian', file: 'epic_runed_obsidian.png' }
];

const FORMATS = {
    kvarteta: { width: 62, height: 87, cols: 3, rows: 3, marginLeft: 13, marginTop: 19, spacingX: 62, spacingY: 87 },
    pexeso: { width: 50, height: 50, cols: 4, rows: 5, marginLeft: 5, marginTop: 23, spacingX: 50, spacingY: 50 }
};

const templatePath = path.resolve(__dirname, 'epic_back_template.html');
const template = fs.readFileSync(templatePath, 'utf8');

function generateMarks(format) {
    let marksHtml = '';
    const xEnd = format.marginLeft + format.cols * format.spacingX;
    const yEnd = format.marginTop + format.rows * format.spacingY;
    
    for (let i = 0; i <= format.cols; i++) {
        for (let j = 0; j <= format.rows; j++) {
            const x = format.marginLeft + i * format.spacingX;
            const y = format.marginTop + j * format.spacingY;
            marksHtml += `<div class="mark" style="left: ${x - 5}mm; top: ${y - 5}mm;"></div>\n`;
        }
    }
    return marksHtml;
}

function generatePrintSheet(back, formatKey) {
    const format = FORMATS[formatKey];
    const variantTitle = `${back.name} (${formatKey === 'kvarteta' ? 'Kvarteta/Karty' : 'Pexeso'})`;
    
    let cardsHtml = '';
    for (let row = 0; row < format.rows; row++) {
        for (let col = 0; col < format.cols; col++) {
            const left = format.marginLeft + col * format.spacingX;
            const top = format.marginTop + row * format.spacingY;
            cardsHtml += `<div class="card" style="left: ${left}mm; top: ${top}mm;"></div>\n`;
        }
    }

    const marksHtml = generateMarks(format);

    let output = template
        .replace(/\${VARIANT_TITLE}/g, variantTitle)
        .replace(/\${CARD_WIDTH}/g, format.width)
        .replace(/\${CARD_HEIGHT}/g, format.height)
        .replace(/\${BG_IMAGE}/g, `epic_backs/${back.file}`)
        .replace(/\${CARDS_HTML}/g, cardsHtml)
        .replace(/\${MARKS_HTML}/g, marksHtml);

    const fileName = `print_back_epic_${back.id}_${formatKey}.html`;
    const outputPath = path.join(__dirname, fileName);
    fs.writeFileSync(outputPath, output);
    console.log(`✅ Vygenerován tiskový arch: ${fileName}`);
}

// Vygenerujeme všechny kombinace
EPIC_BACKS.forEach(back => {
    generatePrintSheet(back, 'kvarteta');
    generatePrintSheet(back, 'pexeso');
});

console.log('\n🚀 Všech 10 tiskových archů (5 stylů x 2 formáty) bylo úspěšně vytvořeno.');
