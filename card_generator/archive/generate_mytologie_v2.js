const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Paths
const DATA_FILE = path.join(__dirname, 'mytologie_data.json');
const TEMPLATE_FILE = path.join(__dirname, 'mytologie_template_v2.html');
const IMG_SRC_DIR = path.join(__dirname, '../kvarteta-eshop/public/cards/mytologie');
const OUTPUT_DIR = path.join(__dirname, '../kvarteta-eshop/public/cards/mytologie'); // Overwriting existing for easy preview

async function run() {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

    const browser = await puppeteer.launch({
        args: ['--allow-file-access-from-files', '--disable-web-security']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 1000, deviceScaleFactor: 2 });
    await page.setDefaultNavigationTimeout(60000);

    console.log(`Starting generation of ${data.length} mythology cards...`);

    for (const char of data) {
        let html = template;
        
        // Prepare image path and read as Base64 for reliable rendering
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
        html = html.replace(/\${ORIGIN}/g, char.origin);
        html = html.replace(/\${MAGIE}/g, char.magic);
        html = html.replace(/\${STARI}/g, char.age);
        html = html.replace(/\${SILA}/g, char.strength);
        html = html.replace(/\${HROZIVOST}/g, char.menace);
        html = html.replace(/\${IMG_PATH}/g, imgUrl);

        // Render HTML
        await page.setContent(html, { waitUntil: 'load', timeout: 60000 });
        
        // Brief pause for any fonts or effects to settle
        await new Promise(r => setTimeout(r, 200));

        // Take screenshot of .card element
        const element = await page.$('.card');
        const outputPath = path.join(OUTPUT_DIR, char.img.replace('_karta_', '_v2_'));
        // We use a slightly different name to avoid blocking the old ones during dev, 
        // but we'll eventually update the manifest if needed.
        // Actually, user wants them replaced.
        
        await element.screenshot({ path: outputPath, omitBackground: true });
        console.log(`✅ Generated: ${char.name} -> ${path.basename(outputPath)}`);
    }

    await browser.close();
    console.log('--- ALL CARDS GENERATED ---');
}

run().catch(console.error);
