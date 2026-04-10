import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicCardsDir = path.resolve(__dirname, 'public/cards');

const targetFolders = [
    'mytologie_v4',
    'rytiri_v3',
    'epicka-draci-edice',
    'carodejnice',
    'zivot-na-zamku',
    'minecraft-prsi',
    'backs',
    '.'
];

async function optimizeFolder(folderName) {
    const folderPath = path.join(publicCardsDir, folderName);
    
    if (!fs.existsSync(folderPath)) {
        console.warn(`Folder not found: ${folderPath}`);
        return;
    }

    const files = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.png'));
    console.log(`Optimizing ${files.length} images in ${folderName}...`);

    for (const file of files) {
        const inputPath = path.join(folderPath, file);
        const outputPath = path.join(folderPath, file.replace(/\.png$/i, '.webp'));

        // Skip if webp already exists and is newer (optional)
        // if (fs.existsSync(outputPath)) continue;

        try {
            await sharp(inputPath)
                .resize({ height: 600 }) // Sufficient for web catalog
                .webp({ quality: 85 })
                .toFile(outputPath);
            process.stdout.write('.');
        } catch (err) {
            console.error(`\nError processing ${file}:`, err);
        }
    }
    console.log(`\nFinished ${folderName}`);
}

async function run() {
    console.log('Starting WebP optimization for all PNG sets...');
    for (const folder of targetFolders) {
        await optimizeFolder(folder);
    }
    console.log('All optimizations complete!');
}

run();
