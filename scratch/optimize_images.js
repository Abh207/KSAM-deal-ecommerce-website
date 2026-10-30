import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const BACKUP_DIR = 'backups/images_original';

function getAllImages(dir, all = []) {
  if (!fs.existsSync(dir)) return all;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const s = fs.statSync(full);
    if (s.isDirectory()) {
      if (f !== 'node_modules' && f !== 'dist' && f !== 'backups' && f !== '.git') {
        getAllImages(full, all);
      }
    } else {
      const ext = path.extname(f).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        all.push({ full, size: s.size, ext, name: f });
      }
    }
  }
  return all;
}

async function optimizeImages() {
  const images = [...getAllImages('public'), ...getAllImages('src/assets')];
  console.log(`Found ${images.length} images to inspect.`);

  let totalBefore = 0;
  let totalAfter = 0;
  let processedCount = 0;

  for (const img of images) {
    const rel = path.relative('.', img.full);
    // Ignore small icons or favicons under 20KB
    if (img.size < 20 * 1024 && !rel.includes('hero') && !rel.includes('banner')) {
      continue;
    }

    totalBefore += img.size;

    // Backup original
    const backupPath = path.join(BACKUP_DIR, rel);
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(img.full, backupPath);
    }

    // Determine target dimensions
    let maxWidth = 1200;
    if (rel.includes('hero') || rel.includes('banner') || rel.includes('flashSale')) {
      maxWidth = 1600;
    } else if (rel.includes('products') || rel.includes('chair') || rel.includes('cloth') || rel.includes('moreprod')) {
      maxWidth = 800;
    }

    try {
      const metadata = await sharp(img.full).metadata();
      const currentWidth = metadata.width || maxWidth;
      const targetWidth = Math.min(currentWidth, maxWidth);

      // Generate .webp sibling
      const webpPath = img.full.substring(0, img.full.lastIndexOf('.')) + '.webp';
      await sharp(img.full)
        .resize({ width: targetWidth, withoutEnlargement: true })
        .webp({ quality: 80, effort: 5 })
        .toFile(webpPath + '.tmp');

      if (fs.existsSync(webpPath + '.tmp')) {
        fs.renameSync(webpPath + '.tmp', webpPath);
      }

      // Re-compress the original format in-place so fallback / direct URL loads stay small
      if (img.ext === '.png') {
        await sharp(img.full)
          .resize({ width: targetWidth, withoutEnlargement: true })
          .png({ quality: 80, compressionLevel: 8 })
          .toFile(img.full + '.tmp');
      } else {
        await sharp(img.full)
          .resize({ width: targetWidth, withoutEnlargement: true })
          .jpeg({ quality: 80, mozjpeg: true })
          .toFile(img.full + '.tmp');
      }

      if (fs.existsSync(img.full + '.tmp')) {
        fs.renameSync(img.full + '.tmp', img.full);
      }

      const newSize = fs.statSync(img.full).size;
      const webpSize = fs.existsSync(webpPath) ? fs.statSync(webpPath).size : newSize;
      totalAfter += webpSize;
      processedCount++;

      console.log(`Optimized ${rel}: ${(img.size / 1024).toFixed(1)} KB -> WebP: ${(webpSize / 1024).toFixed(1)} KB (in-place: ${(newSize / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`Error processing ${rel}:`, err.message);
      totalAfter += img.size;
    }
  }

  console.log(`\n=== IMAGE OPTIMIZATION SUMMARY ===`);
  console.log(`Processed: ${processedCount} images`);
  console.log(`Total original size: ${(totalBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total optimized size: ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Saved: ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(2)} MB (${Math.round((1 - totalAfter / totalBefore) * 100)}% reduction)`);
}

optimizeImages().catch(console.error);
