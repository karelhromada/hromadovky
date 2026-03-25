#!/usr/bin/env node
/**
 * Generátor tiskových archů pro VŠECHNY produkty.
 * Každá šablona čerpá z finalni_karty/ příslušného adresáře.
 * Optimalizováno pro tisk s matnou laminací.
 * 
 * Spuštění: node tiskove_archy/generate_all_print_sheets.js
 */

const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..');

// ════════════════════════════════════════════════════════════════════════
// KONFIGURACE PRODUKTŮ
// ════════════════════════════════════════════════════════════════════════

const KVARTETA_SIZE = { w: '60mm', h: '85mm', cols: 3, rows: 3, radius: '4mm' };
const HRACI_KARTY_SIZE = { w: '62mm', h: '88mm', cols: 3, rows: 3, radius: '4mm' };
const PEXESO_SIZE = { w: '60mm', h: '60mm', cols: 3, rows: 4, radius: '3mm' };

const products = [
    // ── KVARTETA ──
    {
        name: 'Kvarteto draků',
        slug: 'kvarteta_draci',
        folder: 'kvarteta/draci/finalni_karty',
        filter: f => f.match(/^drag_full_\d+\.webp$/),
        sort: (a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]),
        size: KVARTETA_SIZE,
        subfolder: 'kvarteta',
    },
    {
        name: 'Kvarteto dinosaurů',
        slug: 'kvarteta_dinosauri',
        folder: 'kvarteta/dinosauri/finalni_karty',
        filter: f => f.match(/^dino_full_\d+\.webp$/),
        sort: (a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]),
        size: KVARTETA_SIZE,
        subfolder: 'kvarteta',
    },
    {
        name: 'Kvarteto baby dráčků',
        slug: 'kvarteta_baby_dracci',
        folder: 'kvarteta/baby_dracci/finalni_karty',
        filter: f => f.match(/^baby_full_\d+\.webp$/),
        sort: (a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]),
        size: KVARTETA_SIZE,
        subfolder: 'kvarteta',
    },
    {
        name: 'Kvarteto koček',
        slug: 'kvarteta_kocky',
        folder: 'kvarteta/kocky/finalni_karty',
        filter: f => f.match(/^cat_full_\d+\.webp$/),
        sort: (a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]),
        size: KVARTETA_SIZE,
        subfolder: 'kvarteta',
    },
    {
        name: 'Kvarteto rytířů',
        slug: 'kvarteta_rytiri',
        folder: 'kvarteta/rytiri/finalni_karty',
        filter: f => f.match(/_karta_v3\.png$/),
        sort: (a, b) => a.localeCompare(b, 'cs'),
        size: KVARTETA_SIZE,
        subfolder: 'kvarteta',
    },
    {
        name: 'Kvarteto mytologie',
        slug: 'kvarteta_mytologie',
        folder: 'kvarteta/mytologie/finalni_karty',
        filter: f => f.match(/_v4_.*\.png$/),
        sort: (a, b) => a.localeCompare(b, 'cs'),
        size: KVARTETA_SIZE,
        subfolder: 'kvarteta',
    },
    // ── HRACÍ KARTY ──
    {
        name: 'Hrací karty – epická dračí edice',
        slug: 'hraci_karty_epicka_draci',
        folder: 'hraci_karty/epicka_draci_edice/finalni_karty',
        filter: f => f.match(/^prsi_.*\.webp$/),
        sort: (a, b) => {
            const order = ['srdce', 'listy', 'kule', 'zaludy'];
            const valOrder = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            const pA = a.replace('prsi_', '').replace('.webp', '').split('_');
            const pB = b.replace('prsi_', '').replace('.webp', '').split('_');
            const suitDiff = order.indexOf(pA[0]) - order.indexOf(pB[0]);
            if (suitDiff !== 0) return suitDiff;
            return valOrder.indexOf(pA[1]) - valOrder.indexOf(pB[1]);
        },
        size: HRACI_KARTY_SIZE,
        subfolder: 'hraci_karty',
    },
    {
        name: 'Hrací karty – princezny',
        slug: 'hraci_karty_princezny',
        folder: 'hraci_karty/princezny/finalni_karty',
        filter: f => f.match(/\.png$/),
        sort: (a, b) => a.localeCompare(b, 'cs'),
        size: HRACI_KARTY_SIZE,
        subfolder: 'hraci_karty',
    },
    {
        name: 'Hrací karty – čarodějnice',
        slug: 'hraci_karty_carodejnice',
        folder: 'hraci_karty/carodejnice/finalni_karty',
        filter: f => f.match(/^witch_.*\.png$/),
        sort: (a, b) => a.localeCompare(b, 'cs'),
        size: HRACI_KARTY_SIZE,
        subfolder: 'hraci_karty',
    },
    // ── PEXESA ──
    {
        name: 'Pexeso – draci',
        slug: 'pexeso_draci',
        folder: 'pexeso/draci/finalni_karty',
        filter: f => f.match(/^pexeso_drag_\d+\.webp$/),
        sort: (a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]),
        size: PEXESO_SIZE,
        subfolder: 'pexeso',
    },
    {
        name: 'Pexeso – baby dráčci',
        slug: 'pexeso_baby_dracci',
        folder: 'pexeso/baby_dracci/finalni_karty',
        filter: f => f.match(/^pexeso_baby_\d+\.webp$/),
        sort: (a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]),
        size: PEXESO_SIZE,
        subfolder: 'pexeso',
    },
    {
        name: 'Pexeso – kočky',
        slug: 'pexeso_kocky',
        folder: 'pexeso/kocky/finalni_karty',
        filter: f => f.match(/^pexeso_cat_\d+\.webp$/),
        sort: (a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]),
        size: PEXESO_SIZE,
        subfolder: 'pexeso',
    },
    {
        name: 'Pexeso – dinosauři',
        slug: 'pexeso_dinosauri',
        folder: 'pexeso/dinosauri/finalni_karty',
        filter: f => f.match(/^pexeso_dino_\d+\.webp$/),
        sort: (a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]),
        size: PEXESO_SIZE,
        subfolder: 'pexeso',
    },
];

