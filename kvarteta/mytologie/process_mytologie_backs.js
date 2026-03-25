const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const variants = [
    { id: '1_emblem', path: '/Users/air2024/.gemini/antigravity/brain/09522950-3e2f-47a1-a3d1-cf35f4123a79/mytologie_back_emblem_raw_hq_1773430649087.png' },
    { id: '2_runes', path: '/Users/air2024/.gemini/antigravity/brain/09522950-3e2f-47a1-a3d1-cf35f4123a79/mytologie_back_runes_raw_hq_1773430665935.png' },
    { id: '3_gateway', path: '/Users/air2024/.gemini/antigravity/brain/09522950-3e2f-47a1-a3d1-cf35f4123a79/mytologie_back_gateway_raw_hq_1773430681050.png' }
];

async function processBacks() {
    console.log(`Začínám zpracovávat zadní strany: NÁVRAT K ČISTÉMU FULL-BLEED DESIGNU (bez rámečku)...`);
    
    const outDir = path.resolve(__dirname, '../kvarteta-eshop/public/cards/mytologie');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    for (const v of variants) {
        console.log(`Zpracovávám čistý ořez: ${v.id}`);
        const outPath = path.join(outDir, `mytologie_back_${v.id}.png`);

        await sharp(v.path)
            .resize(678, 921, {
                fit: 'cover',
                position: 'center'
            })
            .png()
            .toFile(outPath);
        
        const localPath = path.join(__dirname, `mytologie_back_${v.id}.png`);
        fs.copyFileSync(outPath, localPath);
    }

    console.log('✅ Zadní strany jsou hotové – bez rámečku, čistý full-bleed ořez.');
}

processBacks().catch(console.error);
