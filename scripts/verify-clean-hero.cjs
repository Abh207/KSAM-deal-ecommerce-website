const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\Abhay\\.gemini\\antigravity-ide\\brain\\93ca428a-8a8e-4beb-ba8d-becb86cad95c\\scratch\\diag_frames\\browser_verify';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Launching browser for Hero Clean Verification...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('ksam_splash_seen', 'true');
  });

  const url = 'http://localhost:5173/KSAM-deal-ecommerce-website/';
  console.log('Loading page:', url);

  // 1. Desktop Test at 1440x900
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.kh-root .hero-video', { timeout: 10000 });

  // Check video source URLs
  const videoSources = await page.evaluate(() => {
    const v = document.querySelector('.kh-root .hero-video');
    return {
      currentSrc: v ? v.currentSrc : null,
      poster: v ? v.poster : null,
      paused: v ? v.paused : null,
      currentTime: v ? v.currentTime : null,
      duration: v ? v.duration : null,
      videoWidth: v ? v.videoWidth : null,
      videoHeight: v ? v.videoHeight : null
    };
  });
  console.log('Desktop Video State:', videoSources);

  // Pause at multiple moments and capture screenshots to verify single clean phone
  const testMoments = [0.0, 1.0, 1.7, 2.5, 3.2];
  for (const t of testMoments) {
    await page.evaluate((time) => {
      const v = document.querySelector('.kh-root .hero-video');
      if (v) {
        v.pause();
        v.currentTime = time;
      }
    }, t);
    await new Promise(r => setTimeout(r, 200));
    await page.screenshot({ path: path.join(outDir, `desktop_1440_t${t.toFixed(1)}s.png`), clip: { x: 0, y: 0, width: 1440, height: 800 } });
  }

  // 2. Mobile Test at 390x844
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.kh-root .hero-video', { timeout: 10000 });

  const mobileMetrics = await page.evaluate(() => {
    const vWrap = document.querySelector('.kh-root .hero-video-wrapper');
    const cWrap = document.querySelector('.kh-root .hero-content-wrap');
    const title = document.querySelector('.kh-root .hero-title');
    const v = document.querySelector('.kh-root .hero-video');

    const vRect = vWrap.getBoundingClientRect();
    const cRect = cWrap.getBoundingClientRect();
    const tRect = title.getBoundingClientRect();

    return {
      currentSrc: v ? v.currentSrc : null,
      videoBottom: vRect.bottom,
      contentTop: cRect.top,
      titleTop: tRect.top,
      noOverlap: tRect.top >= vRect.bottom - 20, // Content is below video
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
    };
  });
  console.log('Mobile Metrics:', mobileMetrics);

  for (const t of testMoments) {
    await page.evaluate((time) => {
      const v = document.querySelector('.kh-root .hero-video');
      if (v) {
        v.pause();
        v.currentTime = time;
      }
    }, t);
    await new Promise(r => setTimeout(r, 200));
    await page.screenshot({ path: path.join(outDir, `mobile_390_t${t.toFixed(1)}s.png`) });
  }

  // 3. Viewport check across 390, 768, 1024, 1280, 1440, 1920
  const viewports = [390, 768, 1024, 1280, 1440, 1920];
  const vpResults = [];
  for (const w of viewports) {
    await page.setViewport({ width: w, height: 800 });
    await new Promise(r => setTimeout(r, 300));
    const res = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      overflow: document.documentElement.scrollWidth > window.innerWidth
    }));
    vpResults.push({ width: w, ...res });
    await page.screenshot({ path: path.join(outDir, `viewport_${w}px.png`), clip: { x: 0, y: 0, width: w, height: 800 } });
  }

  console.log('Viewport Results:', vpResults);
  console.log('Console Errors:', errors);

  await browser.close();
  console.log('Browser verification completed successfully!');
}

run().catch(err => {
  console.error('Error in verification:', err);
  process.exit(1);
});
