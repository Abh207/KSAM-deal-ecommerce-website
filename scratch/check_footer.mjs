import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto('http://localhost:5173/products.html', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const footer = document.querySelector('footer, .ks-deals-footer, .home-footer');
    if (footer) footer.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));

  const logo = await page.$('.ks-footer-brand-logo, .home-footer-brand img, footer img[alt="KSAM Deal"]');
  if (logo) {
    const brandCol = await page.evaluateHandle(el => el.closest('.ks-footer-col-brand, .ks-footer-col, .footer-col, .home-footer-brand') || el.parentElement.parentElement, logo);
    await brandCol.screenshot({
      path: 'C:/Users/Abhay/.gemini/antigravity/brain/24bc4af4-e560-4625-9340-82e1ea268a28/screenshot_b_bigger_footer_logo.png'
    });
    console.log('Saved focused brand col screenshot_b_bigger_footer_logo.png');
  }

  await browser.close();
})();
