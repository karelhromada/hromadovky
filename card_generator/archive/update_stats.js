const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const dirPath = path.resolve(__dirname, '..');
const files = fs.readdirSync(dirPath);
const excelFile = files.find(file => file.endsWith('.xlsx') && !file.startsWith('~$'));

if (!excelFile) {
    console.error("No .xlsx file found");
    process.exit(1);
}

const workbook = XLSX.readFile(path.join(dirPath, excelFile));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

// Approved changes
const changes = [
    { name: 'Bazilišek', updates: { 'Síla': 64 } },
    { name: 'Popelavý Dech', updates: { 'Síla': 82 } },
    { name: 'Hmyzí Král', updates: { 'Věk (let)': 120 } },
    { name: 'Sonic', updates: { 'Rychlost (km/h)': 850 } }
];

let updatedCount = 0;
data.forEach(row => {
    const change = changes.find(c => c.name === row['Jméno']);
    if (change) {
        Object.keys(change.updates).forEach(key => {
            console.log(`[UPDATE] ${row['Jméno']}: ${key} ${row[key]} -> ${change.updates[key]}`);
            row[key] = change.updates[key];
            updatedCount++;
        });
    }
});

// Write back to Excel
const newWorksheet = XLSX.utils.json_to_sheet(data);
workbook.Sheets[sheetName] = newWorksheet;
XLSX.writeFile(workbook, path.join(dirPath, excelFile));

console.log(`Successfully updated ${updatedCount} stats in ${excelFile}`);
