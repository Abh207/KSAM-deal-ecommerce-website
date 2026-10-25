const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Test at 1440px
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto('http://localhost:5173/KSAM-deal-ecommerce-website/contact-us.html', {
    waitUntil: 'networkidle2',
    timeout: 20000
  });

  await page.evaluate(() => {
    const el = document.getElementById('contact-form-section');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 1000));

  let secEl = await page.$('#contact-form-section');
  if (secEl) await secEl.screenshot({ path: 'scripts/contact-section-1440px.png' });

  // 1280px
  await page.setViewport({ width: 1280, height: 950 });
  await new Promise(r => setTimeout(r, 400));
  secEl = await page.$('#contact-form-section');
  if (secEl) await secEl.screenshot({ path: 'scripts/contact-section-1280px.png' });

  // 1024px
  await page.setViewport({ width: 1024, height: 950 });
  await new Promise(r => setTimeout(r, 400));
  secEl = await page.$('#contact-form-section');
  if (secEl) await secEl.screenshot({ path: 'scripts/contact-section-1024px.png' });

  // 768px
  await page.setViewport({ width: 768, height: 1100 });
  await new Promise(r => setTimeout(r, 400));
  secEl = await page.$('#contact-form-section');
  if (secEl) await secEl.screenshot({ path: 'scripts/contact-section-768px.png' });

  // 390px
  await page.setViewport({ width: 390, height: 1200 });
  await new Promise(r => setTimeout(r, 400));
  secEl = await page.$('#contact-form-section');
  if (secEl) await secEl.screenshot({ path: 'scripts/contact-section-390px.png' });

  console.log('Saved all screenshots!');
  await browser.close();
})();
