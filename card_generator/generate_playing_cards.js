const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const suits = [
    { id: 'srdce', symbol: '♥', color: '#8b0000', prefix: 'drag_red', titlePrefix: 'Ohnivý' },
    { id: 'listy', symbol: '♠', color: '#006400', prefix: 'drag_green', titlePrefix: 'Lesní' },
    { id: 'zaludy', symbol: '♣', color: '#b8860b', prefix: 'drag_yellow', titlePrefix: 'Zlatý' },
    { id: 'kule', symbol: '♦', color: '#8b4513', prefix: 'drag_brown', titlePrefix: 'Zemní' }
];

const values = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const titles = {
    'J': 'Spodek',
    'Q': 'Svršek',
    'K': 'Král',
    'A': 'Eso'
};

// Map J, Q, K, A to existing generated dragon images
// The user currently has images like drag_1.png to drag_8.png, baby_1.png to baby_8.png
// We will assign them systematically for demonstration
const getImageForFigure = (suitPrefix, value) => {
    if (value === 'J') {
        const suitsMap = {
            'drag_red': 'spodek_srdce.png',
            'drag_green': 'spodek_listy.png',
            'drag_yellow': 'spodek_zaludy.png',
            'drag_brown': 'spodek_kule.png'
        };
        return `../kvarteta-eshop/public/cards/${suitsMap[suitPrefix]}`;
    }

    if (value === 'Q') {
        const suitsMap = {
            'drag_red': 'svrsek_srdce.png',
            'drag_green': 'svrsek_listy.png',
            'drag_yellow': 'svrsek_zaludy.png',
            'drag_brown': 'svrsek_kule.png'
        };
        return `../kvarteta-eshop/public/cards/${suitsMap[suitPrefix]}`;
    }

    if (value === 'K') {
        if (suitPrefix === 'drag_red') return `../kvarteta-eshop/public/cards/kral_srdce.png`;
        if (suitPrefix === 'drag_brown') return `../kvarteta-eshop/public/cards/kral_kule_final.png`;
        if (suitPrefix === 'drag_green') return `../kvarteta-eshop/public/cards/kral_listy.png`;
        if (suitPrefix === 'drag_yellow') return `../kvarteta-eshop/public/cards/kral_zaludy.png`;
        let imgNum = 3;
        let baseFile = 'drag_3.png';
        if (suitPrefix === 'drag_green') baseFile = `drag_7.png`;
        else if (suitPrefix === 'drag_yellow') baseFile = `baby_3.png`;
        else if (suitPrefix === 'drag_brown') baseFile = `baby_7.png`;
        return `../kvarteta-eshop/public/cards/${baseFile}`;
    }

    if (value === 'A') {
        if (suitPrefix === 'drag_red') return `../kvarteta-eshop/public/cards/eso_srdce.png`;
        if (suitPrefix === 'drag_yellow') return `../kvarteta-eshop/public/cards/eso_zaludy.png`;
        if (suitPrefix === 'drag_brown') return `../kvarteta-eshop/public/cards/eso_kule.png`;
        if (suitPrefix === 'drag_green') return `../kvarteta-eshop/public/cards/eso_listy.png`;
        imgNum = 4;
    }

    let baseFile = 'drag_1.png';
    if (suitPrefix === 'drag_red') baseFile = `drag_${imgNum}.png`;
    else if (suitPrefix === 'drag_green') baseFile = `drag_${imgNum + 4}.png`;
    else if (suitPrefix === 'drag_yellow') baseFile = `baby_${imgNum}.png`;
    else if (suitPrefix === 'drag_brown') baseFile = `baby_${imgNum + 4}.png`;

    return `../kvarteta-eshop/public/cards/${baseFile}`;
};

const DECK = [];

