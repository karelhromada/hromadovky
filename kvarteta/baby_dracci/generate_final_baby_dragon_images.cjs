const { createCanvas, loadImage } = require('canvas');
const XLSX = require('xlsx');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// --- KONFIGURACE ---
const DPI = 300;
const MM_TO_PX = DPI / 25.4;
const WIDTH = Math.round(60 * MM_TO_PX);   // 709px
const HEIGHT = Math.round(85 * MM_TO_PX);  // 1004px

const OUTPUT_DIR = path.join(__dirname, 'finalni_karty');
const IMAGES_DIR = path.join(__dirname, 'Baby dráčci');
const EXCEL_FILE = path.join(__dirname, '..', '..', 'data_sources', 'Baby dráčci.xlsx');
const SUBTITLES = require('./baby_subtitles.js');

// Sloupec s názvem v Excelu
const NAME_COL = 'Název mláděte';

// Mapování jmen (Excel/KVARTETA) -> skutečný název souboru v Baby dráčci/
const IMAGE_NAME_MAP = {
    'Brontík': 'Brontíček',
    'Kostíček': 'Kostiček',
    'Lávový Prcek': 'Lávový prcek'
};

// Barvy témat (přesně podle generate_baby_dragons.js + statBaseColor dle dračí konvence)
const THEMES = {
    FIRE:   { gold: '#ff4444', goldDark: '#880000', statBaseColor: 'rgba(40, 5, 5, 0.5)' },
    AIR:    { gold: '#aaddff', goldDark: '#4488bb', statBaseColor: 'rgba(10, 30, 45, 0.5)' },
    EARTH:  { gold: '#77dd77', goldDark: '#226622', statBaseColor: 'rgba(20, 35, 10, 0.5)' },
    SHADOW: { gold: '#d8b0ff', goldDark: '#6633aa', statBaseColor: 'rgba(25, 5, 30, 0.5)' },
    SPEED:  { gold: '#ffeb3b', goldDark: '#c6a700', statBaseColor: 'rgba(45, 40, 5, 0.5)' },
    MAGIC:  { gold: '#ff99cc', goldDark: '#cc3366', statBaseColor: 'rgba(35, 10, 25, 0.5)' },
    POISON: { gold: '#00ffcc', goldDark: '#008866', statBaseColor: 'rgba(5, 40, 30, 0.5)' },
    METAL:  { gold: '#c0c0c0', goldDark: '#606060', statBaseColor: 'rgba(30, 30, 35, 0.5)' }
};

// Přesně dle generate_baby_dragons.js
const KVARTETA = [
    { group: '1', theme: THEMES.FIRE,   dragons: ['Lávový Prcek', 'Magmísek', 'Rudíček', 'Uhlík'] },
    { group: '2', theme: THEMES.AIR,    dragons: ['Obláčkový Špunt', 'Vzdušník', 'Mrakáček', 'Plachťáček'] },
    { group: '3', theme: THEMES.EARTH,  dragons: ['Brontík', 'Horalíček', 'Bažík', 'Trníček'] },
    { group: '4', theme: THEMES.MAGIC,  dragons: ['Runíček', 'Časíček', 'Diamantík', 'Mudráček'] },
    { group: '5', theme: THEMES.SPEED,  dragons: ['Bleskáček', 'Sonicík', 'Vířík', 'Křidélko'] },
    { group: '6', theme: THEMES.SHADOW, dragons: ['Stínek', 'Hvězdínek', 'Kostíček', 'Tříhlavík'] },
    { group: '7', theme: THEMES.POISON, dragons: ['Hmyzík', 'Vlník', 'Duhoš', 'Korunkáček'] },
    { group: '8', theme: THEMES.METAL,  dragons: ['Zlaťoušek', 'Drápek', 'Popeláček', 'Obřík'] }
];

// --- POMOCNÉ FUNKCE ---

