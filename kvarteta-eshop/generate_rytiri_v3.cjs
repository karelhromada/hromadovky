const sharp = require("/tmp/sharp-fix/node_modules/sharp");
const fs = require('fs');
const path = require('path');

// Definice barev pro 8 sad
const setColors = {
    '1': '#ffaaaa', // Cukroví vládci (Růžová/Červená jako Pralinka)
    '2': '#facc15', // Zvířecí strážci (Zlatá jako Tlapka)
    '3': '#93c5fd', // Hmyzí bojovníci (Světle modrá)
    '4': '#f87171', // Hračkoví rytíři (Červená)
    '5': '#c084fc', // Snoví strážci (Fialová)
    '6': '#38bdf8', // Mořští hrdinové (Modrá)
    '7': '#fbbf24', // Ovocní bojovníci (Oranžová)
    '8': '#cbd5e1'  // Drobní rytíři (Stříbrná/Šedá)
};

const labels = ['ROZTOMILOST', 'SÍLA', 'MĚKKOST', 'RYCHLOST'];

function createSVG(id, name, set, desc, stats, setId, width, height) {
    const mainColor = setColors[setId] || '#ffffff';
    const padding = 100;

    // Funkce pro ornamentální hexagon s hodnotou i popisem uvnitř
    const statBox = (x, y, label, val) => `
        <g transform="translate(${x}, ${y})">
            <path d="M-65,-45 L65,-45 L90,0 L65,45 L-65,45 L-90,0 Z" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
            <text y="-5" text-anchor="middle" font-family="Impact, sans-serif" font-size="44" font-weight="bold" fill="white">${val}</text>
            <text y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="white" opacity="0.6">${label}</text>
        </g>
    `;

    return `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bottomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:rgba(0,0,0,0);" />
                    <stop offset="60%" style="stop-color:rgba(0,0,0,0.6);" />
                    <stop offset="100%" style="stop-color:rgba(0,0,0,0.9);" />
                </linearGradient>
            </defs>

            <!-- Staty v rozích -->
            ${statBox(padding, padding, labels[0], stats[0])}
            ${statBox(width - padding, padding, labels[1], stats[1])}
            ${statBox(padding, height - padding, labels[2], stats[stats.length-2])}
            ${statBox(width - padding, height - padding, labels[3], stats[stats.length-1])}

            <!-- ID Badge (Top Center) -->
            <g transform="translate(${width/2}, ${padding})">
                <circle r="45" fill="black" stroke="${mainColor}" stroke-width="4" />
                <text y="12" text-anchor="middle" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="white">${id}</text>
            </g>

            <!-- Bottom Info -->
            <rect x="0" y="${height - 350}" width="${width}" height="350" fill="url(#bottomGrad)" />
            <g transform="translate(${width/2}, ${height - 180})">
                <text y="-80" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="white" opacity="0.6">${set.toLowerCase()}</text>
                <text y="-20" text-anchor="middle" font-family="Georgia, serif" font-size="62" font-weight="bold" fill="${mainColor}" style="letter-spacing: 3px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">${name.toUpperCase()}</text>
                <text y="40" text-anchor="middle" font-family="Georgia, serif" font-size="28" font-style="italic" fill="white" opacity="0.9">${desc}</text>
            </g>
        </svg>
    `;
}

async function processCard(sourcePath, outputPath, id, name, set, desc, stats, setId) {
    try {
        const metadata = await sharp(sourcePath).metadata();
        const { width, height } = metadata;

        const svgOverlay = createSVG(id, name, set, desc, stats, setId, width, height);
        
        await sharp(sourcePath)
            .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
            .png()
            .toFile(outputPath);

        console.log(`✅ ${path.basename(outputPath)}`);
    } catch (err) {
        console.error(`❌ ${name}: ${err.message}`);
    }
}