// ════════════════════════════════════════════════════════════════════════
// GENERÁTOR HTML
// ════════════════════════════════════════════════════════════════════════

function generatePrintHTML(product, cardFiles) {
    const { w, h, cols, rows, radius } = product.size;
    const cardsPerPage = cols * rows;
    const isPexeso = product.slug.startsWith('pexeso');
    
    // Vypočítat pozice
    const wMM = parseInt(w);
    const hMM = parseInt(h);
    const gap = 3; // mm mezi kartami
    const totalW = cols * wMM + (cols - 1) * gap;
    const totalH = rows * hMM + (rows - 1) * gap;
    const startX = Math.round((210 - totalW) / 2);
    const startY = Math.round((297 - totalH) / 2);
    
    // Pro pexeso: každý obrázek 2× (pár)
    let allCards = [...cardFiles];
    if (isPexeso) {
        allCards = [...cardFiles, ...cardFiles];
    }
    
    // Relativní cesta z tiskove_archy/subfolder/ k produktové složce
    const relPath = path.relative(
        path.join(BASE, 'tiskove_archy', product.subfolder),
        path.join(BASE, product.folder)
    );
    
    // Rozdělit na stránky
    const pages = [];
    for (let i = 0; i < allCards.length; i += cardsPerPage) {
        pages.push(allCards.slice(i, i + cardsPerPage));
    }
    
    let cardsHTML = '';
    for (const page of pages) {
        cardsHTML += '    <div class="page">\n';
        page.forEach((file, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const x = startX + col * (wMM + gap);
            const y = startY + row * (hMM + gap);
            const imgPath = `${relPath}/${encodeURIComponent(file)}`;
            cardsHTML += `        <div class="card" style="left:${x}mm; top:${y}mm; background-image:url('${imgPath}');"></div>\n`;
        });
        cardsHTML += '    </div>\n';
    }

    return `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <title>${product.name} – tiskový arch</title>
    <style>
        /* ═══ PRINT RESET ═══ */
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { margin: 0; padding: 0; background: #e8e8e8; font-family: system-ui, sans-serif; }
        
        /* ═══ PRINT HEADER (nepotiskne se) ═══ */
        .no-print { text-align: center; padding: 12px 20px; background: #fff; border-bottom: 1px solid #ddd; position: sticky; top: 0; z-index: 100; }
        .no-print h2 { margin: 0 0 4px; font-size: 16px; }
        .no-print p { margin: 0 0 8px; color: #666; font-size: 13px; }
        .btn-print { background: #ca8a04; color: white; border: none; padding: 8px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; }
        .btn-print:hover { background: #a16207; }
        
        /* ═══ A4 STRÁNKA ═══ */
        .page { width: 210mm; height: 297mm; background: #fff; margin: 8mm auto; position: relative; overflow: hidden; page-break-after: always; box-shadow: 0 0 10px rgba(0,0,0,0.15); }
        .page:last-child { page-break-after: avoid; }
        
        /* ═══ KARTA ═══ */
        .card { 
            width: ${w}; height: ${h}; 
            position: absolute; 
            background-color: #000; 
            background-size: cover; 
            background-position: center; 
            border-radius: ${radius}; 
            overflow: hidden; 
        }
        
        /* ═══ LAMINAČNÍ KOMPENZACE ═══ */
        /* Matná laminace ztlumí barvy a kontrast. Tyto filtry to předkompenzují. */
        .card {
            filter: brightness(1.08) contrast(1.06) saturate(1.08);
        }
        
        @media print {
            body { background: none; }
            .page { margin: 0; box-shadow: none; }
            .no-print { display: none; }
            @page { size: A4 portrait; margin: 0; }
            
            /* Silnější kompenzace pro skutečný tisk */
            .card {
                filter: brightness(1.15) contrast(1.10) saturate(1.10);
            }
        }
    </style>
</head>
<body>
    <div class="no-print">
        <h2>${product.name} – tiskový arch</h2>
        <p>Karty: ${w} × ${h} | ${cols}×${rows} na stránku | Celkem ${allCards.length} karet (${pages.length} stran) | Optimalizováno pro matnou laminaci</p>
        <button class="btn-print" onclick="window.print()">Vytisknout karty</button>
    </div>
${cardsHTML}
</body>
</html>`;
}

// ════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════

let total = 0;
for (const product of products) {
    const folderPath = path.join(BASE, product.folder);
    
    if (!fs.existsSync(folderPath)) {
        console.log(`⚠️  Složka nenalezena: ${product.folder} (přeskakuji ${product.name})`);
        continue;
    }
    
    let files = fs.readdirSync(folderPath).filter(product.filter);
    files.sort(product.sort);
    
    if (files.length === 0) {
        console.log(`⚠️  Žádné karty ve: ${product.folder} (přeskakuji ${product.name})`);
        continue;
    }
    
    const html = generatePrintHTML(product, files);
    
    const outDir = path.join(BASE, 'tiskove_archy', product.subfolder);
    fs.mkdirSync(outDir, { recursive: true });
    
    const outFile = path.join(outDir, `tisk_${product.slug}.html`);
    fs.writeFileSync(outFile, html, 'utf8');
    
    const relOut = path.relative(BASE, outFile);
    console.log(`✅ ${product.name}: ${files.length} karet → ${relOut}`);
    total++;
}

console.log(`\n🎉 Vygenerováno ${total} tiskových šablon.`);
