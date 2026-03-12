const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

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

// Barevná témata pro CELÁ KVARTETA (všechny čtyři karty jednoho čísla mají stejnou barvu)
const themes = {
    '1': { // 1. Kvarteto - Zlaté (Řečtí bohové)
        colors: ['#713f12', '#fef08a', '#a16207', '#fde047', '#451a03'],
        textPrimary: '#fde047'
    },
    '2': { // 2. Kvarteto - Zelené (Řecké mýty)
        colors: ['#064e3b', '#6ee7b7', '#047857', '#34d399', '#022c22'],
        textPrimary: '#6ee7b7'
    },
    '3': { // 3. Kvarteto - Modré (Římští bohové)
        colors: ['#1e3a8a', '#60a5fa', '#1d4ed8', '#93c5fd', '#1e3a8a'],
        textPrimary: '#93c5fd'
    },
    '4': { // 4. Kvarteto - Stříbrné (Severští bohové) 
        colors: ['#3f3f46', '#e4e4e7', '#71717a', '#f4f4f5', '#27272a'],
        textPrimary: '#e4e4e7'
    },
    '5': { // 5. Kvarteto - Fialové (Severské bytosti) 
        colors: ['#4a044e', '#f0abfc', '#a21caf', '#e879f9', '#2e1065'],
        textPrimary: '#f0abfc'
    },
    '6': { // 6. Kvarteto - Písečně Oranžové (Egyptští bohové) 
        colors: ['#7c2d12', '#fdba74', '#c2410c', '#fb923c', '#431407'],
        textPrimary: '#fdba74'
    },
    '7': { // 7. Kvarteto - Karmínové (Staročeské pověsti) 
        colors: ['#7f1d1d', '#fca5a5', '#b91c1c', '#f87171', '#450a0a'],
        textPrimary: '#fca5a5'
    },
    '8': { // 8. Kvarteto - Tyrkysové (Slovanské mýty) 
        colors: ['#134e4a', '#5eead4', '#0f766e', '#2dd4bf', '#042f2e'],
        textPrimary: '#5eead4'
    }
};

const defaultTheme = {
    colors: ['#404040', '#e5e5e5', '#737373', '#a3a3a3', '#171717'],
    textPrimary: '#e5e5e5'
};

