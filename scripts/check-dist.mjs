import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

const base = process.env.VITE_BASE || '/KSAM-deal-ecommerce-website/';
console.log(`[check-dist] Scanning dist folder at: ${distDir}`);
console.log(`[check-dist] Required base prefix: ${base}\n`);

if (!fs.existsSync(distDir)) {
  console.error('[check-dist] ERROR: dist directory does not exist! Run npm run build first.');
  process.exit(1);
}

let scannedFiles = 0;
let checkedUrls = 0;
const errors = [];

function isIgnoredUrl(url) {
  if (!url || typeof url !== 'string') return true;
  const u = url.trim();
  if (
    u === '' ||
    u.startsWith('#') ||
    u.startsWith('%23') ||
    u.startsWith('data:') ||
    u.startsWith('blob:')
  ) {
    return true;
  }
  if (
    u.startsWith('http://') ||
    u.startsWith('https://') ||
    u.startsWith('//') ||
    u.startsWith('mailto:') ||
    u.startsWith('tel:') ||
    u.startsWith('javascript:')
  ) {
    return true;
  }
  return false;
}

function verifyUrl(fileRel, url, source) {
  checkedUrls++;
  const cleanUrl = url.trim().split('?')[0].split('#')[0];
  const decodedUrl = decodeURIComponent(cleanUrl);

  // If URL starts with a root slash
  if (cleanUrl.startsWith('/')) {
    if (!cleanUrl.startsWith(base)) {
      errors.push({
        file: fileRel,
        url,
        reason: `Starts with root '/' without required base prefix '${base}' (${source})`
      });
      return;
    }

    // Check file existence in dist
    const relFromBase = decodedUrl.slice(base.length);
    const localTarget = path.join(distDir, relFromBase);

    // If points to directory, check for index.html
    let exists = fs.existsSync(localTarget);
    if (!exists && !path.extname(localTarget)) {
      exists = fs.existsSync(localTarget + '.html') || fs.existsSync(path.join(localTarget, 'index.html'));
    }

    if (!exists) {
      errors.push({
        file: fileRel,
        url,
        reason: `Target file not found in dist: ${path.relative(rootDir, localTarget)}`
      });
    }
  } else {
    // Relative URL (e.g. ./assets/... or style.css)
    const fileDir = path.dirname(path.join(distDir, fileRel));
    const localTarget = path.resolve(fileDir, decodedUrl);
    if (!fs.existsSync(localTarget)) {
      errors.push({
        file: fileRel,
        url,
        reason: `Relative target file not found: ${path.relative(rootDir, localTarget)}`
      });
    }
  }
}

// 1. Scan HTML files
const htmlFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.html'));
for (const htmlFile of htmlFiles) {
  scannedFiles++;
  const content = fs.readFileSync(path.join(distDir, htmlFile), 'utf8');

  // Match href, src, poster, action attributes specifically preceded by whitespace
  const attrRegex = /(?:^|\s)(?:href|src|poster|action)\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = attrRegex.exec(content)) !== null) {
    const rawUrl = match[1];
    if (isIgnoredUrl(rawUrl)) continue;
    verifyUrl(htmlFile, rawUrl, match[0]);
  }
}

// 2. Scan CSS files in dist/assets
const assetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  const cssFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.css'));
  for (const cssFile of cssFiles) {
    scannedFiles++;
    const relPath = path.join('assets', cssFile);
    const content = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');

    // Match url(...) in CSS
    const urlRegex = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
    let match;
    while ((match = urlRegex.exec(content)) !== null) {
      const rawUrl = match[1];
      if (isIgnoredUrl(rawUrl)) continue;
      verifyUrl(relPath, rawUrl, `CSS url in ${cssFile}`);
    }
  }
}

console.log(`[check-dist] Scanned ${scannedFiles} files, checked ${checkedUrls} internal URLs.`);

if (errors.length > 0) {
  console.error(`\n[check-dist] FAILED with ${errors.length} error(s):`);
  for (const err of errors) {
    console.error(`  - In [${err.file}]: ${err.url}\n    Cause: ${err.reason}`);
  }
  process.exit(1);
} else {
  console.log(`[check-dist] SUCCESS: All URLs have proper base prefix and valid target files!\n`);
  process.exit(0);
}
