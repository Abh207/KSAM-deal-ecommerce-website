import fs from 'fs';
import path from 'path';

function checkDir(dir) {
  const urls = new Set();
  function walk(d) {
    for (const f of fs.readdirSync(d)) {
      const full = path.join(d, f);
      const s = fs.statSync(full);
      if (s.isDirectory()) {
        if (!['node_modules', 'dist', '.git', 'backups'].includes(f)) walk(full);
      } else if (f.endsWith('.json') || f.endsWith('.js') || f.endsWith('.jsx')) {
        const text = fs.readFileSync(full, 'utf8');
        const matches = text.match(/https?:\/\/[^\s"'<>]+?\.(png|jpg|jpeg|webp)[^\s"'<>]*/gi) || [];
        matches.forEach(m => urls.add(m));
        const unsplash = text.match(/https:\/\/images\.unsplash\.com\/[^\s"'<>]+/gi) || [];
        unsplash.forEach(u => urls.add(u));
      }
    }
  }
  walk(dir);
  return Array.from(urls);
}

const urls = checkDir('src');
console.log('Found external image URLs:', urls.length);
urls.forEach(u => console.log(u));
