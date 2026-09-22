import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, 'src', 'assets', 'hanziDB.csv');
const destDir = path.join(__dirname, 'public');
const dest = path.join(destDir, 'hanziDB.csv');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

try {
  fs.copyFileSync(source, dest);
  console.log('Successfully copied hanziDB.csv to public/hanziDB.csv');
} catch (err) {
  console.error('Error copying hanziDB.csv:', err);
}
