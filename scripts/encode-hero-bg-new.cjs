const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpeg = 'C:\\Users\\Abhay\\OneDrive\\Desktop\\ksamHead\\node_modules\\ffmpeg-static\\ffmpeg.exe';
const input = path.resolve('public/videos/hero/gemini_generated_video_0946f84e.mp4');
const outDir = path.resolve('public/videos/hero');

console.log('--- Preparing hero_bg_new Video Files ---');

// Desktop filter:
// 1. Trim from 0.5s to 10.0s (9.5s total duration)
// 2. Black out Gemini watermark in bottom right corner (1120, 560, 160x160)
// 3. 0.3s fade in from black, 0.3s fade out to black for seamless loop without ghosting
const desktopFilter = `[0:v]trim=start=0.5:end=10.0,setpts=PTS-STARTPTS,drawbox=x=1120:y=560:w=160:h=160:color=black:t=fill,fade=t=in:st=0:d=0.3,fade=t=out:st=9.2:d=0.3,format=yuv420p[outv]`;

// Mobile filter:
// Scale to 854x480, black out watermark, fade in/out 0.3s
const mobileFilter = `[0:v]trim=start=0.5:end=10.0,setpts=PTS-STARTPTS,scale=854:480,drawbox=x=740:y=370:w=114:h=110:color=black:t=fill,fade=t=in:st=0:d=0.3,fade=t=out:st=9.2:d=0.3,format=yuv420p[outv]`;

// 1. hero_bg_new.mp4 (H.264, max 1280x720, -an, under 2 MB, +faststart)
console.log('1. Encoding hero_bg_new.mp4...');
const cmdMp4 = `"${ffmpeg}" -y -i "${input}" -filter_complex "${desktopFilter}" -map "[outv]" -an -c:v libx264 -crf 23 -preset medium -movflags +faststart "${path.join(outDir, 'hero_bg_new.mp4')}"`;
execSync(cmdMp4, { stdio: 'inherit' });

// 2. hero_bg_new.webm (VP9, max 1280x720, -an, under 2 MB)
console.log('2. Encoding hero_bg_new.webm...');
const cmdWebm = `"${ffmpeg}" -y -i "${input}" -filter_complex "${desktopFilter}" -map "[outv]" -an -c:v libvpx-vp9 -crf 32 -b:v 0 -deadline good -cpu-used 2 "${path.join(outDir, 'hero_bg_new.webm')}"`;
execSync(cmdWebm, { stdio: 'inherit' });

// 3. hero_bg_new_mobile.mp4 (H.264, 854x480, -an, under 1 MB, +faststart)
console.log('3. Encoding hero_bg_new_mobile.mp4...');
const cmdMp4Mob = `"${ffmpeg}" -y -i "${input}" -filter_complex "${mobileFilter}" -map "[outv]" -an -c:v libx264 -crf 25 -preset medium -movflags +faststart "${path.join(outDir, 'hero_bg_new_mobile.mp4')}"`;
execSync(cmdMp4Mob, { stdio: 'inherit' });

// 4. hero_bg_new_mobile.webm (VP9, 854x480, -an, under 1 MB)
console.log('4. Encoding hero_bg_new_mobile.webm...');
const cmdWebmMob = `"${ffmpeg}" -y -i "${input}" -filter_complex "${mobileFilter}" -map "[outv]" -an -c:v libvpx-vp9 -crf 34 -b:v 0 -deadline good -cpu-used 2 "${path.join(outDir, 'hero_bg_new_mobile.webm')}"`;
execSync(cmdWebmMob, { stdio: 'inherit' });

// 5. hero_bg_new_poster.webp (from 0.8s where phone is whole, clear, and glowing, watermark blacked out)
console.log('5. Extracting hero_bg_new_poster.webp...');
const cmdPoster = `"${ffmpeg}" -y -ss 00:00:00.800 -i "${input}" -vf "drawbox=x=1120:y=560:w=160:h=160:color=black:t=fill" -vframes 1 -c:v libwebp -quality 90 "${path.join(outDir, 'hero_bg_new_poster.webp')}"`;
execSync(cmdPoster, { stdio: 'inherit' });

console.log('\n--- Encoding Complete! Verifying Output Files ---');
const files = [
  'hero_bg_new.mp4',
  'hero_bg_new.webm',
  'hero_bg_new_mobile.mp4',
  'hero_bg_new_mobile.webm',
  'hero_bg_new_poster.webp'
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