function getKvartetaInfo(dragonName) {
    for (const k of KVARTETA) {
        const idx = k.dragons.indexOf(dragonName);
        if (idx !== -1) {
            return {
                id: k.group + String.fromCharCode(65 + idx),
                theme: k.theme
            };
        }
    }
    return null;
}

function resolveImagePath(dragonName) {
    const base = IMAGE_NAME_MAP[dragonName] || dragonName;
    const exts = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG'];
    for (const ext of exts) {
        const p = path.join(IMAGES_DIR, base + ext);
        if (fs.existsSync(p)) return p;
    }
    return null;
}

function drawHexagon(ctx, x, y, size, color) {
    const w = size;
    const h = size * 0.9;
    ctx.beginPath();
    ctx.moveTo(x, y - h/2);
    ctx.lineTo(x + w/2, y - h/4);
    ctx.lineTo(x + w/2, y + h/4);
    ctx.lineTo(x, y + h/2);
    ctx.lineTo(x - w/2, y + h/4);
    ctx.lineTo(x - w/2, y - h/4);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    for (let k = 0; k < lines.length; k++) {
        ctx.fillText(lines[k].trim(), x, y + (k * lineHeight));
    }
    return lines.length * lineHeight;
}

async function generateCard(dragon, info) {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');
    const dragonName = dragon[NAME_COL];

    // 1. Pozadí (hlavní obrázek)
    const imagePath = resolveImagePath(dragonName);
    if (imagePath) {
        const img = await loadImage(imagePath);
        const imgRatio = img.width / img.height;
        const canvasRatio = WIDTH / HEIGHT;
        let dw, dh, dx, dy;
        if (imgRatio > canvasRatio) {
            dh = HEIGHT;
            dw = HEIGHT * imgRatio;
            dx = (WIDTH - dw) / 2;
            dy = 0;
        } else {
            dw = WIDTH;
            dh = WIDTH / imgRatio;
            dx = 0;
            dy = (HEIGHT - dh) / 2;
        }
        ctx.drawImage(img, dx, dy, dw, dh);
    } else {
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        console.warn(`\nObrázek nenalezen pro: ${dragonName}`);
    }

    // 2. Overlays
    const topGradient = ctx.createLinearGradient(0, 0, 0, HEIGHT * 0.2);
    topGradient.addColorStop(0, 'rgba(0,0,0,0.3)');
    topGradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT * 0.2);

    const bottomGradient = ctx.createLinearGradient(0, HEIGHT * 0.7, 0, HEIGHT);
    bottomGradient.addColorStop(0, 'rgba(0,0,0,0)');
    bottomGradient.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 3. ID Badge
    const badgeSize = 7.5 * MM_TO_PX;
    const badgeX = WIDTH / 2;
    const badgeY = 3.5 * MM_TO_PX;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY + badgeSize/2, badgeSize/2, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.strokeStyle = info.theme.gold;
    ctx.lineWidth = 0.5 * MM_TO_PX;
    ctx.stroke();

    ctx.fillStyle = info.theme.gold;
    ctx.font = `bold ${Math.floor(4 * MM_TO_PX)}px Georgia`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(info.id, badgeX, badgeY + badgeSize/2 + 0.5 * MM_TO_PX);

    // 4. Statistiky (hexagony)
    const hexSize = 14 * MM_TO_PX;
    const margin = 2 * MM_TO_PX;
    const stats = [
        { label: 'ROZPĚTÍ (m)', val: dragon['Rozpětí (m)'], x: margin + hexSize/2,         y: margin + hexSize/2 + 2 * MM_TO_PX },
        { label: 'SÍLA',        val: dragon['Síla'],        x: WIDTH - margin - hexSize/2, y: margin + hexSize/2 + 2 * MM_TO_PX },
        { label: 'RYCHLOST',    val: dragon['Rychlost'],    x: margin + hexSize/2,         y: HEIGHT - margin - hexSize/2 - 6 * MM_TO_PX },
        { label: 'VĚK (let)',   val: dragon['Věk (let)'],   x: WIDTH - margin - hexSize/2, y: HEIGHT - margin - hexSize/2 - 6 * MM_TO_PX }
    ];

    stats.forEach(s => {
        drawHexagon(ctx, s.x, s.y, hexSize, info.theme.statBaseColor);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.floor(4 * MM_TO_PX)}px Georgia`;
        ctx.fillText(String(s.val ?? '-'), s.x, s.y - 1 * MM_TO_PX);

        ctx.fillStyle = '#ccc';
        let labelFontSize = 1.5 * MM_TO_PX;
        ctx.font = `${Math.floor(labelFontSize)}px Arial`;
        const maxLabelWidth = hexSize - (3 * MM_TO_PX);
        while (ctx.measureText(s.label).width > maxLabelWidth && labelFontSize > 0.8 * MM_TO_PX) {
            labelFontSize -= 0.1 * MM_TO_PX;
            ctx.font = `${Math.floor(labelFontSize)}px Arial`;
        }
        ctx.fillText(s.label, s.x, s.y + 3 * MM_TO_PX);
    });

    // 5. Jméno + popis
    const textMaxWidth = WIDTH - (40 * MM_TO_PX);
    const centerX = WIDTH / 2;

    ctx.fillStyle = info.theme.gold;
    let nameFontSize = 4.2 * MM_TO_PX;
    ctx.font = `bold ${Math.floor(nameFontSize)}px Georgia`;

    const nameUpper = dragonName.toUpperCase();
    const nameWords = nameUpper.split(' ');

    const calculateMaxWordWidth = () => {
        let max = 0;
        nameWords.forEach(w => {
            const wWidth = ctx.measureText(w).width;
            if (wWidth > max) max = wWidth;
        });
        return max;
    };

    while (calculateMaxWordWidth() > textMaxWidth && nameFontSize > 2 * MM_TO_PX) {
        nameFontSize -= 0.1 * MM_TO_PX;
        ctx.font = `bold ${Math.floor(nameFontSize)}px Georgia`;
    }

    wrapText(ctx, nameUpper, centerX, HEIGHT - 18 * MM_TO_PX, textMaxWidth, nameFontSize * 1.1);

    const description = SUBTITLES[dragonName] || '';
    ctx.fillStyle = '#ddd';
    const descFontSize = 2.0 * MM_TO_PX;
    ctx.font = `italic ${Math.floor(descFontSize)}px Georgia`;
    wrapText(ctx, description, centerX, HEIGHT - 10 * MM_TO_PX, textMaxWidth, descFontSize * 1.2);

    // 6. Uložení jako WEBP (canvas -> PNG buffer -> sharp -> WEBP)
    const pngBuffer = canvas.toBuffer('image/png');
    const webpBuffer = await sharp(pngBuffer).webp({ quality: 92 }).toBuffer();
    const outFileName = `${dragonName}.webp`;
    fs.writeFileSync(path.join(OUTPUT_DIR, outFileName), webpBuffer);
}

// --- HLAVNÍ BĚH ---

async function run() {
    console.log('--- Generátor Karet Baby Draků (WEBP 300DPI) ---');

    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    if (!fs.existsSync(EXCEL_FILE)) {
        console.error(`Excel nenalezen: ${EXCEL_FILE}`);
        process.exit(1);
    }

    const workbook = XLSX.readFile(EXCEL_FILE);
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    const skipped = [];
    let count = 0;
    for (const d of data) {
        const name = d[NAME_COL];
        if (!name) continue;
        const info = getKvartetaInfo(name);
        if (!info) {
            skipped.push(name);
            continue;
        }
        await generateCard(d, info);
        count++;
        process.stdout.write(`\rGenerování: ${count}/${data.length}`);
    }

    console.log(`\nHotovo. Vygenerováno ${count} karet do: ${OUTPUT_DIR}`);
    if (skipped.length) {
        console.warn(`Přeskočeno (nejsou v KVARTETA): ${skipped.join(', ')}`);
    }
}

run().catch(e => { console.error(e); process.exit(1); });
