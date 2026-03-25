const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_FILE = path.join(__dirname, 'all_baby_dragons.html');
const IMAGES_DIR = 'Baby dráčci';
const EXCEL_FILE = path.join(__dirname, '..', 'Baby dráčci.xlsx');

// Read Excel
if (!fs.existsSync(EXCEL_FILE)) {
    console.error(`Excel file not found: ${EXCEL_FILE}`);
    process.exit(1);
}

const workbook = XLSX.readFile(EXCEL_FILE);
const sheetName = workbook.SheetNames[0];
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Color Themes
const THEMES = {
    FIRE: { gold: '#ff4444', goldDark: '#880000' },
    AIR: { gold: '#aaddff', goldDark: '#4488bb' },
    EARTH: { gold: '#77dd77', goldDark: '#226622' },
    SHADOW: { gold: '#d8b0ff', goldDark: '#6633aa' },
    SPEED: { gold: '#ffeb3b', goldDark: '#c6a700' },
    MAGIC: { gold: '#ff99cc', goldDark: '#cc3366' },
    POISON: { gold: '#00ffcc', goldDark: '#008866' },
    METAL: { gold: '#c0c0c0', goldDark: '#606060' }
};

// Kvarteta Group Definition (1A-8D)
const KVARTETA = [
    { group: '1', theme: THEMES.FIRE, dragons: ['Lávový Prcek', 'Magmísek', 'Rudíček', 'Uhlík'] },
    { group: '2', theme: THEMES.AIR, dragons: ['Obláčkový Špunt', 'Vzdušník', 'Mrakáček', 'Plachťáček'] },
    { group: '3', theme: THEMES.EARTH, dragons: ['Brontík', 'Horalíček', 'Bažík', 'Trníček'] },
    { group: '4', theme: THEMES.MAGIC, dragons: ['Runíček', 'Časíček', 'Diamantík', 'Mudráček'] },
    { group: '5', theme: THEMES.SPEED, dragons: ['Bleskáček', 'Sonicík', 'Vířík', 'Křidélko'] },
    { group: '6', theme: THEMES.SHADOW, dragons: ['Stínek', 'Hvězdínek', 'Kostíček', 'Tříhlavík'] },
    { group: '7', theme: THEMES.POISON, dragons: ['Hmyzík', 'Vlník', 'Duhoš', 'Korunkáček'] },
    { group: '8', theme: THEMES.METAL, dragons: ['Zlaťoušek', 'Drápek', 'Popeláček', 'Obřík'] }
];

function getKvartetaInfo(dragonName) {
    for (let k of KVARTETA) {
        const dIndex = k.dragons.indexOf(dragonName);
        if (dIndex !== -1) {
            return {
                label: `${k.group}${String.fromCharCode(65 + dIndex)}`,
                theme: k.theme
            };
        }
    }
    return { label: '?', theme: THEMES.FIRE };
}

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const babySubtitles = require('./baby_subtitles.js');

function getCardHTML(dragon, kvartetaInfo) {
    const dragonName = dragon['Název mláděte'];
    const theme = kvartetaInfo.theme;
    const label = kvartetaInfo.label;

    // Fuzzy image lookup
    let imagePath = '';
    const imagesDirPath = path.join(__dirname, IMAGES_DIR);
    if (fs.existsSync(imagesDirPath)) {
        const dirFiles = fs.readdirSync(imagesDirPath);

        // 1. Direct match
        const directMatch = dirFiles.find(f => f.toLowerCase() === (dragonName + '.png').toLowerCase());
        if (directMatch) {
            imagePath = path.join(IMAGES_DIR, directMatch);
        } else {
            // 2. Normalized fuzzy match (improved)
            const normSearch = removeAccents(dragonName.toLowerCase());
            const found = dirFiles.find(f => {
                const normF = removeAccents(f.toLowerCase()).replace('.png', '');
                return normF === normSearch ||
                    normF.includes(normSearch) ||
                    normSearch.includes(normF) ||
                    (normSearch.length > 4 && normF.startsWith(normSearch.substring(0, 5))) || // e.g. "Brontík" matches "Brontíček"
                    (normF.length > 4 && normSearch.startsWith(normF.substring(0, 5)));
            });
            if (found) {
                imagePath = path.join(IMAGES_DIR, found);
            } else {
                console.warn(`⚠️ Warning: No image found for dragon "${dragonName}"`);
            }
        }
    }

    // URL Encode the path for use in HTML
    const imgSrc = imagePath.split(path.sep).map(encodeURIComponent).join('/');

    const cardStyle = `
        --gold: ${theme.gold};
        --gold-dark: ${theme.goldDark};
    `;

    const subtitle = babySubtitles[dragonName] || 'Malý dráček';

    return `
    <div class="card" style="${cardStyle}">
        <img src="${imgSrc}" class="card-bg-blur-img" alt="">
        <img src="${imgSrc}" class="card-image-img" alt="${dragonName}">
        <div class="overlay-top"></div>
        <div class="overlay-bottom"></div>
        <div class="id-badge">${label}</div>
        
        <div class="hex-container pos-tl"><div class="stat-hex"><div class="stat-value">${dragon['Rozpětí (m)']}</div><div class="stat-label">ROZPĚTÍ (m)</div></div></div>
        <div class="hex-container pos-tr"><div class="stat-hex"><div class="stat-value">${dragon['Síla']}</div><div class="stat-label">SÍLA</div></div></div>
        <div class="hex-container pos-bl"><div class="stat-hex"><div class="stat-value">${dragon['Rychlost']}</div><div class="stat-label">RYCHLOST (km/h)</div></div></div>
        <div class="hex-container pos-br"><div class="stat-hex"><div class="stat-value">${dragon['Věk (let)']}</div><div class="stat-label">VĚK (let)</div></div></div>

        <div class="name-container">
            <h1 class="card-name">${dragonName}</h1>
            <p class="card-desc">${subtitle}</p>
        </div>
    </div>
    `;
}

