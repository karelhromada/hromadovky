const sharp = require('sharp');
const fs = require('fs');

const inputPath = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e/witch_frame_subtle_1772660806033.png';

const colors = [
    { name: 'srdce', r: 180, g: 30, b: 30 }, // Red
    { name: 'listy', r: 30, g: 150, b: 50 }, // Green
    { name: 'zaludy', r: 200, g: 160, b: 30 }, // Yellow/Gold
    { name: 'kule', r: 120, g: 70, b: 30 }  // Brown
];

async function processImage() {
    try {
        console.log("Reading image...");
        const { data, info } = await sharp(inputPath)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const width = info.width;
        const height = info.height;

        let minX = width, maxX = 0, minY = height, maxY = 0;

        // 1. Zjistit přesný bounding box černého inkoustu (ignorovat tak okolní stíny AI obrázku)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const luma = 0.299 * r + 0.587 * g + 0.114 * b;

                if (luma < 100) { // Detekce pouze hodně tmavých objektů
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        // Pokud se nenašel tmavý inkoust, použijeme default
        if (minX > maxX) { minX = 0; maxX = width; minY = 0; maxY = height; }

        // Mírný okraj pro dýchání rámečku, nesmí jít úplně do kraje oříznutých pixelů
        const pad = 15;
        minX = Math.max(0, minX - pad);
        maxX = Math.min(width - 1, maxX + pad);
        minY = Math.max(0, minY - pad);
        maxY = Math.min(height - 1, maxY + pad);

        const cropWidth = maxX - minX;
        const cropHeight = maxY - minY;

        const croppedBuffer = await sharp(data, { raw: { width, height, channels: 4 } })
            .extract({ left: minX, top: minY, width: cropWidth, height: cropHeight })
            .raw()
            .toBuffer();

        for (const c of colors) {
            const outBuffer = Buffer.from(croppedBuffer);

            for (let y = 0; y < cropHeight; y++) {
                for (let x = 0; x < cropWidth; x++) {
                    const idx = (y * cropWidth + x) * 4;
                    const r = outBuffer[idx];
                    const g = outBuffer[idx + 1];
                    const b = outBuffer[idx + 2];
                    const luma = 0.299 * r + 0.587 * g + 0.114 * b;

                    if (luma > 200) {
                        outBuffer[idx + 3] = 0; // Bílé a světlé části (i šedé stíny) jsou komplet průhledné
                    } else {
                        // Čím tmavší, tím více barvy a plnosti (antialiasing inkoustu)
                        const darkness = Math.max(0, 200 - luma) / 200;
                        outBuffer[idx] = c.r;
                        outBuffer[idx + 1] = c.g;
                        outBuffer[idx + 2] = c.b;
                        outBuffer[idx + 3] = Math.floor(darkness * 255);
                    }
                }
            }

            const outPath = `/tmp/frame_${c.name}.png`;
            await sharp(outBuffer, {
                raw: { width: cropWidth, height: cropHeight, channels: 4 }
            })
                // Výsledný inkoust roztáhneme přesně po hranách karty hracího balíčku
                .resize(709, 1004, { fit: 'fill' })
                .png()
                .toFile(outPath);

            const appPath = `/Users/air2024/Documents/Antigravity projekty/Kvarteta_vyšší bere/kvarteta-eshop/public/cards/witch_frame_${c.name}.png`;
            fs.copyFileSync(outPath, appPath);
        }
        console.log("Done.");
    } catch (err) {
        console.error("Error:", err);
    }
}

processImage();
