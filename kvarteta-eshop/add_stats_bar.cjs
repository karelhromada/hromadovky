const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

// Pomocná fce pro zaoblený obdélník (rounded rectangle)
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

async function processImage() {
    const imagePath = '/Users/air2024/.gemini/antigravity/brain/e5bc0d11-3674-4850-8c86-65f4f95731b3/zeus_kvarteto_1773232441103.png';
    const outputPath = '/Users/air2024/.gemini/antigravity/brain/e5bc0d11-3674-4850-8c86-65f4f95731b3/zeus_with_stats_premium.png';

    const image = await loadImage(imagePath);

    // Nastavení parametrů karty
    const borderWidth = Math.floor(image.width * 0.03); // 3% šířky jako prémiový okraj kolem celé karty
    const innerWidth = image.width;
    const innerHeight = image.height;
    const barHeight = Math.floor(innerHeight * 0.38); // Lišta na statistiky

    // Celková velikost nové karty včetně okrajů (rámečku)
    const cardWidth = innerWidth + (borderWidth * 2);
    const cardHeight = innerHeight + barHeight + (borderWidth * 2);

    const canvas = createCanvas(cardWidth, cardHeight);
    const ctx = canvas.getContext('2d');
    const scale = canvas.width / 1024;

    // 1. Zlatý rámeček kolem CELÉ karty (Základní podklad)
    const goldGradient = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
    goldGradient.addColorStop(0, '#713f12'); // Tmavá zlatá / hnědá
    goldGradient.addColorStop(0.2, '#fef08a'); // Světle zlatá
    goldGradient.addColorStop(0.5, '#a16207'); // Střední zlatá
    goldGradient.addColorStop(0.8, '#fde047'); // Světle zlatá
    goldGradient.addColorStop(1, '#451a03'); // Velmi tmavá brown/gold

    ctx.fillStyle = goldGradient;
    ctx.fillRect(0, 0, cardWidth, cardHeight);

    // Černá tenká vnitřní linka těsně za zlatou
    ctx.fillStyle = '#000000';
    ctx.fillRect(borderWidth - 4 * scale, borderWidth - 4 * scale, innerWidth + 8 * scale, innerHeight + barHeight + 8 * scale);

    // 2. Vykreslení původního obrázku (posunutého o rámeček)
    ctx.drawImage(image, borderWidth, borderWidth, innerWidth, innerHeight);

    // 3. Prémiové pozadí lišty (radiální nebo sférický přechod)
    const barY = borderWidth + innerHeight;
    const bgGradient = ctx.createLinearGradient(0, barY, 0, barY + barHeight);
    bgGradient.addColorStop(0, '#1e1b4b');   // Tmavě fialová nahoře
    bgGradient.addColorStop(0.5, '#0f172a'); // Břidlicová uprostřed
    bgGradient.addColorStop(1, '#020617');   // Téměř černá dole

    ctx.fillStyle = bgGradient;
    ctx.fillRect(borderWidth, barY, innerWidth, barHeight);

    // 4. Předěl (horní linka lišty) oddělující přímo lištu od obrázku
    ctx.fillStyle = goldGradient;
    ctx.fillRect(borderWidth, barY - 6 * scale, innerWidth, 12 * scale); // 12px široká linka 
    // Vnitřní tmavá tenká linka pod předělem
    ctx.fillStyle = '#000000';
    ctx.fillRect(borderWidth, barY + 6 * scale, innerWidth, 3 * scale);

    // 5. Stínování pro texty
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 6. Jméno (Velké, nadupané fontem)
    ctx.font = `bold ${Math.floor(65 * scale)}px "Georgia"`;
    ctx.fillStyle = goldGradient;
    ctx.fillText('1A - ZEUS', cardWidth / 2, barY + (barHeight * 0.20));

    // 7. Popis postavy (Epický italic)
    ctx.shadowBlur = 6;
    ctx.font = `italic ${Math.floor(32 * scale)}px "Georgia"`;
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Vládce nebes a blesků', cardWidth / 2, barY + (barHeight * 0.40));

    // 8. Vymazat stín pro kreslení boxíků
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 9. Boxíky (badges) pro statistiky
    // Offset dáme tak, aby mezi odznáčkem a spodním rámečkem zůstala hezká mezera
    const statsCenterY = barY + (barHeight * 0.77);
    const stats = [
        { label: 'SÍLA', value: '95', colorCenter: '#ef4444', colorEdge: '#7f1d1d' },
        { label: 'MAGIE', value: '100', colorCenter: '#8b5cf6', colorEdge: '#4c1d95' },
        { label: 'ROZUM', value: '90', colorCenter: '#3b82f6', colorEdge: '#1e3a8a' },
        { label: 'ODVAHA', value: '95', colorCenter: '#eab308', colorEdge: '#713f12' }
    ];

    const sectionWidth = innerWidth / 4;
    const badgeWidth = sectionWidth * 0.85; // 85% šířky sekce pro mohutnější odznáčky
    const badgeHeight = barHeight * 0.26; // upravená výška, aby nesahaly úplně dolů

    for (let i = 0; i < 4; i++) {
        const stat = stats[i];
        const centerX = borderWidth + (i * sectionWidth) + (sectionWidth / 2);
        const boxX = centerX - (badgeWidth / 2);
        const boxY = statsCenterY - (badgeHeight / 2);

        // Kreslení "skleněného / kovového" pozadí badgu (zaoblený obdélník)
        const badgeGradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + badgeHeight);
        badgeGradient.addColorStop(0, stat.colorCenter);
        badgeGradient.addColorStop(1, stat.colorEdge);

        // Vnější záře / stín odznáčku
        ctx.shadowColor = stat.colorCenter;
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;

        ctx.fillStyle = badgeGradient;
        roundRect(ctx, boxX, boxY, badgeWidth, badgeHeight, 15 * scale);
        ctx.fill();

        // Vnitřní zlatý rámeček na badgi
        ctx.shadowColor = 'transparent';
        ctx.lineWidth = 4 * scale;
        ctx.strokeStyle = '#fde047'; // čistá světle zlatá
        ctx.stroke();

        // Text hodnoty (Číslo)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.font = `bold ${Math.floor(42 * scale)}px "Impact", "Helvetica", sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${stat.value}`, centerX, statsCenterY + (3 * scale));

        // Label nad odznakem
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 5;
        ctx.font = `bold ${Math.floor(22 * scale)}px "Georgia"`;
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(`${stat.label}`, centerX, boxY - (20 * scale));
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log('ZEUS PREMIIUM + BORDER - karta kompletně vygenerována!');
}

processImage().catch(err => {
    console.error(err);
});
