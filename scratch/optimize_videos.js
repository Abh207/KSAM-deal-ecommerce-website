import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';

const BACKUP_DIR = 'backups/videos_original';

// Videos actively used in pages or in public/assets/videos and public/videos
const TARGET_VIDEOS = [
  'public/assets/videos/watches-banner.mp4',
  'src/assets/videos/watches-banner.mp4',
  'assets/videos/watches-banner.mp4',
  'public/assets/videos/watches-hero.mp4',
  'assets/videos/watches-hero.mp4',
  'public/assets/videos/electronics-banner.mp4',
  'assets/videos/electronics-banner.mp4',
  'public/assets/videos/Gaming_mouse_exploded_view_eb900f91.mp4',
  'assets/videos/Gaming_mouse_exploded_view_eb900f91.mp4',
  'public/videos/electronics-category-bg.mp4',
  'public/assets/videos/Skincare_bottle_product_animation_20261027193838.mp4',
  'assets/videos/Skincare_bottle_product_animation_20261027193838.mp4',
  'public/assets/videos/shoes-banner.mp4',
  'assets/videos/shoes-banner.mp4',
  'src/assets/videos/shoes-banner.mp4',
  'public/assets/videos/chairs-bed.mp4',
  'assets/videos/chairs-bed.mp4',
  'public/videos/hero-keyboard.mp4',
  'src/assets/videos/hero-keyboard.mp4',
  'public/videos/products/products_hero.mp4',
  'public/assets/videos/shoes-hero.mp4',
  'assets/videos/shoes-hero.mp4',
  'src/assets/videos/shoes-hero.mp4',
  'public/assets/videos/electronics-bg.mp4',
  'assets/videos/electronics-bg.mp4',
  'public/assets/videos/shoes-bg.mp4',
  'assets/videos/shoes-bg.mp4',
  'public/assets/videos/watches-bg.mp4',
  'assets/videos/watches-bg.mp4',
  'public/assets/videos/audio-bg.mp4',
  'assets/videos/audio-bg.mp4',
  'public/assets/videos/electronics-bg-2.mp4',
  'assets/videos/electronics-bg-2.mp4',
  'public/videos/hero/hero_bg_new.mp4',
  'public/ksamhead/video/iphone-explode.mp4'
];

async function optimizeVideo(videoRel) {
  const fullPath = path.resolve(videoRel);
  if (!fs.existsSync(fullPath)) return;

  const originalSize = fs.statSync(fullPath).size;
  console.log(`\nOptimizing ${videoRel} (${(originalSize / 1024 / 1024).toFixed(2)} MB)...`);

  // Backup
  const backupPath = path.join(BACKUP_DIR, videoRel);
  if (!fs.existsSync(path.dirname(backupPath))) {
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  }
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(fullPath, backupPath);
  }

  const dir = path.dirname(fullPath);
  const ext = path.extname(fullPath);
  const baseName = path.basename(fullPath, ext);

  // 1. Generate WebP Poster if missing or over 50KB
  const posterPath = path.join(dir, `${baseName}-poster.webp`);
  const tempPosterJpg = path.join(dir, `${baseName}-temp.jpg`);
  try {
    execFileSync(ffmpegPath, [
      '-y', '-ss', '00:00:00.8', '-i', fullPath,
      '-vframes', '1', '-q:v', '2', tempPosterJpg
    ], { stdio: 'ignore' });

    if (fs.existsSync(tempPosterJpg)) {
      await sharp(tempPosterJpg)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(posterPath);
      try { fs.unlinkSync(tempPosterJpg); } catch {}
      console.log(`Generated poster: ${baseName}-poster.webp (${(fs.statSync(posterPath).size / 1024).toFixed(1)} KB)`);
    }
  } catch (err) {
    console.warn(`Poster generation warning for ${baseName}:`, err.message);
  }

  // 2. Re-encode 720p Desktop MP4 (crf 29, max 1280w, fps 24, faststart, no audio)
  const tempDesktopMp4 = path.join(dir, `${baseName}_d_temp.mp4`);
  try {
    execFileSync(ffmpegPath, [
      '-y', '-i', backupPath,
      '-an',
      '-vf', "scale='min(1280,iw)':-2,fps=24",
      '-c:v', 'libx264',
      '-crf', '29',
      '-preset', 'fast',
      '-movflags', '+faststart',
      tempDesktopMp4
    ], { stdio: 'ignore' });

    if (fs.existsSync(tempDesktopMp4)) {
      fs.copyFileSync(tempDesktopMp4, fullPath);
      fs.unlinkSync(tempDesktopMp4);
      const newSize = fs.statSync(fullPath).size;
      console.log(`Re-encoded desktop MP4: ${(originalSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024 / 1024).toFixed(2)} MB`);
    }
  } catch (err) {
    console.warn(`Desktop MP4 re-encode failed for ${baseName}:`, err.message);
  }

  // 3. Re-encode 480p Mobile MP4 (crf 30, max 720w, fps 24, faststart, no audio)
  const mobileMp4Path = path.join(dir, `${baseName}_mobile.mp4`);
  try {
    execFileSync(ffmpegPath, [
      '-y', '-i', backupPath,
      '-an',
      '-vf', "scale='min(720,iw)':-2,fps=24",
      '-c:v', 'libx264',
      '-crf', '30',
      '-preset', 'fast',
      '-movflags', '+faststart',
      mobileMp4Path
    ], { stdio: 'ignore' });

    if (fs.existsSync(mobileMp4Path)) {
      const mobSize = fs.statSync(mobileMp4Path).size;
      console.log(`Generated mobile MP4: ${(mobSize / 1024 / 1024).toFixed(2)} MB`);
    }
  } catch (err) {
    console.warn(`Mobile MP4 re-encode failed for ${baseName}:`, err.message);
  }
}

async function run() {
  const seen = new Set();
  for (const rel of TARGET_VIDEOS) {
    if (seen.has(rel)) continue;
    seen.add(rel);
    await optimizeVideo(rel);
  }
  console.log('\n=== ALL TARGET VIDEOS OPTIMIZED ===');
}

run().catch(console.error);
