const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Go up one level to find the excel file
const dirPath = path.resolve(__dirname, '..');
const files = fs.readdirSync(dirPath);
const excelFile = files.find(file => file.endsWith('.xlsx') && !file.startsWith('~$'));

if (!excelFile) {
    console.error("No .xlsx file found in parent directory");
    process.exit(1);
}

const workbook = XLSX.readFile(path.join(dirPath, excelFile));
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(JSON.stringify(data, null, 2));
