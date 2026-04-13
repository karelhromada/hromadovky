const { createCanvas, loadImage, registerFont } = require('canvas');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// --- KONFIGURACE ---
const DPI = 300;
const MM_TO_PX = DPI / 25.4;
const WIDTH = Math.round(60 * MM_TO_PX);  // 709px
const HEIGHT = Math.round(85 * MM_TO_PX); // 1004px
const OUTPUT_DIR = path.join(__dirname, 'finalni_karty');
const IMAGES_DIR = path.join(__dirname, 'Obrázky draků');

// Mapování jmen z Excelu na názvy souborů (včetně oprav překlepů v souborech)
const IMAGE_NAME_MAP = {
    'Ignis Rex': 'Ignis rexx',
    'Vyvolávač stínů': 'Necromancer',
    'Nekromancer': 'Necromancer',
    'Hmyzí Král': 'Hmyzí král',
    'Magmaton': 'Magmaton',
    'Uhelný Běžec': 'Uhelný běžec',
    'Runový Tesák': 'Runový tesák',
    'Železný Dráp': 'Železný dráp',
    'Zlatý Zloděj': 'Zlatý zloděj'
};

// Barvy a témata (přesně podle generate_cards.js)
const THEMES = {
    FIRE: { gold: '#ff4444', goldDark: '#880000', statBaseColor: 'rgba(40, 5, 5, 0.5)' },
    AIR: { gold: '#aaddff', goldDark: '#4488bb', statBaseColor: 'rgba(10, 30, 45, 0.5)' },
    EARTH: { gold: '#77dd77', goldDark: '#226622', statBaseColor: 'rgba(20, 35, 10, 0.5)' },
    SHADOW: { gold: '#d8b0ff', goldDark: '#6633aa', statBaseColor: 'rgba(25, 5, 30, 0.5)' },
    SPEED: { gold: '#ffeb3b', goldDark: '#c6a700', statBaseColor: 'rgba(45, 40, 5, 0.5)' },
    MAGIC: { gold: '#ff99cc', goldDark: '#cc3366', statBaseColor: 'rgba(35, 10, 25, 0.5)' },
    POISON: { gold: '#00ffcc', goldDark: '#008866', statBaseColor: 'rgba(5, 40, 30, 0.5)' },
    METAL: { gold: '#c0c0c0', goldDark: '#606060', statBaseColor: 'rgba(30, 30, 35, 0.5)' }
};

const KVARTETA = [
    { group: '1', theme: THEMES.FIRE, dragons: ['Vulkanus', 'Ignis Rex', 'Magmaton', 'Uhelný Běžec'] },
    { group: '2', theme: THEMES.AIR, dragons: ['Aeris', 'Nebeský Poutník', 'Mrakošlap', 'Vichřice'] },
    { group: '3', theme: THEMES.EARTH, dragons: ['Bazilišek', 'Brontos', 'Stařec z Hor', 'Bažináč'] },
    { group: '4', theme: THEMES.SHADOW, dragons: ['Vyvolávač stínů', 'Stínový Běžec', 'Astrál', 'Runový Tesák'] },
    { group: '5', theme: THEMES.SPEED, dragons: ['Sonic', 'Blesk', 'Ostrý Hvizd', 'Tornádo'] },
    { group: '6', theme: THEMES.MAGIC, dragons: ['Kronos', 'Knihovník', 'Moudré Oko', 'Křišťál'] },
    { group: '7', theme: THEMES.POISON, dragons: ['Jedový Trn', 'Chameleon', 'Hmyzí Král', 'Hydrus'] },
    { group: '8', theme: THEMES.METAL, dragons: ['Zlatý Zloděj', 'Železný Dráp', 'Popelavý Dech', 'Terrogor'] }
];

// --- POMOCNÉ FUNKCE ---

function getKvartetaInfo(dragonName) {
    for (let k of KVARTETA) {
        const dIndex = k.dragons.indexOf(dragonName);
        if (dIndex !== -1) {
            return {
                id: k.group + String.fromCharCode(65 + dIndex),
                theme: k.theme
            };
        }
    }
    return null;
}

function drawHexagon(ctx, x, y, size, color) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - (Math.PI / 6); // Otočeno, aby byla špička nahoře (nebo bok, podle potřeby)
        // Podle CSS clip-path polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)
        // To je hexagon na výšku (špička nahoře/dole)
    }
    // Implementujeme přesně podle CSS:
    const w = size;
    const h = size * 0.9;
    ctx.beginPath();
    ctx.moveTo(x, y - h/2); // Top center
    ctx.lineTo(x + w/2, y - h/4); // Top right
    ctx.lineTo(x + w/2, y + h/4); // Bottom right
    ctx.lineTo(x, y + h/2); // Bottom center
    ctx.lineTo(x - w/2, y + h/4); // Bottom left
    ctx.lineTo(x - w/2, y - h/4); // Top left
    ctx.closePath();
    
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

