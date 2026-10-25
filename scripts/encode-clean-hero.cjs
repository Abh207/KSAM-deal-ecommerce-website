const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpeg = 'C:\\Users\\Abhay\\OneDrive\\Desktop\\ksamHead\\node_modules\\ffmpeg-static\\ffmpeg.exe';
const input = path.resolve('public/videos/hero/gemini_generated_video_0946f84e.mp4');
const outDir = path.resolve('public/videos/hero');

console.log('--- Starting Clean Hero Video Encoding ---');

// Ping-pong filter graph:
// 1. Trim clean single-phone segment from 0.6s to 2.3s (1.7 seconds)
// 2. Cover watermark in bottom-right corner with pure black
// 3. Duplicate into forward [fwd] and reverse [rev]
// 4. Concatenate [fwd][rev] for a seamless 3.4-second ping-pong loop (ZERO ghosting, mathematically continuous)

const desktopFilter = `[0:v]trim=start=0.6:end=2.3,setpts=PTS-STARTPTS,drawbox=x=1120:y=560:w=160:h=160:color=black:t=fill,split=2[fwd][to_rev];[to_rev]reverse[rev];[fwd][rev]concat=n=2:v=1[outv]`;
const mobileFilter = `[0:v]trim=start=0.6:end=2.3,setpts=PTS-STARTPTS,scale=854:480,drawbox=x=740:y=370:w=114:h=110:color=black:t=fill,split=2[fwd][to_rev];[to_rev]reverse[rev];[fwd][rev]concat=n=2:v=1[outv]`;

// 1. hero_bg_clean.mp4 (1280x720, H.264, -an, faststart, CRF 22 for crisp clarity)
console.log('1. Encoding hero_bg_clean.mp4...');
const cmdMp4 = `"${ffmpeg}" -y -i "${input}" -filter_complex "${desktopFilter}" -map "[outv]" -an -c:v libx264 -crf 22 -preset medium -movflags +faststart "${path.join(outDir, 'hero_bg_clean.mp4')}"`;
execSync(cmdMp4, { stdio: 'inherit' });

// 2. hero_bg_clean.webm (1280x720, VP9, -an, CRF 30)
console.log('2. Encoding hero_bg_clean.webm...');
const cmdWebm = `"${ffmpeg}" -y -i "${input}" -filter_complex "${desktopFilter}" -map "[outv]" -an -c:v libvpx-vp9 -crf 30 -b:v 0 -deadline good -cpu-used 2 "${path.join(outDir, 'hero_bg_clean.webm')}"`;
execSync(cmdWebm, { stdio: 'inherit' });

// 3. hero_bg_clean_mobile.mp4 (854x480, H.264, -an, faststart)
console.log('3. Encoding hero_bg_clean_mobile.mp4...');
const cmdMp4Mob = `"${ffmpeg}" -y -i "${input}" -filter_complex "${mobileFilter}" -map "[outv]" -an -c:v libx264 -crf 24 -preset medium -movflags +faststart "${path.join(outDir, 'hero_bg_clean_mobile.mp4')}"`;
execSync(cmdMp4Mob, { stdio: 'inherit' });

// 4. hero_bg_clean_mobile.webm (854x480, VP9, -an)
console.log('4. Encoding hero_bg_clean_mobile.webm...');
const cmdWebmMob = `"${ffmpeg}" -y -i "${input}" -filter_complex "${mobileFilter}" -map "[outv]" -an -c:v libvpx-vp9 -crf 32 -b:v 0 -deadline good -cpu-used 2 "${path.join(outDir, 'hero_bg_clean_mobile.webm')}"`;
execSync(cmdWebmMob, { stdio: 'inherit' });

// 5. hero_bg_clean_poster.webp (from 1.0s, pristine single phone with glowing green edge, watermark covered)
console.log('5. Extracting hero_bg_clean_poster.webp...');
const cmdPoster = `"${ffmpeg}" -y -ss 00:00:01.000 -i "${input}" -vf "drawbox=x=1120:y=560:w=160:h=160:color=black:t=fill" -vframes 1 -c:v libwebp -quality 90 "${path.join(outDir, 'hero_bg_clean_poster.webp')}"`;
execSync(cmdPoster, { stdio: 'inherit' });

console.log('\n--- Encoding Complete! Verifying Output Files ---');
const files = [
  'hero_bg_clean.mp4',
  'hero_bg_clean.webm',
  'hero_bg_clean_mobile.mp4',
  'hero_bg_clean_mobile.webm',
  'hero_bg_clean_poster.webp'
];

files.forEach(f => {
  const p = path.join(outDir, f);
  if (fs.existsSync(p)) {
    const s = fs.statSync(p);
    console.log(`- ${f}: ${(s.size / 1024 / 1024).toFixed(2)} MB (${s.size} bytes)`);
  } else {
    console.error(`- MISSING: ${f}`);
  }
});
