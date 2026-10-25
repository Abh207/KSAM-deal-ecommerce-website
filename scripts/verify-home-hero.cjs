const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const viewports = [
  { width: 390, height: 844, name: '390x844-mobile' },
  { width: 768, height: 1024, name: '768x1024-tablet' },
  { width: 1024, height: 768, name: '1024x768-tablet-landscape' },
  { width: 1280, height: 720, name: '1280x720-desktop' },
  { width: 1366, height: 768, name: '1366x768-laptop' },
  { width: 1440, height: 900, name: '1440x900-macbook' },
  { width: 1536, height: 864, name: '1536x864-laptop' },
  { width: 1920, height: 1080, name: '1920x1080-fhd' }
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  const url = 'http://localhost:5173/KSAM-deal-ecommerce-website/';
  console.log('Navigating to', url);

  const results = [];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Handle splash screen if present: click SKIP or wait for it to fade
    try {
      const skipBtn = await page.waitForSelector('.splash-screen button, .splash-skip-btn, button:has-text("SKIP")', { timeout: 1500 });
      if (skipBtn) {
        await skipBtn.click();
      }
    } catch {
      // splash might have completed or not shown
    }

    // Wait for hero to be ready and splash to be removed
    await page.waitForFunction(() => !document.querySelector('.splash-screen') || window.getComputedStyle(document.querySelector('.splash-screen')).opacity === '0', { timeout: 8000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1200));

    const check = await page.evaluate((vpWidth) => {
      const hero = document.querySelector('.kh-root .hero');
      const video = document.querySelector('.kh-root .hero-video');
      const poster = document.querySelector('.kh-root .hero-poster-fallback');
      const wrapper = document.querySelector('.kh-root .hero-video-wrapper');
      const title = document.querySelector('.kh-root .hero-title');
      const shopDealsBtn = document.querySelector('#btnShopDeals');
      const ourProductsBtn = document.querySelector('#heroOurProductsBtn');
      const viewOffersBtn = document.querySelector('#btnViewOffers');
      const hugeText = document.querySelector('.kh-root .bg-huge-text');

      const isHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;

      const videoSource = video ? (video.currentSrc || video.querySelector('source')?.src || '') : '';
      const isMuted = video ? video.muted : false;
      const isAutoplaying = video ? !video.paused : false;
      const currentTime = video ? video.currentTime : 0;

      let wrapperRect = wrapper ? wrapper.getBoundingClientRect() : null;
      let titleRect = title ? title.getBoundingClientRect() : null;

      return {
        hasHero: !!hero,
        hasVideo: !!video,
        hasWrapper: !!wrapper,
        videoSource,
        isMuted,
        isAutoplaying,
        currentTime,
        isHorizontalScroll,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        wrapperWidth: wrapperRect ? wrapperRect.width : 0,
        wrapperRight: wrapperRect ? wrapperRect.right : 0,
        titleRight: titleRect ? titleRect.right : 0,
        buttonsExist: !!(shopDealsBtn && ourProductsBtn && viewOffersBtn),
        hasHugeText: !!hugeText
      };
    }, vp.width);

    console.log(`[${vp.name}] Width: ${vp.width}px`);
    console.log(`  Video src: ${check.videoSource}`);
    console.log(`  Autoplay muted: ${check.isAutoplaying && check.isMuted} (currentTime: ${check.currentTime.toFixed(2)}s)`);
    console.log(`  Horizontal scroll: ${check.isHorizontalScroll ? 'YES (FAIL)' : 'NO (PASS)'}`);
    console.log(`  Buttons exist: ${check.buttonsExist}`);

    // Take screenshot of hero
    const screenshotPath = path.resolve(`scripts/hero-home-${vp.width}.png`);
    await page.screenshot({ path: screenshotPath, clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 950) } });
    console.log(`  Saved screenshot: ${screenshotPath}`);

    results.push({ viewport: vp.name, ...check });
  }

  await browser.close();
  fs.writeFileSync(path.resolve('scripts/hero-home-results.json'), JSON.stringify(results, null, 2));
  console.log('\nAll checks completed successfully!');
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
