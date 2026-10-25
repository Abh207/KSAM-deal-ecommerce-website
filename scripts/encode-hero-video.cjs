const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpeg = 'C:\\Users\\Abhay\\OneDrive\\Desktop\\ksamHead\\node_modules\\ffmpeg-static\\ffmpeg.exe';
const input = path.resolve('public/videos/hero/gemini_generated_video_0946f84e.mp4');
const outDir = path.resolve('public/videos/hero');

console.log('Starting video encoding...');

// 1. hero_bg_new.mp4 (1280x720, H.264, -an, seamless 0.5s loop, watermark blacked out)
console.log('1. Encoding hero_bg_new.mp4...');
const filterGraphDesktop = `[0:v]drawbox=x=1120:y=560:w=160:h=160:color=black:t=fill,split=2[v1][v2];[v1]trim=start=0.5:end=10.0,setpts=PTS-STARTPTS[main];[v2]trim=start=0.0:end=0.5,setpts=PTS-STARTPTS[intro];[main][intro]xfade=transition=fade:duration=0.5:offset=9.0,format=yuv420p[outv]`;

const cmdMp4 = `"${ffmpeg}" -y -i "${input}" -filter_complex "${filterGraphDesktop}" -map "[outv]" -an -c:v libx264 -crf 24 -preset medium -movflags +faststart "${path.join(outDir, 'hero_bg_new.mp4')}"`;
execSync(cmdMp4, { stdio: 'inherit' });

// 2. hero_bg_new.webm (1280x720, VP9, -an, seamless loop)
console.log('2. Encoding hero_bg_new.webm...');
const cmdWebm = `"${ffmpeg}" -y -i "${input}" -filter_complex "${filterGraphDesktop}" -map "[outv]" -an -c:v libvpx-vp9 -crf 32 -b:v 0 -deadline good -cpu-used 2 "${path.join(outDir, 'hero_bg_new.webm')}"`;
execSync(cmdWebm, { stdio: 'inherit' });

// 3. hero_bg_new_mobile.mp4 (854x480, H.264, -an)
console.log('3. Encoding hero_bg_new_mobile.mp4...');
const filterGraphMobile = `[0:v]scale=854:480,drawbox=x=740:y=370:w=114:h=110:color=black:t=fill,split=2[v1][v2];[v1]trim=start=0.5:end=10.0,setpts=PTS-STARTPTS[main];[v2]trim=start=0.0:end=0.5,setpts=PTS-STARTPTS[intro];[main][intro]xfade=transition=fade:duration=0.5:offset=9.0,format=yuv420p[outv]`;

const cmdMp4Mobile = `"${ffmpeg}" -y -i "${input}" -filter_complex "${filterGraphMobile}" -map "[outv]" -an -c:v libx264 -crf 26 -preset medium -movflags +faststart "${path.join(outDir, 'hero_bg_new_mobile.mp4')}"`;
execSync(cmdMp4Mobile, { stdio: 'inherit' });

// 4. hero_bg_new_mobile.webm (854x480, VP9, -an)
console.log('4. Encoding hero_bg_new_mobile.webm...');
const cmdWebmMobile = `"${ffmpeg}" -y -i "${input}" -filter_complex "${filterGraphMobile}" -map "[outv]" -an -c:v libvpx-vp9 -crf 34 -b:v 0 -deadline good -cpu-used 2 "${path.join(outDir, 'hero_bg_new_mobile.webm')}"`;
execSync(cmdWebmMobile, { stdio: 'inherit' });

// 5. hero_bg_new_poster.webp (from 3.0s, 1280x720, clear frame, watermark blacked out)
console.log('5. Extracting hero_bg_new_poster.webp...');
const cmdPoster = `"${ffmpeg}" -y -ss 00:00:03.000 -i "${input}" -vf "drawbox=x=1120:y=560:w=160:h=160:color=black:t=fill" -vframes 1 -c:v libwebp -quality 85 "${path.join(outDir, 'hero_bg_new_poster.webp')}"`;
execSync(cmdPoster, { stdio: 'inherit' });

console.log('Encoding complete! Checking file sizes:');
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
    const stats = fs.statSync(p);
    console.log(`- ${f}: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`);
  } else {
    console.error(`- MISSING: ${f}`);
  }
});
