const sharp = require('sharp');
const fs = require('fs');

const inputPath = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e/witch_frame_base_1772660003950.png';

const colors = [
    { name: 'srdce', r: 180, g: 30, b: 30 }, // Red
    { name: 'listy', r: 30, g: 150, b: 50 }, // Green
    { name: 'zaludy', r: 200, g: 160, b: 30 }, // Yellow/Gold
    { name: 'kule', r: 120, g: 70, b: 30 }  // Brown
];

async function processImage() {
    try {
        console.log("Reading image...");
        // 1. Resize to target ratio 12:17 (e.g. 709x1004)
        const { data, info } = await sharp(inputPath)
            .resize(709, 1004, { fit: 'fill' })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        // data is a Buffer of raw RGBA pixels
        const width = info.width;
        const height = info.height;

        console.log("Processing pixels for transparency...");
        // Define center region bounds where we expect the content to be hollow
        const paddingX = Math.floor(width * 0.15);
        const paddingY = Math.floor(height * 0.15);

        for (const c of colors) {
            // Create a copy of the buffer for this color
            const outBuffer = Buffer.from(data);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    const r = outBuffer[idx];
                    const g = outBuffer[idx + 1];
                    const b = outBuffer[idx + 2];

                    // Luma (brightness)
                    const luma = 0.299 * r + 0.587 * g + 0.114 * b;

                    // If pixel is very bright (white/cream) and inside the central zone, make it transparent
                    if (luma > 230 && x > paddingX && x < width - paddingX && y > paddingY && y < height - paddingY) {
                        outBuffer[idx + 3] = 0; // Alpha = 0
                    } else {
                        // Apply tint to the dark areas based on luma
                        // We map black (luma 0) to a dark version of the color,
                        // and map mid-tones to the color itself.
                        // For pure black/grey outlines, we tint them:
                        // Multiply the luma by the target color to get a colored outline
                        if (luma < 240) {
                            const tintFactor = 1 - (luma / 255); // 1 = black, 0 = white

                            // Blend original with the target color
                            // The darker it is, the more of the target color it takes (multiplied by luma or a constant darkness)
                            // A simple gradient: dark = dark color, light = light color or original

                            outBuffer[idx] = Math.min(255, luma + (c.r - luma) * tintFactor * 0.5);
                            outBuffer[idx + 1] = Math.min(255, luma + (c.g - luma) * tintFactor * 0.5);
                            outBuffer[idx + 2] = Math.min(255, luma + (c.b - luma) * tintFactor * 0.5);
                        }
                    }
                }
            }

            const outPath = `/tmp/frame_${c.name}.png`;
            await sharp(outBuffer, {
                raw: {
                    width: width,
                    height: height,
                    channels: 4
                }
            })
                .png()
                .toFile(outPath);

            console.log(`Saved ${outPath}`);
            // Also save specifically inside the app public dir
            const appPath = `/Users/air2024/Documents/Antigravity projekty/Kvarteta_vyšší bere/kvarteta-eshop/public/cards/witch_frame_${c.name}.png`;
            fs.copyFileSync(outPath, appPath);
        }
        console.log("Done.");
    } catch (err) {
        console.error("Error:", err);
    }
}

processImage();
