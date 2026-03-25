const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_FILE = path.join(__dirname, 'all_dinosaurs.html');
const IMAGES_DIR = 'Obrázky dinosaurů';
const EXCEL_FILE = path.join(__dirname, '..', 'Dinosauři.xlsx');

// Read Excel
if (!fs.existsSync(EXCEL_FILE)) {
    console.error(`Excel file not found: ${EXCEL_FILE}`);
    process.exit(1);
}

const workbook = XLSX.readFile(EXCEL_FILE);
const sheetName = workbook.SheetNames[0];
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

// 1. Defining Definition of Sets (Themes) - Skill Section 2
const THEMES = {
    PREDATORS: { name: 'PREDÁTOŘI', gold: '#ff4444', goldDark: '#880000' },
    GIANTS: { name: 'OBŘI', gold: '#77dd77', goldDark: '#226622' },
    ARMORED: { name: 'OBRNĚNÍ', gold: '#cccccc', goldDark: '#666666' },
    RAPTORS: { name: 'DRAVCI', gold: '#ff9800', goldDark: '#e65100' },
    EXOTIC: { name: 'EXOTIČTÍ', gold: '#d8b0ff', goldDark: '#6633aa' },
    FLYERS: { name: 'LETCI', gold: '#aaddff', goldDark: '#4488bb' },
    MARINE: { name: 'MOŘŠTÍ', gold: '#00ccff', goldDark: '#004488' },
    HERBIVORES: { name: 'BYLOŽRAVCI', gold: '#b07d4b', goldDark: '#5d3a1a' }
};

// Explicit Mapping based on Excel "Skupina" column
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

function getKvartetaInfo(row) {
    const groupRaw = row['Skupina'] || '';
    if (!groupRaw || groupRaw.length < 2) return null;

    const letter = groupRaw[0].toUpperCase(); // A-H
    const number = groupRaw[1]; // 1-4

    const theme = KVARTETA_MAP[letter] || { name: 'NEZNÁMÉ', ...DEFAULT_THEME };
    const groupNum = letter.charCodeAt(0) - 64;
    const subLetter = String.fromCharCode(64 + parseInt(number));

    return {
        id: `${groupNum}${subLetter}`,
        theme: theme,
        groupName: theme.name
    };
}

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const dinoSubtitles = require('./dino_subtitles.js');

function getCardHTML(dino) {
    const dinoName = dino['Jméno'];
    const info = getKvartetaInfo(dino);
    if (!info) return '';

    const theme = info.theme;

    // Use custom subtitle if available, fallback to Prompt metadata or generic
    let description = dinoSubtitles[dinoName];
    if (!description) {
        description = dino['Název mláděte'] ? dino['Název mláděte'] : 'Pravěký vládce druhohor';
    }

    // Image Handling - Skill Section 3
    let imagePath = '';
    const imagesDirPath = path.join(__dirname, IMAGES_DIR);
    if (fs.existsSync(imagesDirPath)) {
        const dirFiles = fs.readdirSync(imagesDirPath);
        const normSearch = removeAccents(dinoName.toLowerCase()).replace(/-/g, ' ');

        const found = dirFiles.find(f => {
            const normF = removeAccents(f.toLowerCase()).split('.')[0].replace(/-/g, ' ');
            return normF === normSearch || normF.includes(normSearch) || normSearch.includes(normF);
        });

        if (found) {
            imagePath = path.join(IMAGES_DIR, found);
        }
    }

    const imgSrc = imagePath.split(path.sep).map(encodeURIComponent).join('/');

    let nameFontSize = '3.2mm';
    if (dinoName.length > 17) {
        nameFontSize = '2.1mm';
    } else if (dinoName.length > 13) {
        nameFontSize = '2.5mm';
    } else if (dinoName.length > 11) {
        nameFontSize = '2.8mm';
    }

    const cardStyle = `
        --theme-color: ${theme.gold};
        --theme-dark: ${theme.goldDark};
        --name-font-size: ${nameFontSize};
    `;

    return `
    <div class="card" style="${cardStyle}">
        <img src="${imgSrc}" class="card-bg-blur-img" alt="">
        <img src="${imgSrc}" class="card-image-img" alt="${dinoName}">
        <div class="overlay-top"></div>
        <div class="overlay-bottom"></div>
        <div class="id-badge">${info.id}</div>
        
        <!-- Stats in corners (Hexagons) - Skill Section 4 -->
        <div class="hex-container pos-tl"><div class="stat-hex"><div class="stat-value">${dino['Síla']}</div><div class="stat-label">SÍLA</div></div></div>
        <div class="hex-container pos-tr"><div class="stat-hex"><div class="stat-value">${dino['Délka (m)']}</div><div class="stat-label">DÉLKA (m)</div></div></div>
        <div class="hex-container pos-bl"><div class="stat-hex"><div class="stat-value">${dino['Hmotnost (kg)']}</div><div class="stat-label">VÁHA (kg)</div></div></div>
        <div class="hex-container pos-br"><div class="stat-hex"><div class="stat-value">${dino['Rychlost (km/h)']}</div><div class="stat-label">RYCHLOST (km/h)</div></div></div>

        <div class="footer-container">
            <div class="group-name">${info.groupName}</div>
            <h1 class="card-name">${dinoName}</h1>
            <p class="card-desc"><i>${description}</i></p>
        </div>
    </div>
    `;
}

