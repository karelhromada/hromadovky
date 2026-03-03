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
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

console.log(JSON.stringify(data, null, 2));