// Databáze karet pro hromadné generování
const cardData = {
    // SADA 1: Řečtí bohové (Zlatá)
    "zeus_kvarteto_1773232441103.png": { name: "1A - ZEUS", desc: "Vládce nebes a blesků", stats: [95, 100, 90, 85] },
    "poseidon_kvarteto_1773232459144.png": { name: "1B - POSEIDON", desc: "Zemětřas a král moří", stats: [90, 95, 80, 85] },
    "hades_kvarteto_1773232474069.png": { name: "1C - HÁDES", desc: "Temný pán podsvětí", stats: [85, 95, 85, 90] },
    "athena_kvarteto_1773232489883.png": { name: "1D - ATHÉNA", desc: "Bohyně moudrosti a vítězství", stats: [70, 80, 100, 95] },

    // SADA 2: Řecké mýty a nestvůry (Zelená)
    "herakles_kvarteto_1773232618325.png": { name: "2A - HÉRAKLÉS", desc: "Nejsilnější z hrdinů", stats: [100, 10, 50, 95] },
    "meduza_kvarteto_1773232636144.png": { name: "2B - MEDÚZA", desc: "Gorgona s kamenným pohledem", stats: [40, 85, 60, 30] },
    "kerberos_kvarteto_1773232651828.png": { name: "2C - KERBEROS", desc: "Tříhlavý pekelný strážce", stats: [80, 40, 30, 90] },
    "pegas_kvarteto_1773232669889.png": { name: "2D - PEGAS", desc: "Okleřídlený bájný oř", stats: [50, 60, 70, 80] },

    // SADA 3: Římští bohové (Modrá)
    "jupiter_kvarteto_1773232768056.png": { name: "3A - JUPITER", desc: "Nejvyšší imperiální bůh", stats: [95, 100, 95, 85] },
    "mars_kvarteto_1773232782289.png": { name: "3B - MARS", desc: "Krvavý bůh války", stats: [95, 50, 60, 100] },
    "neptun_kvarteto_1773232797411.png": { name: "3C - NEPTUN", desc: "Vládce všech oceánů", stats: [90, 90, 80, 85] },
    "venuse_kvarteto_1773232812348.png": { name: "3D - VENUŠE", desc: "Bohyně lásky a krásy", stats: [20, 85, 80, 50] },

    // SADA 4: Severští bohové (Stříbrná)
    "odin_kvarteto_1773232963748.png": { name: "4A - ODIN", desc: "Jednooký otce bohů (Všeotec)", stats: [85, 100, 100, 90] },
    "thor_kvarteto_1773232978954.png": { name: "4B - THOR", desc: "Nezkrotný bůh hromu s Mjölnirem", stats: [100, 60, 40, 100] },
    "loki_kvarteto_1773232994824.png": { name: "4C - LOKI", desc: "Bůh klamu, falše a magie", stats: [60, 95, 95, 40] },
    "freya_kvarteto_1773233012935.png": { name: "4D - FREYA", desc: "Vikinská bohyně krásy a bitvy", stats: [80, 85, 80, 95] },

    // SADA 5: Severské bytosti (Fialová)
    "fenrir_kvarteto_1773233163130.png": { name: "5A - FENRIR", desc: "Apokalyptický obří vlk", stats: [95, 50, 30, 100] },
    "jormungandr_kvarteto_1773331719629.png": { name: "5B - JÖRMUNGANDR", desc: "Mořský had obtáčející svět", stats: [100, 80, 20, 85] },
    "valkyra_kvarteto_1773331735922.png": { name: "5C - VALKÝRA", desc: "Anděl smrti z Valhally", stats: [70, 60, 85, 95] },
    "ymir_kvarteto_1773331768521.png": { name: "5D - YMIR", desc: "Prastarý ledový obr", stats: [90, 75, 45, 90] },

    // SADA 6: Egyptští bohové (Oranžová)
    "ra_kvarteto_1773332186294.png": { name: "6A - RA", desc: "Vládce slunce a světla", stats: [95, 40, 65, 100] },
    "anubis_kvarteto_1773332202104.png": { name: "6B - ANUBIS", desc: "Šakalí strážce podsvětí", stats: [80, 60, 85, 90] },
    "horus_kvarteto_1773332218750.png": { name: "6C - HORUS", desc: "Sokolí bůh nebes a pomsty", stats: [90, 95, 75, 85] },
    "bastet_kvarteto_1773332236278.png": { name: "6D - BASTET", desc: "Nevyzpytatelná kočičí bohyně", stats: [70, 100, 80, 80] },

    // SADA 7: Anglosaské mýty / Beowulf (Karmínová)
    "beowulf_kvarteto_1773332496331.png": { name: "7A - BEOWULF", desc: "Legendární germánský hrdina", stats: [100, 15, 60, 95] },
    "grendel_kvarteto_1773332517229.png": { name: "7B - GRENDEL", desc: "Krvavý a prokletý netvor", stats: [90, 40, 50, 70] },
    "grendel_mother_kvarteto_1773332529832.png": { name: "7C - MATKA GRENDELA", desc: "Odporná jezerní čarodějnice", stats: [75, 60, 80, 85] },
    "fire_dragon_kvarteto_1773332546606.png": { name: "7D - OHNIVÝ DRAK", desc: "Když se probudí, nastane konec", stats: [95, 85, 30, 90] },

    // SADA 8: Bájní netvoři (Tyrkysová)
    "minotaurus_kvarteto_1773332802337.png": { name: "8A - MÍNOTAURUS", desc: "Krvavý řezník z Labyrintu", stats: [95, 10, 50, 85] },
    "bazilisek_kvarteto_1773332819283.png": { name: "8B - BAZILIŠEK", desc: "Jedovatý král hadů", stats: [60, 30, 95, 80] },
    "kraken_kvarteto_1773332833372.png": { name: "8C - KRAKEN", desc: "Pohlcuje celé lodě", stats: [100, 70, 40, 95] },
    "mantikora_kvarteto_1773332852801.png": { name: "8D - MANTIKORA", desc: "Krvežíznivá mýtická šelma", stats: [80, 60, 90, 75] }
};

