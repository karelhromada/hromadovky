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
        filter: f => f.match(/_oznaceno\.png$/),
        sort: (a, b) => {
            const order = ['srdce', 'listy', 'kule', 'zaludy'];
            const valOrder = ['sedmicka', 'osmicka', 'devitka', 'desitka', 'spodek', 'svrsek', 'svršek', 'kral', 'eso'];
            
            // Odstranění přípony a rozdělení na části
            const pA = a.replace('_oznaceno.png', '').split('_');
            const pB = b.replace('_oznaceno.png', '').split('_');
            
            // Získání hodnoty (první část názvu)
            const valA = pA[0];
            const valB = pB[0];
            
            // Mapování svršek/svrsek na stejný index pro jistotu
            const getValIndex = (val) => {
                const idx = valOrder.indexOf(val);
                if (idx === 6) return 5; // svršek i svrsek jsou na stejné pozici 5
                return idx;
            };

            const valDiff = getValIndex(valA) - getValIndex(valB);
            if (valDiff !== 0) return valDiff;
            
            // Získání barvy (druhá část názvu)
            const suitA = pA[1];
            const suitB = pB[1];
            return order.indexOf(suitA) - order.indexOf(suitB);
        },
        size: HRACI_KARTY_SIZE,
        subfolder: 'hraci_karty',
    },
    {
        name: 'Hrací karty – Minecraft',
        slug: 'hraci_karty_minecraft',
        folder: 'hraci_karty/Minecraft prší/Karty finále',
        filter: f => /^karta_.*\.png$/.test(f),
        sort: (a, b) => {
            const suitOrder = ['Srdce', 'Zelene', 'Piky', 'Listy', 'Kule', 'Žaludy', 'Zaludy'];
            const valOrder = ['7', '8', '9', '10', 'Spodek', 'Svršek', 'Svrsek', 'Král', 'Kral', 'Eso'];
            const normSuit = s => {
                const i = suitOrder.indexOf(s);
                if (i === 3) return 2; // Listy == Piky
                if (i === 6) return 5; // Zaludy == Žaludy
                return i;
            };
            const normVal = v => {
                const i = valOrder.indexOf(v);
                if (i === 6) return 5; // Svrsek == Svršek
                if (i === 8) return 7; // Kral == Král
                return i;
            };
            const parts = name => {
                const core = name.replace(/^karta_/, '').replace(/-\d+\.png$/, '').replace(/\.png$/, '');
                const [suit, val] = core.split('_');
                return { suit, val };
            };
            const pa = parts(a);
            const pb = parts(b);
            const suitDiff = normSuit(pa.suit) - normSuit(pb.suit);
            if (suitDiff !== 0) return suitDiff;
            return normVal(pa.val) - normVal(pb.val);
        },
        size: HRACI_KARTY_SIZE,
        subfolder: 'hraci_karty',
    },
    // (Backside archy pro Minecraft + vsechny ostatni backy se generuji dynamicky
    //  ze zadni_strany/karty/manifest.json a pexeso/manifest.json – viz konec souboru.)
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
    // Pro backside archy: opakovat jeden obrázek N× (typicky 9× pro 3×3)
    if (product.repeat && cardFiles.length === 1) {
        allCards = Array(product.repeat).fill(cardFiles[0]);
    }
    
    // Relativní cesta z místa šablony k obrázkům.
    // Default: obrázky jsou v podsložce ./finalni_karty. Lze přepsat přes product.relPath.
    const relPath = product.relPath || './finalni_karty';
    
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

    // Výstup: buď přepsáno přes product.outDir, jinak produktová složka (o úroveň výš než finalni_karty)
    const outDir = product.outDir
        ? path.join(BASE, product.outDir)
        : path.dirname(path.join(BASE, product.folder));
    fs.mkdirSync(outDir, { recursive: true });

    const outFile = path.join(outDir, `tiskovy_arch_${product.slug}.html`);
    fs.writeFileSync(outFile, html, 'utf8');

    const relOut = path.relative(BASE, outFile);
    console.log(`✅ ${product.name}: ${files.length} karet → ${relOut}`);
    total++;
}

