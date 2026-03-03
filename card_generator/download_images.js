const fs = require('fs');
const path = require('path');
const https = require('https');
const XLSX = require('xlsx');

// 1. Read Data
const dirPath = path.resolve(__dirname, '..');
const files = fs.readdirSync(dirPath);
const excelFile = files.find(file => file.endsWith('.xlsx') && !file.startsWith('~$'));

if (!excelFile) {
    console.error("No .xlsx file found");
    process.exit(1);
}

const workbook = XLSX.readFile(path.join(dirPath, excelFile));
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

// 2. Ensure images directory exists
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

// 3. Download function
const downloadImage = (url, filename) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(imagesDir, filename);
        const file = fs.createWriteStream(filePath);

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: Status Code ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => { }); // Delete partial file
            reject(err);
        });
    });
};

// 4. Iterate and download
async function downloadAll() {
    console.log(`Found ${data.length} dragons.`);

    for (const dragon of data) {
        const id = dragon['#'];
        const url = dragon['URL obrázku'];

        if (url) {
            // Extract extension or default to .png
            const ext = path.extname(url).split('?')[0] || '.png';
            const filename = `dragon_${id}${ext}`;

            try {
                await downloadImage(url, filename);
            } catch (err) {
                console.error(`Error downloading dragon ${id}:`, err.message);
            }
        } else {
            console.log(`Skipping dragon ${id}: No URL`);
        }
    }
}

downloadAll();