for (const suit of suits) {
    for (const val of values) {
        let imageUrl = '';
        let motifUrl = '';
        let title = '';
        if (['J', 'Q', 'K', 'A'].includes(val)) {
            imageUrl = getImageForFigure(suit.prefix, val);
            title = titles[val];
        }

        if (val === '7' && suit.id === 'srdce') {
            const imgPath = path.resolve(__dirname, 'srdce_7_final.png');
            if (fs.existsSync(imgPath)) {
                const bitmap = fs.readFileSync(imgPath);
                imageUrl = `data:image/png;base64,${bitmap.toString('base64')}`;
            }
        }
        if (val === '8' && suit.id === 'srdce') {
            const imgPath = path.resolve(__dirname, 'srdce_8_final.png');
            if (fs.existsSync(imgPath)) {
                const bitmap = fs.readFileSync(imgPath);
                imageUrl = `data:image/png;base64,${bitmap.toString('base64')}`;
            }
        }
        if (val === '9' && suit.id === 'srdce') {
            const imgPath = path.resolve(__dirname, 'srdce_9_final.png');
            if (fs.existsSync(imgPath)) {
                const bitmap = fs.readFileSync(imgPath);
                imageUrl = `data:image/png;base64,${bitmap.toString('base64')}`;
            }
        }
        if (val === '10' && suit.id === 'srdce') {
            const imgPath = path.resolve(__dirname, 'srdce_10_final.png');
            if (fs.existsSync(imgPath)) {
                const bitmap = fs.readFileSync(imgPath);
                imageUrl = `data:image/png;base64,${bitmap.toString('base64')}`;
            }
        }
        if (val === '7' && suit.id === 'listy') {
            const imgPath = path.resolve(__dirname, 'listy_7_final.png');
            if (fs.existsSync(imgPath)) {
                const bitmap = fs.readFileSync(imgPath);
                imageUrl = `data:image/png;base64,${bitmap.toString('base64')}`;
            }
        }
        if (val === '8' && suit.id === 'listy') {
            const imgPath = path.resolve(__dirname, 'listy_8_final.png');
            if (fs.existsSync(imgPath)) {
                const bitmap = fs.readFileSync(imgPath);
                imageUrl = `data:image/png;base64,${bitmap.toString('base64')}`;
            }
        }
        if (val === '9' && suit.id === 'listy') {
            const imgPath = path.resolve(__dirname, 'listy_9_final.png');
            if (fs.existsSync(imgPath)) {
                const bitmap = fs.readFileSync(imgPath);
                imageUrl = `data:image/png;base64,${bitmap.toString('base64')}`;
            }
        }
        if (val === '10' && suit.id === 'listy') {
            const imgPath = path.resolve(__dirname, 'listy_10_final.png');
            if (fs.existsSync(imgPath)) {
                const bitmap = fs.readFileSync(imgPath);
                imageUrl = `data:image/png;base64,${bitmap.toString('base64')}`;
            }
        }
        if (val === '7' && suit.id === 'kule') {
            const imgPath = path.resolve(__dirname, 'kule_7_final.png');
            if (fs.existsSync(imgPath)) {
                const bitmap = fs.readFileSync(imgPath);
                imageUrl = `data:image/png;base64,${bitmap.toString('base64')}`;
            }
        }
        if (val === '8' && suit.id === 'kule') {
            const imgPath = path.resolve(__dirname, 'kule_8_final.png');
            if (fs.existsSync(imgPath)) {
                const bitmap = fs.readFileSync(imgPath);
                imageUrl = `data:image/png;base64,${bitmap.toString('base64')}`;
            }
        }
        if (val === '9' && suit.id === 'kule') {
            const imgPath = path.resolve(__dirname, 'kule_9_final.png');
            if (fs.existsSync(imgPath)) {
                const bitmap = fs.readFileSync(imgPath);
                imageUrl = `data:image/png;base64,${bitmap.toString('base64')}`;
            }
        }
        if (val === '10' && suit.id === 'kule') {
            const imgPath = path.resolve(__dirname, 'kule_10_final.png');
            if (fs.existsSync(imgPath)) {
                const bitmap = fs.readFileSync(imgPath);
                imageUrl = `data:image/png;base64,${bitmap.toString('base64')}`;
            }
        }
        if (val === '7' && suit.id === 'zaludy') {
            const imgPath = path.resolve(__dirname, 'zaludy_7_final.png');
            if (fs.existsSync(imgPath)) {
                const bitmap = fs.readFileSync(imgPath);
                imageUrl = `data:image/png;base64,${bitmap.toString('base64')}`;
            }
        }
        if (val === '8' && suit.id === 'zaludy') {
            const imgPath = path.resolve(__dirname, 'zaludy_8_final.png');
            if (fs.existsSync(imgPath)) {
                const bitmap = fs.readFileSync(imgPath);
                imageUrl = `data:image/png;base64,${bitmap.toString('base64')}`;
            }
        }
        if (val === '9' && suit.id === 'zaludy') {
            const imgPath = path.resolve(__dirname, 'zaludy_9_final.png');
            if (fs.existsSync(imgPath)) {
                const bitmap = fs.readFileSync(imgPath);
                imageUrl = `data:image/png;base64,${bitmap.toString('base64')}`;
            }
        }
        if (val === '10' && suit.id === 'zaludy') {
            const imgPath = path.resolve(__dirname, 'zaludy_10_final.png');
            if (fs.existsSync(imgPath)) {
                const bitmap = fs.readFileSync(imgPath);
                imageUrl = `data:image/png;base64,${bitmap.toString('base64')}`;
            }
        }

        DECK.push({
            id: `prsi_${suit.id}_${val}`,
            suitClass: suit.id,
            suitSymbol: suit.symbol,
            value: val,
            imageUrl: imageUrl,
            motifUrl: motifUrl,
            title: title
        });
    }
}

async function generateCards() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set viewport matching our CSS card size to take the tightest screenshot
    await page.setViewport({ width: 825, height: 1125, deviceScaleFactor: 1 });

    const htmlPath = path.resolve(__dirname, 'playing_cards.html');
    const outDir = path.resolve(__dirname, '../kvarteta-eshop/public/cards/prsi');

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    console.log(`Začínám renderovat ${DECK.length} Prší karet...`);

    for (let i = 0; i < DECK.length; i++) {
        const card = DECK[i];
        console.log(`Renderuji: ${card.id}`);

        // Call the render function inside the browser page
        await page.evaluate((data) => {
            window.renderCard(data);
        }, card);

        // Optional: wait a microsecond for any background images to swap fully
        await new Promise(r => setTimeout(r, 100));

        // Take a screenshot
        const element = await page.$('#card-container');
        await element.screenshot({
            path: path.join(outDir, `${card.id}.png`)
        });
    }

    await browser.close();
    console.log('✅ Všech 32 Prší karet bylo úspěšně vyrenderováno a uloženo do /public/cards/prsi!');
}

generateCards().catch(console.error);
