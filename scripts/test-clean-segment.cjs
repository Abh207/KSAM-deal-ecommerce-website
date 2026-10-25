const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpeg = 'C:\\Users\\Abhay\\OneDrive\\Desktop\\ksamHead\\node_modules\\ffmpeg-static\\ffmpeg.exe';
const input = path.resolve('public/videos/hero/gemini_generated_video_0946f84e.mp4');
const outDir = 'C:\\Users\\Abhay\\.gemini\\antigravity-ide\\brain\\93ca428a-8a8e-4beb-ba8d-becb86cad95c\\scratch\\diag_frames\\segment_inspect';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const times = [0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.3, 2.4, 2.5, 2.6];
times.forEach(t => {
  const out = path.join(outDir, `frame_${t.toFixed(1)}s.png`);
  execSync(`"${ffmpeg}" -y -ss ${t} -i "${input}" -vframes 1 "${out}"`, { stdio: 'ignore' });
});

console.log('Successfully extracted segment inspection frames!');
