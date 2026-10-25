const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  const imgBuf = fs.readFileSync(path.resolve(__dirname, '../public/contact/message.png'));
  const dataUri = 'data:image/png;base64,' + imgBuf.toString('base64');

  await page.setContent('<img id="src" src="' + dataUri + '" />');
  await page.evaluate(async () => {
    const img = document.getElementById('src');
    if (!img.complete) await new Promise(r => img.onload = r);
  });

  const cleanedData = await page.evaluate(() => {
    const img = document.getElementById('src');
    const canvas = document.createElement('canvas');
    const sx = 430, sy = 60, sw = 475, sh = 827;
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    const imgData = ctx.getImageData(0, 0, sw, sh);
    const d = imgData.data;

    // For cy <= 315: the boy's hair has not started yet. Blue bubble is at x >= 240.
    // So cutoff = 200 clears all paragraph text cleanly!
    // For cy > 315 and cy < 380: boy's hair tuft starts around x = 86..100.
    // So cutoff = 82 safely clears any edge pixel without touching hair.
    for (let cy = 0; cy < 380; cy++) {
      let cutoff = 200;
      if (cy > 315) {
        cutoff = 80;
      }

      for (let cx = 0; cx < cutoff; cx++) {
        const i = (cy * sw + cx) * 4;
        if (cx <= cutoff - 12) {
          d[i + 3] = 0;
        } else {
          const factor = (cx - (cutoff - 12)) / 12;
          d[i + 3] = Math.round(d[i + 3] * factor);
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  });

  const b64 = cleanedData.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(path.resolve(__dirname, '../public/contact/message_character.png'), b64, 'base64');
  console.log('Saved 100% clean message_character.png with perfect cutoff');
  await browser.close();
})();
