const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpeg = 'C:\\Users\\Abhay\\OneDrive\\Desktop\\ksamHead\\node_modules\\ffmpeg-static\\ffmpeg.exe';
const input = path.resolve('public/videos/hero/hero_bg_clean.mp4');
const outDir = 'C:\\Users\\Abhay\\.gemini\\antigravity-ide\\brain\\93ca428a-8a8e-4beb-ba8d-becb86cad95c\\scratch\\diag_frames\\clean_test';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const times = [0.0, 0.8, 1.7, 2.5, 3.2];
times.forEach(t => {
  const out = path.join(outDir, `clean_${t.toFixed(1)}s.png`);
  execSync(`"${ffmpeg}" -y -ss ${t} -i "${input}" -vframes 1 "${out}"`, { stdio: 'ignore' });
});

console.log('Clean test frames extracted successfully.');
