const fs = require('fs');
const path = require('path');

const srcDir = '/Users/air2024/.gemini/antigravity/brain/9926e9fd-1989-4bcf-a934-b9e4fa2c430e';
const destDir = path.join(__dirname, 'public', 'cards', 'carodejnice');

const filesToCopy = [
    { src: 'witch_devitka_srdce_1772693693658.png', dest: 'devitka_srdce.png' },
    { src: 'witch_devitka_listy_1772693708096.png', dest: 'devitka_listy.png' },
    { src: 'witch_devitka_zaludy_1772693721438.png', dest: 'devitka_zaludy.png' },
    { src: 'witch_devitka_kule_1772693736055.png', dest: 'devitka_kule.png' },
    
    { src: 'witch_osmicka_srdce_1772693778055.png', dest: 'osmicka_srdce.png' },
    { src: 'witch_osmicka_listy_1772693789231.png', dest: 'osmicka_listy.png' },
    { src: 'witch_osmicka_zaludy_1772693802058.png', dest: 'osmicka_zaludy.png' },
    { src: 'witch_osmicka_kule_1772693817463.png', dest: 'osmicka_kule.png' }
];

console.log('Zahajuji bezpečné kopírování...');

filesToCopy.forEach(f => {
    try {
        fs.copyFileSync(path.join(srcDir, f.src), path.join(destDir, f.dest));
        console.log(`✅ Zkopírováno: ${f.dest}`);
    } catch (e) {
        console.error(`❌ Chyba u ${f.dest}:`, e.message);
    }
});

console.log('Kopírování dokončeno.');