let htmlContent = `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <title>Dinosauři - Kvarteta</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Roboto:ital,wght@0,400;0,700;1,400&display=swap');
        
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        body {
            font-family: 'Roboto', sans-serif;
            background-color: #111;
            margin: 0; padding: 0;
            display: block;
        }

        .main-container {
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        /* 5. Critical Optimization for Print - Skill Section 5 */
        @media print {
            body { background-color: white !important; }
            .main-container { padding: 0 !important; display: block !important; width: 100% !important; height: 100% !important; }
            
            .page-grid { 
                box-shadow: none !important; 
                margin: 0 !important;
                padding: 19mm 13mm !important; /* Fixed padding for manual duplex centering */
                width: 210mm !important; 
                height: 297mm !important;
                display: grid !important;
                grid-template-columns: repeat(3, 60mm) !important;
                gap: 2mm !important;
                page-break-after: always !important;
                background: white !important;
                position: relative !important;
                align-content: start !important;
            }
            .page-grid:last-of-type { page-break-after: avoid !important; }
            @page { size: A4 portrait; margin: 0; }
            
            /* Skill Rule: NO FILTERS, NO SHADOWS for print reliability */
            .card { break-inside: avoid !important; box-shadow: none !important; border: 0.1mm solid #eee; }
            .card-bg-blur-img { display: none !important; filter: none !important; }
            .card-image-img { filter: none !important; }
            .overlay-top { box-shadow: inset 0 10mm 15mm -10mm rgba(0,0,0,0.05) !important; background: none !important; }
            .overlay-bottom { box-shadow: inset 0 -20mm 30mm -10mm rgba(0,0,0,0.2) !important; background: none !important; }
            .hex-container { backdrop-filter: none !important; background: rgba(0, 0, 0, 0.2) !important; border: 0.1mm solid rgba(255,255,255,0.3) !important; }
            .stat-value, .stat-label, .card-name, .card-desc, .id-badge { text-shadow: none !important; }
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
            box-shadow: 0 0 40px rgba(0,0,0,0.8);
            page-break-after: always;
            justify-content: center;
            align-content: center;
            position: relative;
        }

        /* Registration Marks */
        .registration-mark {
            position: absolute; width: 10mm; height: 10mm; display: none; z-index: 100;
        }
        .registration-mark::before, .registration-mark::after { content: ''; position: absolute; background: #aaa; }
        .mark-h { top: 5mm; left: 0; width: 100%; height: 0.2mm; }
        .mark-v { top: 0; left: 5mm; width: 0.2mm; height: 100%; }
        .mark-tl { top: 5mm; left: 5mm; }
        .mark-tr { top: 5mm; right: 5mm; }
        .mark-bl { bottom: 5mm; left: 5mm; }
        .mark-br { bottom: 5mm; right: 5mm; }

        .card {
            width: 60mm; height: 85mm; position: relative;
            border-radius: 4mm;
            overflow: hidden; background-color: #fff;
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
            box-shadow: inset 0 15mm 20mm -10mm rgba(0,0,0,0.1); pointer-events: none;
        }

        .overlay-bottom {
            position: absolute; bottom: 0; left: 0; right: 0; height: 100%; z-index: 3;
            box-shadow: inset 0 -30mm 40mm -10mm rgba(0,0,0,0.2); pointer-events: none;
        }

        .hex-container {
            position: absolute; z-index: 10; width: 14mm; height: 13mm; 
            background: rgba(0, 0, 0, 0.2); backdrop-filter: blur(2px);
            border: 0.3mm solid rgba(255,255,255,0.3); 
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            display: flex; align-items: center; justify-content: center;
        }

        .stat-hex { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; }
        .stat-value { font-family: 'Cinzel', serif; font-weight: 900; font-size: 3.2mm; line-height: 1; text-shadow: 0 1px 3px #000; }
        .stat-label { font-size: 1.1mm; color: #ccc; margin-top: 0.4mm; letter-spacing: 0.2mm; }

        .pos-tr { top: 1.5mm; right: 1.5mm; }
        .pos-tl { top: 1.5mm; left: 1.5mm; }
        .pos-br { bottom: 2mm; right: 1.5mm; }
        .pos-bl { bottom: 2mm; left: 1.5mm; }

        .footer-container { position: absolute; bottom: 1.5mm; left: 16mm; right: 16mm; text-align: center; z-index: 10; }
        .group-name { font-size: 1.5mm; color: #fff; letter-spacing: 1.5mm; text-transform: uppercase; margin-bottom: 0.5mm; font-weight: 700; opacity: 0.6; }
        .card-name { font-family: 'Cinzel', serif; font-size: var(--name-font-size, 3.2mm); color: var(--theme-color); margin: 0; text-shadow: 0 2px 4px #000; letter-spacing: 0.1mm; line-height: 1.1; }
        .card-desc { font-size: 1.8mm; color: #ccc; margin-top: 0.5mm; line-height: 1.2; text-shadow: 1px 1px 2px #000; font-weight: 400; }
        .card-desc i { font-style: italic; opacity: 0.8; }

        .id-badge {
            position: absolute; top: 2.2mm; left: 50%; transform: translateX(-50%);
            width: 8mm; height: 8mm; background: #000; border: 0.6mm solid var(--theme-color);
            border-radius: 50%; color: var(--theme-color); display: flex; justify-content: center;
            align-items: center; font-family: 'Cinzel', serif; font-weight: 900;
            font-size: 3.8mm; z-index: 15; box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
    </style>
</head>
<body>
    <div class="main-container">
`;

