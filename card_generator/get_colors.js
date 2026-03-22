const puppeteer = require('puppeteer');
const path = require('path');

const IMG_DIR = path.join(__dirname, '../kvarteta-eshop/public/cards/mytologie');

const testCards = [
    '1A', 'zeus_karta_1773232441103.png',
    '2A', 'herakles_karta_1773232618325.png',
    '3A', 'jupiter_karta_1773232768056.png',
    '4A', 'odin_karta_1773232963748.png',
    '5A', 'fenrir_karta_1773233163130.png',
    '6A', 'ra_karta_1773332186294.png',
    '7A', 'beowulf_karta_1773332496331.png',
    '8B', 'bazilisek_v2_karta_1773333084369.png'
];

async function run() {
const browser = await puppeteer.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
    const page = await browser.newPage();

    for (let i = 0; i < testCards.length; i += 2) {
        const id = testCards[i];
        const file = testCards[i+1];
        const fullPath = path.join(IMG_DIR, file);

        await page.goto(`file://${fullPath}`);
        
        // Wait for image load
        await page.waitForSelector('img');

        const color = await page.evaluate(() => {
            const img = document.querySelector('img');
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Sample a pixel right at the top middle border, and top left border, find the brightest/most distinct color
            const getHex = (x, y) => {
                const pixelData = ctx.getImageData(x, y, 1, 1).data;
                return '#' + [pixelData[0], pixelData[1], pixelData[2]].map(x => x.toString(16).padStart(2, '0')).join('');
            };

            // Let's sample a few points on the left border (y=300 to avoid corners)
            const sample1 = getHex(5, 300);
            const sample2 = getHex(15, 300);
            
            return { s1: sample1, s2: sample2 };
        });

        console.log(`Set ${id.charAt(0)} border sample: ${color.s1} / Inner: ${color.s2}`);
    }

    await browser.close();
}

run().catch(console.log);
