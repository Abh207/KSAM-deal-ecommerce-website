import fs from 'fs';
import path from 'path';

function getFiles(dir, all = []) {
  if (!fs.existsSync(dir)) return all;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const s = fs.statSync(full);
    if (s.isDirectory()) getFiles(full, all);
    else all.push({ path: path.relative('.', full).replace(/\\/g, '/'), size: s.size });
  }
  return all;
}

const assets = [...getFiles('public'), ...getFiles('src/assets')].sort((a,b) => b.size - a.size);
console.log('=== TOP 15 HEAVIEST FILES IN public/ and src/assets/ ===');
assets.slice(0, 15).forEach((item, i) => {
  console.log(`${(i+1).toString().padStart(2)}. ${item.path} - ${(item.size / 1024 / 1024).toFixed(2)} MB (${(item.size / 1024).toFixed(1)} KB)`);
});

const dist = getFiles('dist/assets').filter(x => x.path.endsWith('.js') || x.path.endsWith('.css')).sort((a,b) => b.size - a.size);
console.log('\n=== ALL JS AND CSS CHUNKS IN dist/assets/ ===');
dist.forEach(item => {
  console.log(`${(item.size / 1024).toFixed(1).padStart(7)} KB - ${item.path}`);
});
