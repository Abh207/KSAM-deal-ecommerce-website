import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:/Users/Abhay/.gemini/antigravity/brain/24bc4af4-e560-4625-9340-82e1ea268a28';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const errors = [];

  // 1. Desktop products page testing & capturing
  {
    const page = await browser.newPage();
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('Failed to load resource') && !text.includes('favicon')) {
          errors.push(`[Console Error] ${text}`);
        }
      }
    });
    page.on('pageerror', err => errors.push(`[Page Error] ${err.message}`));

    await page.setViewport({ width: 1400, height: 900 });
    console.log('Navigating to http://localhost:5173/products.html...');
    await page.goto('http://localhost:5173/products.html', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    // Scroll to Promo Banner
    await page.evaluate(() => {
      const banner = document.querySelector('.promo-banner-section');
      if (banner) banner.scrollIntoView({ block: 'center' });
    });
    await new Promise(r => setTimeout(r, 600));

    // Select Slide 2 (index 1)
    await page.evaluate(() => {
      const dots = document.querySelectorAll('.promo-dot');
      if (dots[1]) dots[1].click();
    });
    await new Promise(r => setTimeout(r, 800));

    const bannerSection = await page.$('.promo-banner-section');
    if (bannerSection) {
      await bannerSection.screenshot({
        path: path.join(ARTIFACTS_DIR, 'screenshot_slide2_desktop.png')
      });
      console.log('Captured screenshot_slide2_desktop.png');
    }

    // Scroll to Horizontal Products (Popular Products)
    await page.evaluate(() => {
      const popular = document.querySelector('.horizontal-products-section');
      if (popular) popular.scrollIntoView({ block: 'center' });
    });
    await new Promise(r => setTimeout(r, 800));

    const popularSection = await page.$('.horizontal-products-section');
    if (popularSection) {
      await popularSection.screenshot({
        path: path.join(ARTIFACTS_DIR, 'screenshot_product_cards_green.png')
      });
      console.log('Captured screenshot_product_cards_green.png');
    }

    // Capture single hovered product card
    const firstCard = await page.$('.horizontal-product-card');
    if (firstCard) {
      await firstCard.hover();
      await new Promise(r => setTimeout(r, 400));
      await firstCard.screenshot({
        path: path.join(ARTIFACTS_DIR, 'screenshot_product_card_hover_green.png')
      });
      console.log('Captured screenshot_product_card_hover_green.png');
    }

    await page.close();
  }

  // 2. Mobile (375px width) testing & capturing
  {
    const mobilePage = await browser.newPage();
    mobilePage.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('Failed to load resource') && !text.includes('favicon')) {
          errors.push(`[Mobile Console Error] ${text}`);
        }
      }
    });

    await mobilePage.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await mobilePage.goto('http://localhost:5173/products.html', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    // Scroll to Promo Banner
    await mobilePage.evaluate(() => {
      const banner = document.querySelector('.promo-banner-section');
      if (banner) banner.scrollIntoView({ block: 'center' });
    });
    await new Promise(r => setTimeout(r, 600));

    // Select Slide 2 (index 1)
    await mobilePage.evaluate(() => {
      const dots = document.querySelectorAll('.promo-dot');
      if (dots[1]) dots[1].click();
    });
    await new Promise(r => setTimeout(r, 800));

    const mobileBanner = await mobilePage.$('.promo-banner-section');
    if (mobileBanner) {
      await mobileBanner.screenshot({
        path: path.join(ARTIFACTS_DIR, 'screenshot_slide2_mobile_375px.png')
      });
      console.log('Captured screenshot_slide2_mobile_375px.png');
    }

    // Scroll to mobile product cards row
    await mobilePage.evaluate(() => {
      const popular = document.querySelector('.horizontal-products-section');
      if (popular) popular.scrollIntoView({ block: 'center' });
    });
    await new Promise(r => setTimeout(r, 600));

    const mobileCards = await mobilePage.$('.horizontal-products-section');
    if (mobileCards) {
      await mobileCards.screenshot({
        path: path.join(ARTIFACTS_DIR, 'screenshot_product_cards_mobile_375px.png')
      });
      console.log('Captured screenshot_product_cards_mobile_375px.png');
    }

    await mobilePage.close();
  }

  await browser.close();

  console.log('\n--- VERIFICATION REPORT ---');
  console.log('Errors logged:', errors.length);
  if (errors.length > 0) {
    console.error(errors);
  } else {
    console.log('SUCCESS: ZERO console or page errors!');
  }
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});