// Sort and process data
data.sort((a, b) => (a['Skupina'] || '').localeCompare(b['Skupina'] || ''));

const cardsPerPage = 9;
for (let i = 0; i < data.length; i += cardsPerPage) {
    htmlContent += `
    <div class="page-grid">
        <div class="registration-mark mark-tl"><div class="mark-h"></div><div class="mark-v"></div></div>
        <div class="registration-mark mark-tr"><div class="mark-h"></div><div class="mark-v"></div></div>
        <div class="registration-mark mark-bl"><div class="mark-h"></div><div class="mark-v"></div></div>
        <div class="registration-mark mark-br"><div class="mark-h"></div><div class="mark-v"></div></div>
    `;
    const batch = data.slice(i, i + cardsPerPage);
    batch.forEach(dino => {
        htmlContent += getCardHTML(dino);
    });
    // Add empty cards for 3x3 grid symmetry
    const remaining = cardsPerPage - batch.length;
    for (let j = 0; j < remaining; j++) {
        htmlContent += `<div class="card" style="visibility: hidden;"></div>`;
    }
    htmlContent += '</div>';
}

htmlContent += '</div></body></html>';

fs.writeFileSync(OUTPUT_FILE, htmlContent);
console.log(`Successfully generated ${data.length} Dinosaurs to ${OUTPUT_FILE} (Skill Compliant)`);
