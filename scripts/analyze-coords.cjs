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

  const bboxes = await page.evaluate(() => {
    const img = document.getElementById('src');
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, img.width, img.height).data;

    // Mug has "Let's Connect" text at bottom left of boy
    // Check where "Let's Connect" is:
    let mugMinX = 9999, mugMaxX = 0, mugMinY = 9999, mugMaxY = 0;
    for (let y = 700; y < 887; y++) {
      for (let x = 300; x < 600; x++) {
        const i = (y * img.width + x) * 4;
        // Mug text is black
        if (d[i] < 40 && d[i+1] < 40 && d[i+2] < 40) {
          if (x < mugMinX) mugMinX = x;
          if (x > mugMaxX) mugMaxX = x;
          if (y < mugMinY) mugMinY = y;
          if (y > mugMaxY) mugMaxY = y;
        }
      }
    }

    // Where is the blue bubble? (blue color: b > 200, r < 100)
    let bBubbleMinX = 9999, bBubbleMaxX = 0, bBubbleMinY = 9999;
    for (let y = 100; y < 400; y++) {
      for (let x = 500; x < 900; x++) {
        const i = (y * img.width + x) * 4;
        if (d[i] < 60 && d[i+1] > 120 && d[i+2] > 220) {
          if (x < bBubbleMinX) bBubbleMinX = x;
          if (x > bBubbleMaxX) bBubbleMaxX = x;
          if (y < bBubbleMinY) bBubbleMinY = y;
        }
      }
    }

    // Where is the airplane?
    let planeMinX = 9999, planeMinY = 9999;
    for (let y = 50; y < 250; y++) {
      for (let x = 600; x < 920; x++) {
        const i = (y * img.width + x) * 4;
        if (d[i] < 120 && d[i+1] > 140 && d[i+2] > 230) {
          if (x < planeMinX) planeMinX = x;
          if (y < planeMinY) planeMinY = y;
        }
      }
    }

    return {
      mug: { mugMinX, mugMaxX, mugMinY, mugMaxY },
      bBubble: { bBubbleMinX, bBubbleMaxX, bBubbleMinY },
      plane: { planeMinX, planeMinY }
    };
  });

  console.log('Bounding boxes in message.png:', JSON.stringify(bboxes, null, 2));
  await browser.close();
})();
