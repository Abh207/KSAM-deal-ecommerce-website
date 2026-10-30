import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const OUTPUT_DIR = 'public/images/remote';
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read all unique Unsplash URLs from the project
function getExternalUrls(dir) {
  const urls = new Set();
  function walk(d) {
    for (const f of fs.readdirSync(d)) {
      const full = path.join(d, f);
      const s = fs.statSync(full);
      if (s.isDirectory()) {
        if (!['node_modules', 'dist', '.git', 'backups'].includes(f)) walk(full);
      } else if (f.endsWith('.json') || f.endsWith('.js') || f.endsWith('.jsx')) {
        const text = fs.readFileSync(full, 'utf8');
        const matches = text.match(/https:\/\/images\.unsplash\.com\/[^\s"'`<>]+/gi) || [];
        matches.forEach(m => {
          // clean trailing punctuation if any
          let clean = m.replace(/[;,)]+$/, '');
          urls.add(clean);
        });
      }
    }
  }
  walk(dir);
  return Array.from(urls);
}

function urlToFilename(url) {
  // Extract photo id if possible
  const m = url.match(/photo-([a-zA-Z0-9_-]+)/);
  if (m) return `unsplash_${m[1]}.webp`;
  // Otherwise simple hash
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash) + url.charCodeAt(i);
    hash |= 0;
  }
  return `unsplash_${Math.abs(hash)}.webp`;
}

async function downloadAndOptimize() {
  const urls = getExternalUrls('src');
  console.log(`Downloading and optimizing ${urls.length} remote images...`);
  const mapping = {};

  for (const url of urls) {
    if (url.includes('${id}')) continue; // template literal

    const filename = urlToFilename(url);
    const dest = path.join(OUTPUT_DIR, filename);
    const localRel = `images/remote/${filename}`;

    mapping[url] = localRel;

    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      continue;
    }

    try {
      // Ensure we fetch a reasonable size
      const fetchUrl = url.includes('?') ? url : `${url}?auto=format&fit=crop&w=600&q=80`;
      const res = await fetch(fetchUrl);
      if (!res.ok) {
        console.warn(`Failed to fetch ${url}: ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      await sharp(buffer)
        .resize({ width: 600, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(dest);

      const size = fs.statSync(dest).size;
      console.log(`Saved ${filename} (${(size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.warn(`Error downloading ${url}:`, err.message);
    }
  }

  fs.writeFileSync('scratch/remote_image_map.json', JSON.stringify(mapping, null, 2));
  console.log('Saved remote image mapping to scratch/remote_image_map.json');
}

downloadAndOptimize().catch(console.error);
