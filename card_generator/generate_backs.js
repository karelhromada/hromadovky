const fs = require('fs');
const path = require('path');

const VERSIONS = [
    { id: 'v1_metallic', file: 'dragon_scales_metallic.png', title: 'Kvarteta - Zadní strana (Metalická)' },
    { id: 'v2_vibrant', file: 'dragon_scales_vibrant.png', title: 'Kvarteta - Zadní strana (Veselá)' },
    { id: 'v3_emerald', file: 'dragon_scales_realistic_1.png', title: 'Kvarteta - Zadní strana (Smaragdová)' },
    { id: 'v4_rugged', file: 'dragon_scales_realistic_2.png', title: 'Kvarteta - Zadní strana (Zkamenělá)' }
];

function generateBack(version) {
    const OUTPUT_FILE = path.join(__dirname, `card_back_${version.id}.html`);
    const PATTERN_FILE = version.file;

    const htmlContent = `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <title>${version.title}</title>
    <style>
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        body {
            background-color: #333;
            margin: 0;
            padding: 0;
            display: block;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
                /* Centering logic */
                padding-left: 13mm !important;
                padding-right: 13mm !important;
                padding-top: 19mm !important;
                padding-bottom: 19mm !important;
                align-content: start !important;
            }
            .page-grid:last-of-type {
                page-break-after: avoid !important;
            }
            @page { size: A4 portrait; margin: 0; }
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
            background: white; /* Fallback */
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            page-break-after: always;
            justify-content: center;
            align-content: center;
            position: relative;
            overflow: hidden; /* Important for full-page images */
        }

        .background-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 210mm;
            height: 297mm;
            display: flex;
            flex-wrap: wrap;
            z-index: 0;
            pointer-events: none;
        }

        .background-layer img {
            width: 30mm;
            height: 30mm;
            display: block;
            object-fit: cover;
        }

        .card-container {
            width: 60mm;
            height: 85mm;
            position: relative;
            z-index: 10; /* Above background */
            /* Outline to help during cutting if marks are not enough */
            border: 0.1mm solid rgba(255,255,255,0.05);
        }

        .registration-mark {
            position: absolute;
            width: 10mm;
            height: 10mm;
            display: none;
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
    </style>
</head>
<body>
    <div class="main-container">
        ${Array(1).fill(0).map(() => `
        <div class="page-grid">
            <!-- Bulletproof Background Grid (7x10 images for A4) -->
            <div class="background-layer">
                ${Array(70).fill(`<img src="${PATTERN_FILE}" alt="">`).join('')}
            </div>

            <!-- Registration Marks -->
            <div class="registration-mark mark-tl" style="z-index: 20;"><div class="mark-h"></div><div class="mark-v"></div></div>
            <div class="registration-mark mark-tr" style="z-index: 20;"><div class="mark-h"></div><div class="mark-v"></div></div>
            <div class="registration-mark mark-bl" style="z-index: 20;"><div class="mark-h"></div><div class="mark-v"></div></div>
            <div class="registration-mark mark-br" style="z-index: 20;"><div class="mark-h"></div><div class="mark-v"></div></div>

            ${Array(9).fill('<div class="card-container"></div>').join('\n            ')}
        </div>
        `).join('')}
    </div>
</body>
</html>
    `;

    fs.writeFileSync(OUTPUT_FILE, htmlContent);
    console.log(`Generated: ${OUTPUT_FILE}`);
}

VERSIONS.forEach(generateBack);
