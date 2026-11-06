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
    await new Promise(r => setTimeout(r, 1500));

    // Screenshot A: Chat gone, only scroll-to-top button
    // Scroll down so the scroll-to-top button appears
    await page.evaluate(() => window.scrollTo(0, 1200));
    await new Promise(r => setTimeout(r, 800));

    const fab = await page.$('.ks-floating-actions-container');
    if (fab) {
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, 'screenshot_a_chat_gone_scroll_to_top.png'),
        clip: { x: 1250, y: 720, width: 150, height: 180 }
      });
      console.log('Captured screenshot_a_chat_gone_scroll_to_top.png');
    }

    // Screenshot B: Footer original logo
    await page.evaluate(() => {
      const footer = document.querySelector('footer, .ks-deals-footer, .home-footer');
      if (footer) footer.scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 600));
    const footerEl = await page.$('footer, .ks-deals-footer, .home-footer');
    if (footerEl) {
      await footerEl.screenshot({
        path: path.join(ARTIFACTS_DIR, 'screenshot_b_bigger_footer_logo.png')
      });
      console.log('Captured screenshot_b_bigger_footer_logo.png');
    }

    // Screenshot C: Product Card light green hover
    await page.evaluate(() => {
      const grid = document.querySelector('.home-products-grid');
      if (grid) grid.scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 600));

    const card = await page.$('.home-product-card');
    if (card) {
      await card.hover();
      await new Promise(r => setTimeout(r, 400));
      await card.screenshot({
        path: path.join(ARTIFACTS_DIR, 'screenshot_c_product_card_lightgreen_hover.png')
      });
      console.log('Captured screenshot_c_product_card_lightgreen_hover.png');
    }

    // Scroll to Promo Banner
    await page.evaluate(() => {
      const banner = document.querySelector('.promo-banner-section');
      if (banner) banner.scrollIntoView({ block: 'center' });
    });
    await new Promise(r => setTimeout(r, 600));

    const bannerSection = await page.$('.promo-banner-section');
    if (bannerSection) {
      // Screenshot D1: Slide 1 Desktop
      await page.evaluate(() => {
        const dots = document.querySelectorAll('.promo-dot');
        if (dots[0]) dots[0].click();
      });
      await new Promise(r => setTimeout(r, 600));
      await bannerSection.screenshot({
        path: path.join(ARTIFACTS_DIR, 'screenshot_d1_banner_desktop_slide1.png')
      });
      console.log('Captured screenshot_d1_banner_desktop_slide1.png');

      // Screenshot D2: Slide 2 Desktop
      await page.evaluate(() => {
        const dots = document.querySelectorAll('.promo-dot');
        if (dots[1]) dots[1].click();
      });
      await new Promise(r => setTimeout(r, 600));
      await bannerSection.screenshot({
        path: path.join(ARTIFACTS_DIR, 'screenshot_d2_banner_desktop_slide2.png')
      });
      console.log('Captured screenshot_d2_banner_desktop_slide2.png');

      // Screenshot D3: Slide 3 Desktop
      await page.evaluate(() => {
        const dots = document.querySelectorAll('.promo-dot');
        if (dots[2]) dots[2].click();
      });
      await new Promise(r => setTimeout(r, 600));
      await bannerSection.screenshot({
        path: path.join(ARTIFACTS_DIR, 'screenshot_d3_banner_desktop_slide3.png')
      });
      console.log('Captured screenshot_d3_banner_desktop_slide3.png');
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
    await new Promise(r => setTimeout(r, 1500));

    // Scroll to Promo Banner
    await mobilePage.evaluate(() => {
      const banner = document.querySelector('.promo-banner-section');
      if (banner) banner.scrollIntoView({ block: 'center' });
    });
    await new Promise(r => setTimeout(r, 600));

    const mobileBanner = await mobilePage.$('.promo-banner-section');
    if (mobileBanner) {
      // Mobile Slide 1
      await mobilePage.evaluate(() => {
        const dots = document.querySelectorAll('.promo-dot');
        if (dots[0]) dots[0].click();
      });
      await new Promise(r => setTimeout(r, 600));
      await mobileBanner.screenshot({
        path: path.join(ARTIFACTS_DIR, 'screenshot_d4_banner_mobile_slide1_375px.png')
      });
      console.log('Captured screenshot_d4_banner_mobile_slide1_375px.png');

      // Mobile Slide 2
      await mobilePage.evaluate(() => {
        const dots = document.querySelectorAll('.promo-dot');
        if (dots[1]) dots[1].click();
      });
      await new Promise(r => setTimeout(r, 600));
      await mobileBanner.screenshot({
        path: path.join(ARTIFACTS_DIR, 'screenshot_d5_banner_mobile_slide2_375px.png')
      });
      console.log('Captured screenshot_d5_banner_mobile_slide2_375px.png');

      // Mobile Slide 3
      await mobilePage.evaluate(() => {
        const dots = document.querySelectorAll('.promo-dot');
        if (dots[2]) dots[2].click();
      });
      await new Promise(r => setTimeout(r, 600));
      await mobileBanner.screenshot({
        path: path.join(ARTIFACTS_DIR, 'screenshot_d6_banner_mobile_slide3_375px.png')
      });
      console.log('Captured screenshot_d6_banner_mobile_slide3_375px.png');
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
