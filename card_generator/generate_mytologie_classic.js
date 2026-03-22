const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Paths
const DATA_FILE = path.join(__dirname, 'mytologie_data.json');
const TEMPLATE_FILE = path.join(__dirname, 'mytologie_template_perfect_original.html');
const IMG_SRC_DIR = path.join(__dirname, '../kvarteta-eshop/public/cards/mytologie');
const OUTPUT_DIR = path.join(__dirname, '../kvarteta-eshop/public/cards/mytologie');

async function run() {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

    const browser = await puppeteer.launch({
        args: ['--allow-file-access-from-files', '--disable-web-security']
    });
    const page = await browser.newPage();
    // Using original image proportions (678x921)
    await page.setViewport({ width: 678, height: 921, deviceScaleFactor: 2 });
    await page.setDefaultNavigationTimeout(60000);

    console.log(`Starting generation of ${data.length} mythology cards in CLASSIC style...`);

    for (const char of data) {
        let html = template;
        
        // Image as Base64
        const imgSrc = path.join(IMG_SRC_DIR, char.img);
        if (!fs.existsSync(imgSrc)) {
            console.error(`❌ Image not found: ${imgSrc}`);
            continue;
        }
        const base64Img = fs.readFileSync(imgSrc).toString('base64');
        const imgUrl = `data:image/png;base64,${base64Img}`;

        // Replace placeholders
        html = html.replace(/\${ID}/g, char.id);
        html = html.replace(/\${NAME}/g, char.name);
        html = html.replace(/\${SUBTITLE}/g, char.subtitle);
        html = html.replace(/\${ORIGIN}/g, char.origin);
        html = html.replace(/\${MAGIE}/g, char.magic);
        html = html.replace(/\${STARI}/g, char.age);
        html = html.replace(/\${SILA}/g, char.strength);
        html = html.replace(/\${HROZIVOST}/g, char.menace);
        html = html.replace(/\${COLOR}/g, char.color);
        html = html.replace(/\${IMG_PATH}/g, imgUrl);

        // Render HTML
        await page.setContent(html, { waitUntil: 'load', timeout: 60000 });
        
        // Wait for fonts/effects
        await new Promise(r => setTimeout(r, 200));
        
        const element = await page.$('.card-container');
        const outputPath = path.join(OUTPUT_DIR, char.img.replace('_karta_', '_v2_'));
        
        await element.screenshot({ path: outputPath, omitBackground: true });
        console.log(`✅ Generated (Classic): ${char.name} -> ${path.basename(outputPath)}`);
    }

    await browser.close();
    console.log('--- ALL CLASSIC CARDS GENERATED ---');
}

run().catch(console.error);
