const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const targets = [
    { file: 'all_dinosaurs.html', prefix: 'dino_full' },
    { file: 'all_baby_dragons.html', prefix: 'baby_full' },
    { file: 'all_cards.html', prefix: 'drag_full' },
    { file: 'all_cats.html', prefix: 'cat_full' },
    { file: 'all_knights.html', prefix: 'knight_full' }
];

const destDir = path.join(__dirname, '../kvarteta-eshop/public/cards');

(async () => {
    const browser = await puppeteer.launch();

    for (const target of targets) {
        const filePath = path.join(__dirname, target.file);
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            continue;
        }

        const page = await browser.newPage();

        // We set a extremely high device scale factor for crisp retina images
        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 4 });

        const fileUrl = 'file://' + filePath;
        console.log(`Loading ${fileUrl}...`);
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });

        // Wait a bit extra for any local fonts/images
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Force backgrounds to transparent to fix white corners on rounded cards
        await page.evaluate(() => {
            document.body.style.background = 'transparent';
            document.querySelectorAll('.page-grid').forEach(el => {
                el.style.background = 'transparent';
                el.style.boxShadow = 'none';
            });
        });

        const cards = await page.$$('.card');
        console.log(`Found ${cards.length} cards in ${target.file}`);

        const limit = Math.min(10, cards.length);
        for (let i = 0; i < limit; i++) {
            const destPath = path.join(destDir, `${target.prefix}_${i + 1}.png`);
            await cards[i].screenshot({ path: destPath, omitBackground: true });
            console.log(`Saved ${destPath}`);
        }
        await page.close();
    }

    await browser.close();
    console.log('Done rendering all cards.');
})();
