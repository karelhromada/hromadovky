const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const variants = [
    { id: '1_emblem', path: '/Users/air2024/.gemini/antigravity/brain/09522950-3e2f-47a1-a3d1-cf35f4123a79/mytologie_back_emblem_new_bleedx_1773430350334.png' },
    { id: '2_runes', path: '/Users/air2024/.gemini/antigravity/brain/09522950-3e2f-47a1-a3d1-cf35f4123a79/mytologie_back_runes_new_bleedx_1773430365621.png' },
    { id: '3_gateway', path: '/Users/air2024/.gemini/antigravity/brain/09522950-3e2f-47a1-a3d1-cf35f4123a79/mytologie_back_gateway_new_bleedx_1773430381983.png' }
];

async function renderBacks() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set exact target resolution
    await page.setViewport({ width: 678, height: 921, deviceScaleFactor: 1 });

    const htmlPath = path.resolve(__dirname, 'mytologie_back_template.html');
    const outDir = path.resolve(__dirname, '../kvarteta-eshop/public/cards/mytologie');

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    console.log(`Začínám renderovat finální zadní strany (678x921)...`);

    for (const v of variants) {
        console.log(`Renderuji: ${v.id}`);

        // Read image as base64 to avoid local file path issues in browser
        const bitmap = fs.readFileSync(v.path);
        const base64 = `data:image/png;base64,${bitmap.toString('base64')}`;

        await page.evaluate((url) => {
            window.renderBack(url);
        }, base64);

        // Wait a bit for image to load
        await new Promise(r => setTimeout(r, 200));

        const element = await page.$('#card-container');
        await element.screenshot({
            path: path.join(outDir, `mytologie_back_${v.id}.png`)
        });
    }

    await browser.close();
    console.log('✅ Finální zadní strany byly úspěšně uloženy do /public/cards/mytologie!');
}

renderBacks().catch(console.error);
