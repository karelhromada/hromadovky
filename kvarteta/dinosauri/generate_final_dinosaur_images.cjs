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
const IMAGES_DIR = path.join(__dirname, 'Obrázky dinosaurů');
const EXCEL_FILE = path.join(__dirname, '..', '..', 'data_sources', 'Dinosauři.xlsx');
const SUBTITLES = require('./dino_subtitles.js');

// Mapování jmen z Excelu na názvy souborů (včetně oprav překlepů / rozdílů)
const IMAGE_NAME_MAP = {
    'Tyrannosaurus': 'Tyrannosaurus - Rex'
};

// Barvy a témata (přesně podle kvarteta/dinosauri/generate_dinosaurs.js, rozšířeno o statBaseColor)
const THEMES = {
    PREDATORS:  { name: 'PREDÁTOŘI',  gold: '#ff4444', goldDark: '#880000', statBaseColor: 'rgba(40, 5, 5, 0.5)' },
    GIANTS:     { name: 'OBŘI',       gold: '#77dd77', goldDark: '#226622', statBaseColor: 'rgba(20, 35, 10, 0.5)' },
    ARMORED:    { name: 'OBRNĚNÍ',    gold: '#cccccc', goldDark: '#666666', statBaseColor: 'rgba(30, 30, 30, 0.5)' },
    RAPTORS:    { name: 'DRAVCI',     gold: '#ff9800', goldDark: '#e65100', statBaseColor: 'rgba(45, 20, 5, 0.5)' },
    EXOTIC:     { name: 'EXOTIČTÍ',   gold: '#d8b0ff', goldDark: '#6633aa', statBaseColor: 'rgba(25, 5, 30, 0.5)' },
    FLYERS:     { name: 'LETCI',      gold: '#aaddff', goldDark: '#4488bb', statBaseColor: 'rgba(10, 30, 45, 0.5)' },
    MARINE:     { name: 'MOŘŠTÍ',     gold: '#00ccff', goldDark: '#004488', statBaseColor: 'rgba(5, 25, 45, 0.5)' },
    HERBIVORES: { name: 'BYLOŽRAVCI', gold: '#b07d4b', goldDark: '#5d3a1a', statBaseColor: 'rgba(30, 20, 10, 0.5)' }
};

// Mapování písmen sloupce Skupina (A..H) na témata
const KVARTETA_MAP = {
    'A': THEMES.PREDATORS,
    'B': THEMES.GIANTS,
    'C': THEMES.ARMORED,
    'D': THEMES.RAPTORS,
    'E': THEMES.EXOTIC,
    'F': THEMES.FLYERS,
    'G': THEMES.MARINE,
    'H': THEMES.HERBIVORES
};

// --- POMOCNÉ FUNKCE ---

function getKvartetaInfo(row) {
    const groupRaw = (row['Skupina'] || '').toString().trim();
    if (groupRaw.length < 2) return null;

    const letter = groupRaw[0].toUpperCase();
    const numberChar = groupRaw[1];
    const theme = KVARTETA_MAP[letter];
    if (!theme) return null;

    const groupNum = letter.charCodeAt(0) - 64;          // A->1, B->2, ...
    const subLetter = String.fromCharCode(64 + parseInt(numberChar, 10)); // 1->A, 2->B, ...

    return {
        id: `${groupNum}${subLetter}`,
        theme,
        groupName: theme.name
    };
}

function resolveImagePath(dinoName) {
    const base = IMAGE_NAME_MAP[dinoName] || dinoName;
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

async function generateCard(dino, info) {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    // 1. Pozadí (hlavní obrázek)
    const imagePath = resolveImagePath(dino['Jméno']);
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
        console.warn(`\nObrázek nenalezen pro: ${dino['Jméno']}`);
    }

    // 2. Overlays (horní a dolní stíny)
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

    // 3. ID Badge (vrchní kolečko)
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

    // 4. Statistiky (hexagony v rozích)
    const hexSize = 14 * MM_TO_PX;
    const margin = 2 * MM_TO_PX;
    const stats = [
        { label: 'SÍLA',            val: dino['Síla'],            x: margin + hexSize/2,           y: margin + hexSize/2 + 2 * MM_TO_PX },
        { label: 'DÉLKA (m)',       val: dino['Délka (m)'],       x: WIDTH - margin - hexSize/2,   y: margin + hexSize/2 + 2 * MM_TO_PX },
        { label: 'HMOTNOST (kg)',   val: dino['Hmotnost (kg)'],   x: margin + hexSize/2,           y: HEIGHT - margin - hexSize/2 - 6 * MM_TO_PX },
        { label: 'RYCHLOST (km/h)', val: dino['Rychlost (km/h)'], x: WIDTH - margin - hexSize/2,   y: HEIGHT - margin - hexSize/2 - 6 * MM_TO_PX }
    ];

    stats.forEach(s => {
        drawHexagon(ctx, s.x, s.y, hexSize, info.theme.statBaseColor);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Hodnota
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.floor(4 * MM_TO_PX)}px Georgia`;
        ctx.fillText(String(s.val ?? '-'), s.x, s.y - 1 * MM_TO_PX);

        // Popisek s automatickým zmenšením (safe zone)
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

    // 5. Jméno a popis (se zalamováním)
    const textMaxWidth = WIDTH - (40 * MM_TO_PX);
    const centerX = WIDTH / 2;

    // Jméno (uppercase, auto-shrink podle nejdelšího slova)
    ctx.fillStyle = info.theme.gold;
    let nameFontSize = 4.2 * MM_TO_PX;
    ctx.font = `bold ${Math.floor(nameFontSize)}px Georgia`;

    const nameUpper = dino['Jméno'].toUpperCase();
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

    // Popis (fallback přes dino_subtitles.js — Excel popis nemá)
    const description = SUBTITLES[dino['Jméno']] || '';
    ctx.fillStyle = '#ddd';
    const descFontSize = 2.0 * MM_TO_PX;
    ctx.font = `italic ${Math.floor(descFontSize)}px Georgia`;
    wrapText(ctx, description, centerX, HEIGHT - 10 * MM_TO_PX, textMaxWidth, descFontSize * 1.2);

    // 6. Uložení jako WEBP (canvas → PNG buffer → sharp → WEBP)
    const pngBuffer = canvas.toBuffer('image/png');
    const webpBuffer = await sharp(pngBuffer).webp({ quality: 92 }).toBuffer();
    const outFileName = `${dino['Jméno']}.webp`;
    fs.writeFileSync(path.join(OUTPUT_DIR, outFileName), webpBuffer);
}

// --- HLAVNÍ BĚH ---

async function run() {
    console.log('--- Generátor Dinosauřích Karet (WEBP 300DPI) ---');

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
        if (!d['Jméno']) continue;
        const info = getKvartetaInfo(d);
        if (!info) {
            skipped.push(`${d['Jméno']} (Skupina: ${d['Skupina']})`);
            continue;
        }
        await generateCard(d, info);
        count++;
        process.stdout.write(`\rGenerování: ${count}/${data.length}`);
    }

    console.log(`\nHotovo. Vygenerováno ${count} karet do: ${OUTPUT_DIR}`);
    if (skipped.length) {
        console.warn(`Přeskočeno (chybná skupina): ${skipped.join(', ')}`);
    }
}

run().catch(e => { console.error(e); process.exit(1); });
