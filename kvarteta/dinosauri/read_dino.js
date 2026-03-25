const XLSX = require('xlsx');
const path = require('path');

const EXCEL_FILE = path.join(__dirname, '..', 'Dinosauři.xlsx');
const workbook = XLSX.readFile(EXCEL_FILE);
const sheetName = workbook.SheetNames[0];
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

console.log(data.slice(0, 3));
