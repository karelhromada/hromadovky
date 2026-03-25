const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const knightData = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp_knights.json'), 'utf-8'));
knightData.sort((a, b) => (a['ID'] || '').localeCompare(b['ID'] || ''));

const htmlFile = path.join(__dirname, 'all_knights.html');
const destDir = path.join(__dirname, '../kvarteta-eshop/public/cards/rytiri_v3');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

function slugify(text) {
    return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Skill Rule: High device scale factor for crisp images
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 4 });

    const fileUrl = 'file://' + htmlFile;
    console.log(`Loading ${fileUrl}...`);
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    // Wait for fonts and images
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Force transparency for rounded corners
    await page.evaluate(() => {
        document.body.style.background = 'transparent';
        document.querySelectorAll('.page-grid').forEach(el => {
            el.style.background = 'transparent';
            el.style.boxShadow = 'none';
        });
    });

    const cards = await page.$$('.card');
    console.log(`Found ${cards.length} cards in HTML.`);

    for (let i = 0; i < knightData.length; i++) {
        const knight = knightData[i];
        const safeName = slugify(knight['Název']);
        const destPath = path.join(destDir, `${safeName}_karta_v3.png`);
        
        if (cards[i]) {
            await cards[i].screenshot({ path: destPath, omitBackground: true });
            console.log(`✅ [${i+1}/32] Saved ${path.basename(destPath)}`);
        } else {
            console.error(`❌ Card at index ${i} (ID ${knight['ID']}) not found in HTML!`);
        }
    }

    await browser.close();
    console.log('✨ All 32 Knights rendered successfully to v3!');
})();
