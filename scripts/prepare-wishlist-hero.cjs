const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function processImage() {
  const srcImage = 'C:\\Users\\Abhay\\.gemini\\antigravity-ide\\brain\\76e238c0-473c-447b-ac5e-1ebb7eb83297\\wishlist_hero_white_1793017563134.jpg';
  const imgData = fs.readFileSync(srcImage);
  const base64 = `data:image/jpeg;base64,${imgData.toString('base64')}`;

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0; background:transparent;">
        <canvas id="c"></canvas>
      </body>
    </html>
  `;
  await page.setContent(html);

  const pngBase64 = await page.evaluate(async (dataUri) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.getElementById('c');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Turn background near-white pixels transparent, preserving shadow smoothly
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Check if pixel is white / off-white background
          // Light background in the generated image is ~ #f6f8fb to #ffffff
          const min = Math.min(r, g, b);
          const max = Math.max(r, g, b);
          const diff = max - min;

          // Pure or tinted light background
          if (r > 240 && g > 240 && b > 240 && diff < 15) {
            // High white background: make transparent
            const brightness = (r + g + b) / 3;
            if (brightness >= 250) {
              data[i + 3] = 0;
            } else {
              // Smooth edge
              const alpha = (250 - brightness) / 10;
              data[i + 3] = Math.max(0, Math.min(255, Math.round(alpha * 255)));
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = dataUri;
    });
  }, base64);

  await browser.close();

  const buffer = Buffer.from(pngBase64.replace(/^data:image\/png;base64,/, ''), 'base64');

  const targets = [
    path.resolve(__dirname, '../public/assets/images/wishlist-hero.png'),
    path.resolve(__dirname, '../src/assets/images/wishlist-hero.png'),
    path.resolve(__dirname, '../assets/images/wishlist-hero.png')
  ];

  targets.forEach((target) => {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, buffer);
    console.log('Saved to:', target);
  });
}

processImage().catch(console.error);