/**
 * Zalamuje text do více řádků v Canvasu
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let lines = [];

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    // Kreslení odspodu nahoru (aby popis neposunul jméno)
    // Ale pro jednoduchost kreslíme shora dolů od startovního Y
    for (let k = 0; k < lines.length; k++) {
        ctx.fillText(lines[k].trim(), x, y + (k * lineHeight));
    }
    return lines.length * lineHeight;
}

async function generateCard(dragon, info) {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    // 1. Pozadí (hlavní obrázek)
    let searchName = dragon['Jméno'];
    if (dragon['#'] === 1 || searchName === 'Pyroth') searchName = 'Vulkanus';
    
    // Použijeme mapování nebo jméno samotné
    const fileName = IMAGE_NAME_MAP[searchName] || searchName;
    const imagePath = path.join(IMAGES_DIR, `${fileName}.png`);
    
    if (fs.existsSync(imagePath)) {
        const img = await loadImage(imagePath);
        // Cover fit logic
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
        console.warn(`Obrázek nenalezen: ${imagePath}`);
    }

    // 2. Overlays (stíny)
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

    // 3. ID Badge (Vrchní kolečko)
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

    // 4. Statistiky (Hexagony v rozích)
    const hexSize = 14 * MM_TO_PX;
    const margin = 2 * MM_TO_PX;
    const stats = [
        { label: 'ROZPĚTÍ (m)', val: dragon['Rozpětí (m)'], x: margin + hexSize/2, y: margin + hexSize/2 + 2 * MM_TO_PX },
        { label: 'SÍLA', val: dragon['Síla'], x: WIDTH - margin - hexSize/2, y: margin + hexSize/2 + 2 * MM_TO_PX },
        { label: 'RYCHLOST (km/h)', val: dragon['Rychlost (km/h)'], x: margin + hexSize/2, y: HEIGHT - margin - hexSize/2 - 6 * MM_TO_PX },
        { label: 'VĚK (let)', val: dragon['Věk (let)'], x: WIDTH - margin - hexSize/2, y: HEIGHT - margin - hexSize/2 - 6 * MM_TO_PX }
    ];

    stats.forEach(s => {
        drawHexagon(ctx, s.x, s.y, hexSize, info.theme.statBaseColor);
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Hodnota
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.floor(4 * MM_TO_PX)}px Georgia`;
        ctx.fillText(s.val, s.x, s.y - 1 * MM_TO_PX);

        // Popisek s automatickým změnšením (Safe Zone)
        ctx.fillStyle = '#ccc';
        let labelFontSize = 1.5 * MM_TO_PX;
        ctx.font = `${Math.floor(labelFontSize)}px Arial`;
        const maxLabelWidth = hexSize - (3 * MM_TO_PX); // Rezerva 1.5mm na každé straně

        while (ctx.measureText(s.label).width > maxLabelWidth && labelFontSize > 0.8 * MM_TO_PX) {
            labelFontSize -= 0.1 * MM_TO_PX;
            ctx.font = `${Math.floor(labelFontSize)}px Arial`;
        }

        ctx.fillText(s.label, s.x, s.y + 3 * MM_TO_PX);
    });

    // 5. Jméno a popis (se zalamováním) - Zvětšená bezpečná zóna (20mm od krajů)
    const textMaxWidth = WIDTH - (40 * MM_TO_PX); 
    const centerX = WIDTH / 2;
    
    // Jméno (Změněno na h1 styl - uppercase) - Posunuto výše a přidán AUTO-SHRINK se značnou rezervou
    ctx.fillStyle = info.theme.gold;
    let nameFontSize = 4.2 * MM_TO_PX;
    ctx.font = `bold ${Math.floor(nameFontSize)}px Georgia`;
    
    const nameUpper = dragon['Jméno'].toUpperCase();
    const nameWords = nameUpper.split(' ');
    
    // Auto-shrink logika založená na NEJDELŠÍM SLOVĚ (aby se zbytečně netrestala víceslovná jména)
    let maxWordWidth = 0;
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

    const nameHeight = wrapText(ctx, nameUpper, centerX, HEIGHT - 18 * MM_TO_PX, textMaxWidth, nameFontSize * 1.1);
    
    // Popis - Posunuto níže pod jméno
    ctx.fillStyle = '#ddd';
    const descFontSize = 2.0 * MM_TO_PX;
    ctx.font = `italic ${Math.floor(descFontSize)}px Georgia`;
    wrapText(ctx, dragon['Český popis'] || '', centerX, HEIGHT - 10 * MM_TO_PX, textMaxWidth, descFontSize * 1.2);

    // Uložení
    const buffer = canvas.toBuffer('image/png');
    const outFileName = `${dragon['Jméno']}.png`;
    fs.writeFileSync(path.join(OUTPUT_DIR, outFileName), buffer);
}

// --- HLAVNÍ BĚH ---

async function run() {
    console.log('--- Generátor Dračích Karet (PNG 300DPI) ---');
    
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const EXCEL_FILE = path.join(__dirname, 'Draci_temp.xlsx');
    const workbook = XLSX.readFile(EXCEL_FILE);
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    let count = 0;
    for (let d of data) {
        const info = getKvartetaInfo(d['Jméno'] === 'Pyroth' ? 'Vulkanus' : (d['Jméno'] === 'Nekromancer' ? 'Vyvolávač stínů' : d['Jméno']));
        if (info) {
            await generateCard(d, info);
            count++;
            process.stdout.write(`\rGenerování: ${count}/32`);
        }
    }
    console.log('\nHotovo. Karty uloženy v: finalni_karty/');
}

run().catch(console.error);