// Full HTML Template
let htmlContent = `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <title>Baby Dragon Cards</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Roboto:ital,wght@0,300;0,400;0,700;1,400&display=swap');
        
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        :root {
            --card-width: 60mm;
            --card-height: 85mm;
            --border-radius: 4mm;
            --gold: #d4af37;
        }

        body {
            font-family: 'Roboto', sans-serif;
            background-color: #333;
            margin: 0;
            padding: 0;
            display: block;
        }

        .main-container {
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        @media print {
            body { background-color: white !important; }
            .main-container { padding: 0 !important; display: block !important; width: 100% !important; height: 100% !important; }
            .page-grid { 
                box-shadow: none !important; 
                margin: 0 !important;
                padding: 0 !important;
                width: 210mm !important; 
                height: 297mm !important;
                display: grid !important;
                grid-template-columns: repeat(3, 60mm) !important;
                gap: 2mm !important;
                page-break-after: always !important;
                background: white !important;
                position: relative !important;
                /* Centering logic for 3x60mm + 2x2mm = 184mm inside 210mm */
                padding-left: 13mm !important;
                padding-right: 13mm !important;
                /* Vertical centering: 3x85mm + 2x2mm = 259mm inside 297mm */
                padding-top: 19mm !important;
                padding-bottom: 19mm !important;
                align-content: start !important;
            }
            .page-grid:last-of-type {
                page-break-after: avoid !important;
            }
            @page { size: A4 portrait; margin: 0; }
            .card { break-inside: avoid !important; box-shadow: none !important; border: 0.1mm solid #eee; }
            .card-bg-blur-img { display: none !important; filter: none !important; }
            .card-image-img { filter: none !important; }
            .overlay-top { box-shadow: inset 0 10mm 15mm -10mm rgba(0,0,0,0.1) !important; background: none !important; }
            .overlay-bottom { box-shadow: inset 0 -20mm 30mm -10mm rgba(0,0,0,0.4) !important; background: none !important; }
            .hex-container { backdrop-filter: none !important; background: rgba(0, 0, 0, 0.2) !important; border: 0.1mm solid rgba(255,255,255,0.3) !important; }
            .stat-value, .stat-label, .card-name, .card-desc { text-shadow: none !important; }
            .id-badge { box-shadow: none !important; text-shadow: none !important; }
            .registration-mark { display: block !important; }
        }

        .page-grid {
            display: grid;
            grid-template-columns: repeat(3, 60mm);
            grid-auto-rows: 85mm;
            gap: 2mm;
            width: 210mm; 
            height: 297mm;
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            page-break-after: always;
            justify-content: center;
            align-content: center;
            position: relative;
        }

        /* Registration Marks */
        .registration-mark {
            position: absolute;
            width: 10mm;
            height: 10mm;
            display: none; /* Only show in print or debug */
        }
        .registration-mark::before, .registration-mark::after {
            content: '';
            position: absolute;
            background: #ccc;
        }
        .mark-h { top: 5mm; left: 0; width: 100%; height: 0.1mm; }
        .mark-v { top: 0; left: 5mm; width: 0.1mm; height: 100%; }

        .mark-tl { top: 5mm; left: 5mm; }
        .mark-tr { top: 5mm; right: 5mm; }
        .mark-bl { bottom: 5mm; left: 5mm; }
        .mark-br { bottom: 5mm; right: 5mm; }

        .card {
            width: 60mm;
            height: 85mm;
            position: relative;
            border-radius: var(--border-radius);
            overflow: hidden;
            background-color: #fff;
        }

        .card-bg-blur-img {
            width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1;
            object-fit: cover; filter: blur(12px) brightness(1.0); transform: scale(1.1);
        }

        .card-image-img {
            width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 2;
            object-fit: cover;
        }

        .overlay-top {
            position: absolute; top: 0; left: 0; right: 0; height: 100%; z-index: 3;
            box-shadow: inset 0 15mm 20mm -10mm rgba(0,0,0,0.15); pointer-events: none;
        }

        .overlay-bottom {
            position: absolute; bottom: 0; left: 0; right: 0; height: 100%; z-index: 3;
            box-shadow: inset 0 -30mm 40mm -10mm rgba(0,0,0,0.4); pointer-events: none;
        }

        .hex-container {
            position: absolute; z-index: 10; width: 14mm; height: 13mm; 
            background: rgba(0, 0, 0, 0.2); backdrop-filter: blur(2px);
            border: 0.3mm solid rgba(255,255,255,0.3); 
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            display: flex; align-items: center; justify-content: center;
        }

        .stat-hex {
            width: 100%; height: 100%; display: flex; flex-direction: column;
            align-items: center; justify-content: center; color: #fff;
        }

        .stat-value {
            font-family: 'Cinzel', serif; font-weight: 900; font-size: 3.2mm; 
            line-height: 1; text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        }

        .stat-label {
            font-size: 1.3mm; color: #ddd;
            margin-top: 0.5mm; transform: scaleX(0.75); white-space: nowrap;
        }

        .pos-tr { top: 1mm; right: 1mm; }
        .pos-tl { top: 1mm; left: 1mm; }
        .pos-br { bottom: 1.5mm; right: 1mm; }
        .pos-bl { bottom: 1.5mm; left: 1mm; }

        .name-container {
            position: absolute; bottom: 2mm; left: 16mm; right: 16mm;
            text-align: center; z-index: 10;
        }

        .card-name {
            font-family: 'Cinzel', serif; font-size: 3.8mm; color: var(--gold);
            text-transform: uppercase; margin: 0; text-shadow: 0 1px 2px #000;
            letter-spacing: 0.3mm;
        }

        .card-desc {
            font-size: 1.8mm; color: #ddd; margin-top: 0.5mm; font-style: italic;
            text-shadow: 1px 1px 1px #000; line-height: 1.1;
        }

        .id-badge {
            position: absolute; top: 1.5mm; left: 50%; transform: translateX(-50%);
            width: 7.5mm; height: 7.5mm; background: #000; border: 0.5mm solid var(--gold);
            border-radius: 50%; color: var(--gold); display: flex; justify-content: center;
            align-items: center; font-family: 'Cinzel', serif; font-weight: 900;
            font-size: 3.5mm; z-index: 15;
            box-shadow: 0 0 5px rgba(0,0,0,0.5);
        }
    </style>
</head>
<body>
    <div class="main-container">
`;

