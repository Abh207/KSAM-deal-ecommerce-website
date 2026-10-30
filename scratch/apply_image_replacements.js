import fs from 'fs';
import path from 'path';

const map = JSON.parse(fs.readFileSync('scratch/remote_image_map.json', 'utf8'));

// Fallback for failed remote images
const FALLBACK = 'images/remote/unsplash_1620916566398-39f1143ab7be.webp';

function replaceInDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const s = fs.statSync(full);
    if (s.isDirectory()) {
      if (!['node_modules', 'dist', '.git', 'backups', 'scratch'].includes(f)) {
        replaceInDir(full);
      }
    } else if (f.endsWith('.json') || f.endsWith('.js') || f.endsWith('.jsx')) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;

      for (const [remote, local] of Object.entries(map)) {
        if (content.includes(remote)) {
          const dest = path.join('public', local);
          const finalLocal = fs.existsSync(dest) ? local : FALLBACK;
          content = content.replaceAll(remote, finalLocal);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(full, content, 'utf8');
        console.log(`Updated remote image links in ${full}`);
      }
    }
  }
}

replaceInDir('src');
