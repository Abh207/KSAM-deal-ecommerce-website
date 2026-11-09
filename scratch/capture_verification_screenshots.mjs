import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Abhay\\.gemini\\antigravity\\brain\\24bc4af4-e560-4625-9340-82e1ea268a28';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();

    // 1. Products page Desktop (1280px) - 4 cols
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://localhost:5173/products.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.home-products-grid', { timeout: 8000 });
    await page.evaluate(() => {
      const nav = document.getElementById('navbar') || document.querySelector('header');
      if (nav) nav.style.display = 'none';
    });
    await new Promise(r => setTimeout(r, 600));
    const prodGridDesktop = await page.$('.home-products-grid');
    if (prodGridDesktop) {
      await prodGridDesktop.screenshot({
        path: path.join(ARTIFACT_DIR, 'task1_products_grid_4cols_desktop.png')
      });
      console.log('Saved task1_products_grid_4cols_desktop.png');
    }

    // 2. Products page Mobile (375px) - 2 cols
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
    await page.goto('http://localhost:5173/products.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.home-products-grid', { timeout: 8000 });
    await page.evaluate(() => {
      const nav = document.getElementById('navbar') || document.querySelector('header');
      if (nav) nav.style.display = 'none';
      document.querySelectorAll('.kh-nav-mobile-drawer, .kh-nav-cart-drawer, .mobile-menu-drawer').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('is-open');
      });
    });
    await new Promise(r => setTimeout(r, 600));
    const prodGridMobile = await page.$('.home-products-grid');
    if (prodGridMobile) {
      await prodGridMobile.screenshot({
        path: path.join(ARTIFACT_DIR, 'task1_products_grid_2cols_mobile.png')
      });
      console.log('Saved task1_products_grid_2cols_mobile.png');
    }

    // 3. Wishlist "You May Also Like" Section Desktop (1280px)
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://localhost:5173/watchwishlist.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.kx-rec-section', { timeout: 8000 });
    await page.evaluate(() => {
      const header = document.querySelector('.kx-rec-header');
      if (header) {
        header.classList.add('is-visible');
        header.style.opacity = '1';
        header.style.transform = 'none';
      }
    });
    await new Promise(r => setTimeout(r, 600));
    const recSectionDesktop = await page.$('.kx-rec-section');
    if (recSectionDesktop) {
      await recSectionDesktop.screenshot({
        path: path.join(ARTIFACT_DIR, 'task2_you_may_also_like_desktop.png')
      });
      console.log('Saved task2_you_may_also_like_desktop.png');
    }

    // 4. Wishlist "You May Also Like" Section Mobile (375px)
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
    await page.goto('http://localhost:5173/watchwishlist.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.kx-rec-section', { timeout: 8000 });
    await page.evaluate(() => {
      const header = document.querySelector('.kx-rec-header');
      if (header) {
        header.classList.add('is-visible');
        header.style.opacity = '1';
        header.style.transform = 'none';
      }
    });
    await new Promise(r => setTimeout(r, 600));
    const recSectionMobile = await page.$('.kx-rec-section');
    if (recSectionMobile) {
      await recSectionMobile.screenshot({
        path: path.join(ARTIFACT_DIR, 'task2_you_may_also_like_mobile.png')
      });
      console.log('Saved task2_you_may_also_like_mobile.png');
    }

    console.log('All verification screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

main().catch(console.error);

