const fs = require('fs');
const path = require('path');

const variants = [
    { name: 'steel', file: 'knight_back_iron_steel.png', title: 'Ocelový plát' },
    { name: 'copper', file: 'knight_back_copper.png', title: 'Měděný plát' },
    { name: 'gold', file: 'knight_back_gold.png', title: 'Zlatý plát' },
    { name: 'cute', file: 'knight_back_cute.png', title: 'Roztomilá hvězdná obloha' }
];

function generateMarks() {
    const xPositions = [13, 73, 75, 135, 137, 197];
    const yPositions = [19, 104, 106, 191, 193, 278];
    let marksHtml = '';

    yPositions.forEach(y => {
        xPositions.forEach(x => {
            marksHtml += `<div class="mark" style="left: ${x - 5}mm; top: ${y - 5}mm;"></div>\n`;
        });
    });

    return marksHtml;
}

variants.forEach(variant => {
    const OUTPUT_FILE = path.join(__dirname, `all_knight_backs_${variant.name}.html`);
    const PROTECTED_BACK_FILE = variant.file;
    // Keep a subtle darkening for metal variants to make them look premium, but let Cute stay bright.
    const filterStyle = variant.name !== 'cute' ? 'filter: brightness(0.7) contrast(1.1);' : '';
    const marks = generateMarks();

    const htmlContent = `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <title>Roztomilí rytíři - Zadní strana (${variant.title})</title>
    <style>
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        
        @page { size: A4 portrait; margin: 0; }
        
        body { 
            background-color: #111; 
            margin: 0; 
            padding: 0; 
        }

        .main-container { 
            display: flex; 
            flex-direction: column; 
            align-items: center;
            padding: 20px 0;
        }

        @media print {
            body { background-color: transparent !important; }
            .main-container { padding: 0 !important; display: block !important; width: 100% !important; }
            .page-grid { margin: 0 !important; box-shadow: none !important; }
        }

        .page-grid {
            width: 210mm; 
            height: 297mm; 
            margin-bottom: 20mm;
            background: #000; 
            position: relative;
            overflow: hidden; 
            box-shadow: 0 0 30px rgba(0,0,0,0.7);
            page-break-after: always;
        }

        .background-layer {
            position: absolute; 
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }

        /* Image rotation and 100% stretching to cover every pixel */
        .background-image {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 297mm; /* Swapped for 90deg rotation */
            height: 210mm; /* Swapped for 90deg rotation */
            transform: translate(-50%, -50%) rotate(90deg);
            background-image: url('${PROTECTED_BACK_FILE}');
            background-size: 100% 100%;
            background-repeat: no-repeat;
            ${filterStyle}
        }

        .marks-layer { 
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            z-index: 10; 
            pointer-events: none; 
        }

        .mark { 
            position: absolute; 
            width: 10mm; 
            height: 10mm; 
        }

        .mark::before, .mark::after { 
            content: ''; 
            position: absolute; 
            background: #000; 
        }

        /* Thin crosses (0.1mm) */
        .mark::before { 
            top: 5mm; 
            left: 0; 
            width: 100%; 
            height: 0.1mm; 
        }
        
        .mark::after { 
            left: 5mm; 
            top: 0; 
            width: 0.1mm; 
            height: 100%; 
        }
    </style>
</head>
<body>
    <div class="main-container">
        ${Array(4).fill(0).map(() => `
        <div class="page-grid">
            <div class="background-layer">
                <div class="background-image"></div>
            </div>
            <div class="marks-layer">${marks}</div>
        </div>
        `).join('')}
    </div>
</body>
</html>`;

    fs.writeFileSync(OUTPUT_FILE, htmlContent);
    console.log(`Updated Full-Page Variant: ${variant.name} -> ${OUTPUT_FILE}`);
});
