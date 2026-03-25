const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const targetUrl = 'file://' + path.join(__dirname, 'all_baby_dragons.html');
const destPath = path.join(__dirname, '../kvarteta-eshop/public/cards/baby_full_11.png');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // We set a extremely high device scale factor for crisp retina images
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 4 });

    console.log(`Loading...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.evaluate(() => {
        document.body.style.background = 'transparent';
        document.querySelectorAll('.page-grid').forEach(el => {
            el.style.background = 'transparent';
            el.style.boxShadow = 'none';
        });
    });

    const cards = await page.$$('.card');
    let targetCard = null;

    for (const card of cards) {
        const text = await page.evaluate(el => el.textContent, card);
        if (text.includes('Časíček')) {
            targetCard = card;
            break;
        }
    }

    if (targetCard) {
        await targetCard.screenshot({ path: destPath, omitBackground: true });
        console.log(`Saved Casicek to ${destPath}`);
    } else {
        console.log('Casicek card not found!');
    }

    await browser.close();
})();
