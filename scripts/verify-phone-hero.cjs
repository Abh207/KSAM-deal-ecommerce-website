const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const testCases = [
  // Mobile Portrait
  { width: 320, height: 600, name: '320px-portrait' },
  { width: 360, height: 740, name: '360px-portrait' },
  { width: 390, height: 844, name: '390px-portrait' },
  { width: 412, height: 915, name: '412px-portrait' },
  { width: 600, height: 960, name: '600px-portrait' },
  // Mobile Landscape (width <= 767px)
  { width: 667, height: 375, name: '667x375-landscape' },
  { width: 736, height: 414, name: '736x414-landscape' },
  // Tablet and Desktop (width >= 768px)
  { width: 768, height: 1024, name: '768px-tablet' },
  { width: 1024, height: 768, name: '1024px-tablet-landscape' },
  { width: 1280, height: 720, name: '1280px-desktop' },
  { width: 1440, height: 900, name: '1440px-macbook' },
  { width: 1920, height: 1080, name: '1920px-fhd' }
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('ksam_splash_seen', 'true');
  });

  const url = 'http://localhost:5173/KSAM-deal-ecommerce-website/';
  console.log('Navigating to', url);

  const results = [];

  for (const tc of testCases) {
    await page.setViewport({ width: tc.width, height: tc.height });
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.kh-root .hero', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1400));

    const metrics = await page.evaluate((isPhone) => {
      const hero = document.querySelector('.kh-root .hero');
      const videoWrapper = document.querySelector('.kh-root .hero-video-wrapper');
      const video = document.querySelector('.kh-root .hero-video');
      const contentWrap = document.querySelector('.kh-root .hero-content-wrap');
      const title = document.querySelector('.kh-root .hero-title');
      const pill = document.querySelector('.kh-root .hero-badge-pill');
      const shopBtn = document.querySelector('#btnShopDeals');
      const ourProductsBtn = document.querySelector('#heroOurProductsBtn');
      const viewOffersBtn = document.querySelector('#btnViewOffers');

      const vRect = videoWrapper ? videoWrapper.getBoundingClientRect() : null;
      const cRect = contentWrap ? contentWrap.getBoundingClientRect() : null;
      const tRect = title ? title.getBoundingClientRect() : null;
      const pRect = pill ? pill.getBoundingClientRect() : null;
      const hRect = hero ? hero.getBoundingClientRect() : null;

      const isHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;
      const videoCurrentTime = video ? video.currentTime : 0;
      const videoPlaying = video ? !video.paused : false;

      // On phone: video bottom should be at or before content top (stacked, no text overlay)
      let videoOverlapWithText = false;
      if (isPhone && vRect && pRect) {
        // Pill is the top-most content element. If pill.top is substantially above video.bottom, it overlaps.
        videoOverlapWithText = pRect.top < (vRect.bottom - 20);
      }

      return {
        heroHeight: hRect ? hRect.height : 0,
        videoBottom: vRect ? vRect.bottom : 0,
        contentTop: cRect ? cRect.top : 0,
        pillTop: pRect ? pRect.top : 0,
        titleTop: tRect ? tRect.top : 0,
        videoOverlapWithText,
        isHorizontalScroll,
        videoPlaying,
        videoCurrentTime,
        buttonsReady: !!(shopBtn && ourProductsBtn && viewOffersBtn)
      };
    }, tc.width <= 767);

    console.log(`[${tc.name}] Width: ${tc.width}px`);
    console.log(`  Stacked (no text over video): ${!metrics.videoOverlapWithText}`);
    console.log(`  Video bottom: ${metrics.videoBottom.toFixed(1)}px, Pill top: ${metrics.pillTop.toFixed(1)}px`);
    console.log(`  Autoplay: ${metrics.videoPlaying} (currentTime: ${metrics.videoCurrentTime.toFixed(2)}s)`);
    console.log(`  Horizontal scroll: ${metrics.isHorizontalScroll ? 'FAIL' : 'PASS'}`);

    const screenshotPath = path.resolve(`scripts/phone-test-${tc.name}.png`);
    await page.screenshot({
      path: screenshotPath,
      clip: { x: 0, y: 0, width: tc.width, height: Math.min(Math.round(metrics.heroHeight + 60), 1200) }
    });
    console.log(`  Screenshot saved: ${screenshotPath}\n`);

    results.push({ name: tc.name, ...metrics });
  }

  await browser.close();
  fs.writeFileSync(path.resolve('scripts/phone-test-results.json'), JSON.stringify(results, null, 2));
  console.log('All phone test cases completed!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
