const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\Abhay\\.gemini\\antigravity-ide\\brain\\93ca428a-8a8e-4beb-ba8d-becb86cad95c\\scratch\\diag_frames\\hero_new_verify';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Relative luminance helper
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrast(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function run() {
  console.log('--- Starting Full Hero Loop Verification ---');
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
  console.log('Navigating to:', url);

  // 1. Desktop Test at 1440x900
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.kh-root .hero-video', { timeout: 10000 });

  const videoMeta = await page.evaluate(() => {
    const v = document.querySelector('.kh-root .hero-video');
    const sources = Array.from(v.querySelectorAll('source')).map(s => ({
      src: s.src,
      type: s.type,
      media: s.media
    }));
    return {
      currentSrc: v.currentSrc,
      poster: v.poster,
      autoplay: v.autoplay,
      muted: v.muted,
      defaultMuted: v.defaultMuted,
      loop: v.loop,
      playsInline: v.playsInline,
      duration: v.duration,
      sources
    };
  });

  console.log('Desktop Video Metadata:', videoMeta);

  // Check moments: 0, 2, 4, 6, 8, 9.5 seconds
  const testMoments = [0, 2, 4, 6, 8, 9.5];
  const contrastResults = [];

  for (const t of testMoments) {
    await page.evaluate((time) => {
      const v = document.querySelector('.kh-root .hero-video');
      if (v) {
        v.pause();
        v.currentTime = time;
      }
    }, t);
    await new Promise(r => setTimeout(r, 250));

    // Measure contrast on heading, rotating prefix, subtitle, and buttons
    const metrics = await page.evaluate(() => {
      const title = document.querySelector('.kh-root .hero-title');
      const rotLine = document.querySelector('.kh-root .hero-rotating-line');
      const sub = document.querySelector('.kh-root .hero-subtitle');
      const shopBtn = document.querySelector('#btnShopDeals');
      const ourProdBtn = document.querySelector('#heroOurProductsBtn');

      function getEffectiveBg(el) {
        let cur = el;
        while (cur && cur !== document.body) {
          const bg = window.getComputedStyle(cur).backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
          cur = cur.parentElement;
        }
        return 'rgb(1, 2, 4)';
      }

      return {
        titleColor: window.getComputedStyle(title).color,
        rotLineColor: window.getComputedStyle(rotLine).color,
        subColor: window.getComputedStyle(sub).color,
        shopBtnBg: window.getComputedStyle(shopBtn).backgroundColor,
        ourProdBg: window.getComputedStyle(ourProdBtn).backgroundColor
      };
    });

    contrastResults.push({ moment: `${t}s`, metrics });

    await page.screenshot({
      path: path.join(outDir, `desktop_1440_t${t}s.png`),
      clip: { x: 0, y: 0, width: 1440, height: 850 }
    });
  }

  console.log('Contrast Check Sample:', contrastResults);

  // 2. Mobile 390px Check
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.kh-root .hero-video', { timeout: 10000 });

  const mobileCheck = await page.evaluate(() => {
    const v = document.querySelector('.kh-root .hero-video');
    const vWrap = document.querySelector('.kh-root .hero-video-wrapper');
    const cWrap = document.querySelector('.kh-root .hero-content-wrap');
    const title = document.querySelector('.kh-root .hero-title');

    const vRect = vWrap.getBoundingClientRect();
    const cRect = cWrap.getBoundingClientRect();
    const tRect = title.getBoundingClientRect();

    return {
      currentSrc: v.currentSrc,
      videoHeight: vRect.height,
      contentTop: cRect.top,
      titleTop: tRect.top,
      isStackedBelowVideo: tRect.top >= vRect.bottom - 20,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth
    };
  });

  console.log('Mobile Check (390px):', mobileCheck);

  for (const t of [0, 4, 8]) {
    await page.evaluate((time) => {
      const v = document.querySelector('.kh-root .hero-video');
      if (v) {
        v.pause();
        v.currentTime = time;
      }
    }, t);
    await new Promise(r => setTimeout(r, 200));
    await page.screenshot({ path: path.join(outDir, `mobile_390_t${t}s.png`) });
  }

  // 3. Viewports 390, 768, 1024, 1280, 1440, 1920
  const viewports = [390, 768, 1024, 1280, 1440, 1920];
  const vpResults = [];
  for (const w of viewports) {
    await page.setViewport({ width: w, height: 850 });
    await new Promise(r => setTimeout(r, 200));
    const res = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      overflow: document.documentElement.scrollWidth > window.innerWidth
    }));
    vpResults.push({ width: w, ...res });
    await page.screenshot({ path: path.join(outDir, `viewport_${w}px.png`), clip: { x: 0, y: 0, width: w, height: 850 } });
  }

  console.log('Viewport Results:', vpResults);
  console.log('Console Errors:', errors);

  await browser.close();
  console.log('Verification Finished Successfully!');
}

run().catch(err => {
  console.error('Test Error:', err);
  process.exit(1);
});
