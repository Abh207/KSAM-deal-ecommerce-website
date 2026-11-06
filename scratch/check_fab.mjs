import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto('http://localhost:5173/products.html', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 1600));
  await new Promise(r => setTimeout(r, 800));

  const fab = await page.$('.ks-floating-actions-container');
  const box = await fab.boundingBox();
  console.log('FAB box:', box);

  const btn = await page.$('.ks-scroll-top-btn');
  const btnBox = await btn.boundingBox();
  console.log('Scroll top btn box:', btnBox);

  // Take screenshot of bottom-right 220x220 corner
  await page.screenshot({
    path: 'C:/Users/Abhay/.gemini/antigravity/brain/24bc4af4-e560-4625-9340-82e1ea268a28/screenshot_a_chat_gone_scroll_to_top.png',
    clip: { x: 1400 - 180, y: 900 - 180, width: 180, height: 180 }
  });
  console.log('Saved updated screenshot_a_chat_gone_scroll_to_top.png');

  await browser.close();
})();