// Prepare Sorted Data
const sortedData = [];
KVARTETA.forEach(k => {
    k.dragons.forEach(dragonName => {
        const dragon = data.find(d => {
            const excelName = d['Název mláděte'];
            return excelName && (
                excelName.normalize('NFC') === dragonName.normalize('NFC') ||
                removeAccents(excelName.toLowerCase()) === removeAccents(dragonName.toLowerCase())
            );
        });
        if (dragon) {
            sortedData.push({
                ...dragon,
                kvartetaInfo: getKvartetaInfo(dragonName)
            });
        }
    });
});

// Generate Pages
const cardsPerPage = 9;
for (let i = 0; i < sortedData.length; i += cardsPerPage) {
    htmlContent += `
    <div class="page-grid">
        <!-- Registration Marks -->
        <div class="registration-mark mark-tl"><div class="mark-h"></div><div class="mark-v"></div></div>
        <div class="registration-mark mark-tr"><div class="mark-h"></div><div class="mark-v"></div></div>
        <div class="registration-mark mark-bl"><div class="mark-h"></div><div class="mark-v"></div></div>
        <div class="registration-mark mark-br"><div class="mark-h"></div><div class="mark-v"></div></div>
    `;
    const batch = sortedData.slice(i, i + cardsPerPage);
    batch.forEach(dragonObj => {
        htmlContent += getCardHTML(dragonObj, dragonObj.kvartetaInfo);
    });
    // Ensure 3x3 layout by adding empty invisible spots
    const remaining = cardsPerPage - batch.length;
    for (let j = 0; j < remaining; j++) {
        htmlContent += `<div class="card" style="visibility: hidden;"></div>`;
    }
    htmlContent += '</div>';
}

htmlContent += '</div></body></html>';

fs.writeFileSync(OUTPUT_FILE, htmlContent);
console.log(`Generated ${sortedData.length} cards to ${OUTPUT_FILE}`);
