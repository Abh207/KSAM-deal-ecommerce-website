import fs from 'fs';
import path from 'path';

function getVideos(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const s = fs.statSync(full);
    if (s.isDirectory()) {
      if (!['node_modules', 'dist', '.git', 'backups', 'scratch'].includes(f)) getVideos(full, list);
    } else if (f.endsWith('.mp4') || f.endsWith('.webm')) {
      list.push({ path: path.relative('.', full).replace(/\\/g, '/'), size: s.size });
    }
  }
  return list;
}

const vids = getVideos('.').sort((a,b) => b.size - a.size);
console.log('ALL VIDEOS IN PROJECT:');
vids.forEach(v => console.log(`${(v.size / 1024 / 1024).toFixed(2)} MB (${(v.size / 1024).toFixed(1)} KB) - ${v.path}`));
