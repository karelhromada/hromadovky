const fs = require('fs');
const path = require('path');

const variants = [
    { name: 'emblem', file: 'mytologie_back_1_emblem.png', title: 'Mytický emblém' },
    { name: 'runes', file: 'mytologie_back_2_runes.png', title: 'Magické runy' },
    { name: 'gateway', file: 'mytologie_back_3_gateway.png', title: 'Brána do světa bohů' }
];

function generateMarks() {
    // Columns: 13, 73, 75, 135, 137, 197
    // Rows: 19, 104, 106, 191, 193, 278
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
const template = fs.readFileSync(templatePath, 'utf8');
const marks = generateMarks();

variants.forEach(variant => {
    const OUTPUT_FILE = path.join(__dirname, `mytologie_print_backs_${variant.name}.html`);
    
    // Copy the final PNG into the card_generator folder so the HTML can find it relative
    const srcPng = path.join(__dirname, '../kvarteta-eshop/public/cards/mytologie', variant.file);
    const destPng = path.join(__dirname, variant.file);
    
    if (fs.existsSync(srcPng)) {
        fs.copyFileSync(srcPng, destPng);
    }

    let htmlContent = template
        .replace(/mytologie_back_VARIANT\.png/g, variant.file)
        .replace(/VARIANT_TITLE/g, variant.title)
        .replace(/\[\[MARKS\]\]/g, marks);

    fs.writeFileSync(OUTPUT_FILE, htmlContent);
    console.log(`Vygenerována tisková šablona: ${variant.name} -> ${OUTPUT_FILE}`);
});
