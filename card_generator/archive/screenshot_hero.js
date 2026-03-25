const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: '/Users/air2024/.gemini/antigravity/brain/53861bfb-f3ba-4cb8-9d5b-edf3eb09e88a/hero_v4_test.png' });
    await browser.close();
})();
