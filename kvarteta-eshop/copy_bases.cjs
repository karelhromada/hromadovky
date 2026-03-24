const fs = require('fs');
const path = require('path');

const srcDir = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e';
const destDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

const copies = [
    { src: 'witch_sedmicka_srdce_1772697143688.png', dest: 'sedmicka_srdce.png' },
    { src: 'witch_sedmicka_listy_1772697158164.png', dest: 'sedmicka_listy.png' },
    { src: 'witch_sedmicka_zaludy_1772697171931.png', dest: 'sedmicka_zaludy.png' },
    { src: 'witch_sedmicka_kule_bg_1772713123748.png', dest: 'sedmicka_kule.png' },

    { src: 'witch_osmicka_srdce_1772693778055.png', dest: 'osmicka_srdce.png' },
    { src: 'witch_osmicka_listy_1772693789231.png', dest: 'osmicka_listy.png' },
    { src: 'witch_osmicka_zaludy_1772693802058.png', dest: 'osmicka_zaludy.png' },
    { src: 'witch_osmicka_kule_1772693817463.png', dest: 'osmicka_kule.png' },

    { src: 'witch_devitka_srdce_1772693693658.png', dest: 'devitka_srdce.png' },
    { src: 'witch_devitka_listy_1772693708096.png', dest: 'devitka_listy.png' },
    { src: 'witch_devitka_zaludy_1772693721438.png', dest: 'devitka_zaludy.png' },
    { src: 'witch_devitka_kule_1772693736055.png', dest: 'devitka_kule.png' },

    { src: 'witch_desitka_srdce_1772691198630.png', dest: 'desitka_srdce.png' },
    { src: 'witch_desitka_listy_1772691213142.png', dest: 'desitka_listy.png' },
    { src: 'witch_desitka_zaludy_1772691226753.png', dest: 'desitka_zaludy.png' },
    { src: 'witch_desitka_kule_1772691240714.png', dest: 'desitka_kule.png' }
];

async function copyBases() {
    for (const item of copies) {
        const srcPath = path.join(srcDir, item.src);
        const destPath = path.join(destDir, item.dest);
        
        try {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${item.src} -> ${item.dest}`);
        } catch (err) {
            console.error(`Failed to copy ${item.src}:`, err.message);
        }
    }
}

copyBases();