async function createCard(filename, data) {
    const inputPath = path.join('/Users/air2024/.gemini/antigravity/brain/e5bc0d11-3674-4850-8c86-65f4f95731b3/', filename);
    const outputPath = path.join(__dirname, 'public', 'cards', 'mytologie', filename.replace('_kvarteto_', '_karta_'));

    // Zjistíme ČÍSLO kvarteta, nikoliv písmeno
    const numberMatch = data.name.match(/^(\d)/);
    const setId = numberMatch ? numberMatch[1] : null;
    const theme = themes[setId] || defaultTheme;

    // Ujistit se že existuje cílová složka
    if (!fs.existsSync('/Users/air2024/Documents/Antigravity projekty/Kvarteta_vyšší bere/kvarteta-eshop/vystupy_karty')) {
        fs.mkdirSync('/Users/air2024/Documents/Antigravity projekty/Kvarteta_vyšší bere/kvarteta-eshop/vystupy_karty');
    }

    try {
        const image = await loadImage(inputPath);

        const borderWidth = Math.floor(image.width * 0.03);
        const innerWidth = image.width;
        const innerHeight = image.height;
        const barHeight = Math.floor(innerHeight * 0.38);

        const cardWidth = innerWidth + (borderWidth * 2);
        const cardHeight = innerHeight + barHeight + (borderWidth * 2);

        const canvas = createCanvas(cardWidth, cardHeight);
        const ctx = canvas.getContext('2d');
        const scale = canvas.width / 1024;

        // 1. Tematický rámeček (podle sady)
        const borderGradient = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
        borderGradient.addColorStop(0, theme.colors[0]);
        borderGradient.addColorStop(0.2, theme.colors[1]);
        borderGradient.addColorStop(0.5, theme.colors[2]);
        borderGradient.addColorStop(0.8, theme.colors[3]);
        borderGradient.addColorStop(1, theme.colors[4]);

        ctx.fillStyle = borderGradient;
        ctx.fillRect(0, 0, cardWidth, cardHeight);

        // Černá tenká vnitřní linka
        ctx.fillStyle = '#000000';
        ctx.fillRect(borderWidth - 4 * scale, borderWidth - 4 * scale, innerWidth + 8 * scale, innerHeight + barHeight + 8 * scale);

        // 2. Obrázek
        ctx.drawImage(image, borderWidth, borderWidth, innerWidth, innerHeight);

        // 3. Pozadí lišty (stále neutrální temné pro kontrast odznáčků)
        const barY = borderWidth + innerHeight;
        const bgGradient = ctx.createLinearGradient(0, barY, 0, barY + barHeight);
        bgGradient.addColorStop(0, '#1e1b4b');
        bgGradient.addColorStop(0.5, '#0f172a');
        bgGradient.addColorStop(1, '#020617');

        ctx.fillStyle = bgGradient;
        ctx.fillRect(borderWidth, barY, innerWidth, barHeight);

        // Předěl (linka oddělující fotku od lišty) nese tematickou barvu
        ctx.fillStyle = borderGradient;
        ctx.fillRect(borderWidth, barY - 6 * scale, innerWidth, 12 * scale);
        ctx.fillStyle = '#000000';
        ctx.fillRect(borderWidth, barY + 6 * scale, innerWidth, 3 * scale);

        // Stíny
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Jméno (tematickou barvou)
        ctx.font = `bold ${Math.floor(65 * scale)}px "Georgia"`;
        ctx.fillStyle = borderGradient;
        ctx.fillText(data.name, cardWidth / 2, barY + (barHeight * 0.20));

        // Popis 
        ctx.shadowBlur = 6;
        ctx.font = `italic ${Math.floor(32 * scale)}px "Georgia"`;
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(data.desc, cardWidth / 2, barY + (barHeight * 0.40));

        // Vymazat stín 
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Boxíky statistik
        const statsCenterY = barY + (barHeight * 0.77);
        const statsDef = [
            { label: 'SÍLA', value: data.stats[0], colorCenter: '#ef4444', colorEdge: '#7f1d1d' },
            { label: 'MAGIE', value: data.stats[1], colorCenter: '#8b5cf6', colorEdge: '#4c1d95' },
            { label: 'ROZUM', value: data.stats[2], colorCenter: '#3b82f6', colorEdge: '#1e3a8a' },
            { label: 'ODVAHA', value: data.stats[3], colorCenter: '#eab308', colorEdge: '#713f12' }
        ];

        const sectionWidth = innerWidth / 4;
        const badgeWidth = sectionWidth * 0.85;
        const badgeHeight = barHeight * 0.26;

        for (let i = 0; i < 4; i++) {
            const stat = statsDef[i];
            const centerX = borderWidth + (i * sectionWidth) + (sectionWidth / 2);
            const boxX = centerX - (badgeWidth / 2);
            const boxY = statsCenterY - (badgeHeight / 2);

            // Vykreslení decentního, téměř průhledného pozadí badgu
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;

            ctx.fillStyle = 'rgba(10, 15, 30, 0.5)'; // Tmavé, jemně průhledné pozadí, žádná silná barva
            roundRect(ctx, boxX, boxY, badgeWidth, badgeHeight, 15 * scale);
            ctx.fill();

            // Jemný tématický rámeček kolem badgu pro spojení s barvou karty
            ctx.shadowColor = 'transparent';
            ctx.lineWidth = 2 * scale;
            ctx.strokeStyle = theme.colors[2]; // Použije střední odstín z aktuálně zvolené barvy sady
            ctx.stroke();

            // Text hodnoty - tentokrát obarvený do patřičné stat barvy místo výplně
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.font = `bold ${Math.floor(42 * scale)}px "Impact", "Helvetica", sans-serif`;

            // Text dostane gradient odpovídající barvě daného KVARTETA
            const textGradient = ctx.createLinearGradient(0, statsCenterY - (20 * scale), 0, statsCenterY + (20 * scale));
            textGradient.addColorStop(0, theme.colors[1]); // Světlejší odstín sady
            textGradient.addColorStop(1, theme.colors[3]); // Převládající barva sady

            ctx.fillStyle = textGradient;
            ctx.fillText(`${stat.value}`, centerX, statsCenterY + (3 * scale));

            // Label nad odznakem (např. "SÍLA")
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.font = `bold ${Math.floor(20 * scale)}px "Georgia"`;
            ctx.fillStyle = '#94a3b8'; // Jemná tlumená modrošedá
            ctx.fillText(`${stat.label}`, centerX, boxY - (20 * scale));
        }

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
        console.log(`Vygenerována karta (${setId || 'N/A'}): ${outputPath}`);
    } catch (e) {
        console.log(`Nepodařilo se zpracovat ${filename} - pravděpodobně soubor ještě nebyl vygenerován.`);
    }
}

async function run() {
    for (const [filename, data] of Object.entries(cardData)) {
        await createCard(filename, data);
    }
    console.log('Hromadné generování dokončeno!');
}

run();