// ════════════════════════════════════════════════════════════════════════
// BACKSIDE ARCHY – generované z manifestu
// ════════════════════════════════════════════════════════════════════════
//
// Pro každou zadní stranu v zadni_strany/karty/manifest.json vygenerujeme
// dva archy (62×88 pro hrací karty, 60×85 pro kvarteta). Pro pexeso jeden
// arch 60×60 (3×4 = 12 karet na stránce).
//
// Výstup: zadni_strany/archy/karty/tiskovy_arch_<id>_<hraci|kvarteto>.html
//         zadni_strany/archy/pexeso/tiskovy_arch_<id>_pexeso.html

function generateBacksideSheets() {
    const kartyManifestPath = path.join(BASE, 'zadni_strany/karty/manifest.json');
    const pexesoManifestPath = path.join(BASE, 'zadni_strany/pexeso/manifest.json');

    let count = 0;

    if (fs.existsSync(kartyManifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(kartyManifestPath, 'utf8'));
        const variants = [
            { suffix: 'hraci',    size: HRACI_KARTY_SIZE, repeat: 9  },
            { suffix: 'kvarteto', size: KVARTETA_SIZE,    repeat: 9  },
        ];
        for (const back of manifest.backs) {
            for (const { suffix, size, repeat } of variants) {
                const virtualProduct = {
                    name: `Zadní strana – ${back.name} (${suffix})`,
                    slug: `zadni_strana_${back.id}_${suffix}`,
                    size,
                    repeat,
                    relPath: '../../karty/webp',
                    outDir: 'zadni_strany/archy/karty',
                };
                const html = generatePrintHTML(virtualProduct, [path.basename(back.file)]);
                const outDir = path.join(BASE, virtualProduct.outDir);
                fs.mkdirSync(outDir, { recursive: true });
                const outFile = path.join(outDir, `tiskovy_arch_${virtualProduct.slug}.html`);
                fs.writeFileSync(outFile, html, 'utf8');
                count++;
            }
        }
        console.log(`✅ Backside karty: ${manifest.backs.length} × 2 velikosti = ${manifest.backs.length * 2} archů → zadni_strany/archy/karty/`);
    } else {
        console.log('⚠️  zadni_strany/karty/manifest.json nenalezen – přeskakuji backside archy pro karty.');
    }

    if (fs.existsSync(pexesoManifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(pexesoManifestPath, 'utf8'));
        for (const back of manifest.backs) {
            const virtualProduct = {
                name: `Zadní strana – ${back.name} (pexeso)`,
                slug: `zadni_strana_${back.id}_pexeso`,
                size: PEXESO_SIZE,
                // 3×4 = 12, ale isPexeso=true v generatePrintHTML by zdvojilo array -> pouzijeme repeat
                repeat: PEXESO_SIZE.cols * PEXESO_SIZE.rows,
                relPath: '../../pexeso/webp',
                outDir: 'zadni_strany/archy/pexeso',
            };
            const html = generatePrintHTML(virtualProduct, [path.basename(back.file)]);
            const outDir = path.join(BASE, virtualProduct.outDir);
            fs.mkdirSync(outDir, { recursive: true });
            const outFile = path.join(outDir, `tiskovy_arch_${virtualProduct.slug}.html`);
            fs.writeFileSync(outFile, html, 'utf8');
            count++;
        }
        console.log(`✅ Backside pexeso: ${manifest.backs.length} archů → zadni_strany/archy/pexeso/`);
    } else {
        console.log('⚠️  zadni_strany/pexeso/manifest.json nenalezen – přeskakuji backside archy pro pexeso.');
    }

    return count;
}

const backsideCount = generateBacksideSheets();

console.log(`\n🎉 Vygenerováno ${total + backsideCount} tiskových šablon (${total} produkty + ${backsideCount} zadních stran).`);