async function run() {
    const inputDir = 'public/cards/Roztomilý rytíři/';
    const outputDir = 'public/cards/rytiri_v3/';
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const rytiri = [
        ["1A", "Sir Pufík", "Cukroví vládci", "Nejměkčí strážce Cukrového údolí.", [98, 10, 100, 30]],
        ["1B", "Lord Karamel", "Cukroví vládci", "Sladký hrdina, který se nikdy nepřilepí.", [92, 45, 60, 50]],
        ["1C", "Baron Vlnka", "Cukroví vládci", "Pletený rytíř, co se nikdy nerozpáře.", [95, 15, 95, 40]],
        ["1D", "Princ Pralinka", "Cukroví vládci", "Elegantní šlechtic z Dezertního stolku.", [89, 55, 40, 35]],
        ["2A", "Kapitán Tlapka", "Zvířecí strážci", "Nejvěrnější rytíř s nejvrtivějším ocasem.", [100, 70, 20, 85]],
        ["2B", "Squirelous Krátký", "Zvířecí strážci", "Rychlý jako blesk, malý jako oříšek.", [85, 30, 15, 95]],
        ["2C", "Sir Ježurka", "Zvířecí strážci", "Nedotknutelný obránce záhonů s jahodami.", [88, 65, 5, 60]],
        ["2D", "Don Křeček", "Zvířecí strážci", "Hrdina, který se kutálí vstříc dobrodružství.", [96, 40, 85, 80]],
        ["3A", "Vánek Ušatý", "Hmyzí bojovníci", "Skáče výš než kdokoli jiný v brnění.", [94, 35, 90, 100]],
        ["3B", "Rytíř Rosa", "Hmyzí bojovníci", "Nejpomalejší, ale nejdůslednější hlídka.", [82, 25, 70, 5]],
        ["3C", "Slečna Pírko", "Hmyzí bojovníci", "Moudrost schovaná v chomáčku peří.", [80, 50, 80, 90]],
        ["3D", "Brouček Zbrojnoš", "Hmyzí bojovníci", "Malý puntíkatý tank v moři květin.", [86, 60, 30, 75]],
        ["4A", "Sir Knoflík", "Hračkoví rytíři", "Hrdina slepený z čisté dětské fantazie.", [89, 40, 88, 30]],
        ["4B", "Lego-lás", "Hračkoví rytíři", "Pevný jako skála, pokud na něj nešlápnete.", [70, 85, 15, 40]],
        ["4C", "Vojáček Olověný", "Hračkoví rytíři", "Stojí pevně i na jedné noze.", [75, 90, 10, 15]],
        ["4D", "Jojo Rytíř", "Hračkoví rytíři", "Hrdina, který se vždycky vrátí nahoru.", [81, 55, 40, 95]],
        ["5A", "Hvězdička Jasná", "Snoví strážci", "Svítí všem dětem na cestu do říše snů.", [97, 20, 100, 100]],
        ["5B", "Lord Polštář", "Snoví strážci", "Šampion v nejtěžší váze prachového peří.", [93, 15, 100, 10]],
        ["5C", "Snílek Modrý", "Snoví strážci", "Cestovatel v nekonečných oceánech fantazie.", [88, 75, 90, 85]],
        ["5D", "Zvonilka Zbrojná", "Snoví strážci", "Její příchod vždycky jemně cinká.", [91, 30, 80, 95]],
        ["6A", "Sir Kapka", "Mořští hrdinové", "Nejosvěživější hrdina pod hladinou moře.", [84, 45, 100, 80]],
        ["6B", "Admirál Kachnička", "Mořští hrdinové", "Neohrožený vládce všech vln ve vaně.", [96, 35, 10, 60]],
        ["6C", "Rytíř Korál", "Mořští hrdinové", "Krása mořského dna zakovaná do zbroje.", [83, 80, 30, 25]],
        ["6D", "Ploutvička Chrabrá", "Mořští hrdinové", "Klouže do boje s úsměvem a hrdostí.", [99, 65, 25, 90]],
        ["7A", "Sir Jahůdka", "Ovocní bojovníci", "Nejsladší bojovník v celém ovocném salátu.", [95, 30, 70, 45]],
        ["7B", "Lord Citron", "Ovocní bojovníci", "Trochu kyselý rytíř, ale s velkým srdcem.", [78, 40, 15, 55]],
        ["7C", "Baron Borůvka", "Ovocní bojovníci", "Kutálející se kulička odvahy a vitamínů.", [87, 25, 90, 70]],
        ["7D", "Princ Ananas", "Ovocní bojovníci", "Drsný navenek, neuvěřitelně sladký uvnitř.", [79, 85, 5, 35]],
        ["8A", "Rytíř Šmudla", "Drobní rytíři", "Šťastný hrdina, který se nikdy nebojí bláta.", [85, 50, 10, 60]],
        ["8B", "Squire Čára", "Drobní rytíři", "Jednoduchý hrdina pro velmi složité časy.", [74, 20, 5, 85]],
        ["8C", "Baron v Náprstku", "Drobní rytíři", "Velikost není překážkou pro ty největší činy.", [92, 40, 10, 75]],
        ["8D", "Sir Hajaja", "Drobní rytíři", "Nejudatnější hrdina... ve svých snech.", [98, 35, 100, 5]]
    ];

    const availableFiles = fs.readdirSync(inputDir);

    for (const [id, name, set, desc, stats] of rytiri) {
        const sourceFile = availableFiles.find(f => f.toLowerCase() === (name.toLowerCase() + '.png'));
        if (!sourceFile) continue;

        const safeName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const outPath = path.join(outputDir, `${safeName}_karta_v3.png`);
        
        const setId = id.charAt(0);
        await processCard(path.join(inputDir, sourceFile), outPath, id, name, set, desc, stats, setId);
    }
    console.log('✨ Hotovo!');
}

run();
