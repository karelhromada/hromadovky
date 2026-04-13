import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const ROOT_DIR = path.resolve(__dirname, '../../');
const ESHOP_PUBLIC = path.join(ROOT_DIR, 'kvarteta-eshop/public');
const PRODUCTS_FILE = path.join(ROOT_DIR, 'kvarteta-eshop/src/data/products.ts');
const OUTPUT_DIR = path.join(ROOT_DIR, 'tisk-karet-deploy');
const OUTPUT_JSON = path.join(OUTPUT_DIR, 'products_data.json');

console.log('--- Synchronizace sad karet ---');

if (!fs.existsSync(PRODUCTS_FILE)) {
    console.error(`Chyba: Soubor ${PRODUCTS_FILE} neexistuje.`);
    process.exit(1);
}

const content = fs.readFileSync(PRODUCTS_FILE, 'utf8');

/**
 * Jednoduchý parser pro extrakci polí z TS souboru bez nutnosti kompilace.
 */
function extractArray(name, source) {
    const regex = new RegExp(`export const ${name} = \\s*\\[([\\s\\S]*?)\\s*\\];`, 'm');
    const match = source.match(regex);
    if (!match) return [];

    let arrayContent = match[1];
    arrayContent = arrayContent.replace(/\/\/.*$/gm, '');
    
    let jsonStr = arrayContent
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
        .replace(/'/g, '"')
        .replace(/,\s*(?=[\]}])/g, '');
        
    jsonStr = jsonStr.replace(/"icon":\s*[a-zA-Z0-9_]+/g, '"icon": null');
    jsonStr = jsonStr.replace(/"color":\s*#[a-zA-Z0-9]+/g, '"color": null');

    try {
        return JSON.parse(`[${jsonStr}]`);
    } catch (e) {
        console.warn(`Varování při parsování pole ${name}:`, e.message);
        return [];
    }
}

const kartyProducts = extractArray('kartyProducts', content);
const kvartetaProducts = extractArray('kvartetaProducts', content);

console.log(`Nalezeno ${kartyProducts.length} herních sad.`);
console.log(`Nalezeno ${kvartetaProducts.length} kvartet.`);

// Příprava dat pro konfigurátor
const sharedData = {
    updated: new Date().toISOString(),
    sets: {}
};

/**
 * Hledá složku 'finalni_karty' v kořenových adresářích projektů.
 */
function findFinalFolder(productId) {
    const setFolderName = productId.replace('kvarteto-', '').replace('karty-tema-', '').replace(/-/g, '_');
    
    // Explicitní mapování pro případy, kdy ID neodpovídá názvu složky
    const explicitMappings = {
        'dracci': 'baby_dracci',
        'draku': 'epicka_draci_edice'
    };

    const mappedName = explicitMappings[setFolderName] || setFolderName;
    const possibleNames = [mappedName, setFolderName, setFolderName.replace(/_/g, '-'), productId];
    const masterRoots = ['kvarteta', 'hraci_karty', 'pexeso'];
    const finalFolderNames = ['finalni_karty', 'finální_karty', 'finální karty', 'finalni karty'];

    for (const root of masterRoots) {
        for (const name of possibleNames) {
            const setPath = path.join(ROOT_DIR, root, name);
            if (fs.existsSync(setPath)) {
                for (const finalDir of finalFolderNames) {
                    const finalPath = path.join(setPath, finalDir);
                    if (fs.existsSync(finalPath)) {
                        return { root, name, finalDir, fullPath: finalPath };
                    }
                }
            }
        }
    }
    return null;
}

function processSet(p, type) {
    let printKey;
    let config;

    if (type === 'playing_cards') {
        printKey = p.id.replace('karty-tema-', 'hraci_').replace(/-/g, '_');
        config = { w: 62, h: 88, radius: 4, cols: 3, rows: 3, marginL: 9, marginT: 14, gapX: 65, gapY: 91 };
    } else {
        printKey = p.id.replace('kvarteto-', '').replace(/-/g, '_');
        config = { w: 60, h: 85, radius: 4, cols: 3, rows: 3, marginL: 10, marginT: 15, gapX: 63, gapY: 88 };
    }

    let cardImages = [];
    const finalFolder = findFinalFolder(p.id);

    // Prefer explicitly mapped e-shop allCards over the raw folder, as the web contains the optimized truth
    if (finalFolder && (!p.allCards || p.allCards.length === 0)) {
        console.log(`  - Nalezena složka s finálními kartami pro ${p.id}: ${finalFolder.fullPath}`);
        let files = fs.readdirSync(finalFolder.fullPath).filter(f => f.endsWith('.webp') || f.endsWith('.png'));
        
        // Pokud máme od stejné karty .webp i .png, preferujeme .webp
        const webpFiles = files.filter(f => f.endsWith('.webp'));
        files = files.filter(f => {
            if (f.endsWith('.png')) {
                const base = f.replace('.png', '');
                if (webpFiles.some(wf => wf.startsWith(base))) return false;
            }
            return true;
        });

        cardImages = files.map(filename => {
            const sourcePath = path.join(finalFolder.fullPath, filename);
            // Cíl v tisk-karet-deploy/cards/[set]/finalni_karty/
            const relativePath = `cards/${finalFolder.name}/${finalFolder.finalDir}/${filename}`;
            const targetPath = path.join(OUTPUT_DIR, relativePath);

            const targetDir = path.dirname(targetPath);
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
            
            // Kopírujeme
            fs.copyFileSync(sourcePath, targetPath);
            
            return `./${relativePath}`;
        });
    } else {
        // Fallback na e-shop assets (původní chování)
        if (p.allCards && p.allCards.length > 0) {
            console.log(`  - Používám definované allCards z e-shopu pro ${p.id}`);
        } else {
            console.log(`  - Používám fallback obrázky z e-shopu pro ${p.id}`);
        }
        cardImages = (p.allCards || p.image || []).map(c => {
            const relativePath = c.startsWith('/') ? c.substring(1) : c;
            const sourcePath = path.join(ESHOP_PUBLIC, relativePath);
            const targetPath = path.join(OUTPUT_DIR, relativePath);
            
            if (fs.existsSync(sourcePath)) {
                const targetDir = path.dirname(targetPath);
                if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
                fs.copyFileSync(sourcePath, targetPath);
            }
            return `./${relativePath}`;
        });
    }

    sharedData.sets[printKey] = {
        name: p.name,
        type: type,
        ...config,
        zoom: 100,
        cards: cardImages
    };
}

kartyProducts.forEach(p => processSet(p, 'playing_cards'));
kvartetaProducts.forEach(p => processSet(p, 'quartet'));

// Zápis JSONu
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

fs.writeFileSync(OUTPUT_JSON, JSON.stringify(sharedData, null, 2));

console.log(`\nData byla úspěšně uložena do: ${OUTPUT_JSON}`);
console.log('Synchronizace hotova.');

