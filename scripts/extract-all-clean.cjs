const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpeg = 'C:\\Users\\Abhay\\OneDrive\\Desktop\\ksamHead\\node_modules\\ffmpeg-static\\ffmpeg.exe';
const input = path.resolve('public/videos/hero/hero_bg_clean.mp4');
const outDir = 'C:\\Users\\Abhay\\.gemini\\antigravity-ide\\brain\\93ca428a-8a8e-4beb-ba8d-becb86cad95c\\scratch\\diag_frames\\all_clean_frames';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (let t = 0; t <= 3.4; t += 0.2) {
  const out = path.join(outDir, `frame_${t.toFixed(1)}s.png`);
  execSync(`"${ffmpeg}" -y -ss ${t.toFixed(1)} -i "${input}" -vframes 1 "${out}"`, { stdio: 'ignore' });
}
console.log('All frames extracted');
