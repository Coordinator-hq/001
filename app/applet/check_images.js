import fs from 'fs';
import path from 'path';

const code = fs.readFileSync('src/data/leaderboardData.ts', 'utf8');
const matches = [...code.matchAll(/image:\s*['"]([^'"]+)['"]/g)];
console.log('Total creators found in leaderboardData.ts:', matches.length);

let missing = [];
let lowRes = [];

matches.forEach(m => {
  const imgPath = m[1].replace(/^\//, '');
  const fullPath = path.join(process.cwd(), 'public', imgPath);
  if (!fs.existsSync(fullPath)) {
    missing.push(imgPath);
  } else {
    const size = fs.statSync(fullPath).size;
    if (size < 30000) {
      lowRes.push({ imgPath, sizeKB: (size / 1024).toFixed(1) });
    }
  }
});

console.log('Missing files:', missing);
console.log('Low res files (<30KB):', lowRes);
