import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const PAGES = [
  { name: 'index', url: 'http://127.0.0.1:4173/KSAM-deal-ecommerce-website/' },
  { name: 'shop.html', url: 'http://127.0.0.1:4173/KSAM-deal-ecommerce-website/shop.html' },
  { name: 'heardeprod.html', url: 'http://127.0.0.1:4173/KSAM-deal-ecommerce-website/heardeprod.html' },
  { name: 'audio.html', url: 'http://127.0.0.1:4173/KSAM-deal-ecommerce-website/audio.html' },
  { name: 'Product.html', url: 'http://127.0.0.1:4173/KSAM-deal-ecommerce-website/Product.html' }
];

async function measurePage(browser, pageInfo) {
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true, deviceScaleFactor: 2 });
  
  let totalBytes = 0;
  let imgBytes = 0;
  let videoBytes = 0;
  let jsBytes = 0;
  let cssBytes = 0;
  let otherBytes = 0;
  let requestCount = 0;
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  page.on('response', async (response) => {
    try {
      requestCount++;
      const headers = response.headers();
      const len = parseInt(headers['content-length'] || '0', 10);
      const type = response.request().resourceType();
      
      let size = len;
      if (!size) {
        try {
          const buf = await response.buffer();
          size = buf.length;
        } catch {}
      }
      totalBytes += size;

      if (type === 'image') imgBytes += size;
      else if (type === 'media') videoBytes += size;
      else if (type === 'script') jsBytes += size;
      else if (type === 'stylesheet') cssBytes += size;
      else otherBytes += size;
    } catch {}
  });

  const startTime = Date.now();
  try {
    await page.goto(pageInfo.url, { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (err) {
    console.log(`Navigation timeout or error on ${pageInfo.name}: ${err.message}`);
  }
  const loadDuration = Date.now() - startTime;

  await new Promise(r => setTimeout(r, 2000));

  const metrics = await page.evaluate(() => {
    let fcp = 0;
    const paintEntries = performance.getEntriesByType('paint');
    for (const e of paintEntries) {
      if (e.name === 'first-contentful-paint') fcp = Math.round(e.startTime);
    }
    return {
      fcp,
      timing: {
        domContentLoaded: Math.round(performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart),
        loadEvent: Math.round(performance.timing.loadEventEnd - performance.timing.navigationStart)
      }
    };
  });

  await page.close();

  return {
    name: pageInfo.name,
    totalMB: (totalBytes / 1024 / 1024).toFixed(2),
    totalKB: Math.round(totalBytes / 1024),
    requestCount,
    imgKB: Math.round(imgBytes / 1024),
    videoKB: Math.round(videoBytes / 1024),
    jsKB: Math.round(jsBytes / 1024),
    cssKB: Math.round(cssBytes / 1024),
    loadDurationMs: loadDuration,
    fcpMs: metrics.fcp,
    domContentLoadedMs: metrics.timing.domContentLoaded,
    loadEventMs: metrics.timing.loadEvent,
    consoleErrors: consoleErrors.slice(0, 5)
  };
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const afterResults = [];
  for (const p of PAGES) {
    console.log(`Measuring ${p.name}...`);
    const res = await measurePage(browser, p);
    afterResults.push(res);
  }

  await browser.close();

  const baselineResults = JSON.parse(fs.readFileSync('scratch/baseline_results.json', 'utf8'));

  console.log('\n========================================================================');
  console.log('             BEFORE vs AFTER OPTIMIZATION (MOBILE 375px)                ');
  console.log('========================================================================');

  const comparison = afterResults.map((after, i) => {
    const before = baselineResults[i];
    const dropMB = ((before.totalKB - after.totalKB) / 1024).toFixed(2);
    const dropPercent = Math.round((1 - after.totalKB / before.totalKB) * 100);
    return {
      Page: after.name,
      'Before (MB)': before.totalMB,
      'After (MB)': after.totalMB,
      'Reduction': `-${dropMB} MB (${dropPercent}%)`,
      'Before Req': before.requestCount,
      'After Req': after.requestCount,
      'Before FCP': `${before.fcpMs} ms`,
      'After FCP': `${after.fcpMs} ms`,
      'Before Video': `${before.videoKB} KB`,
      'After Video': `${after.videoKB} KB`,
      'Before Img': `${before.imgKB} KB`,
      'After Img': `${after.imgKB} KB`
    };
  });

  console.table(comparison);
  fs.writeFileSync('scratch/after_results.json', JSON.stringify({ baseline: baselineResults, after: afterResults, comparison }, null, 2));
}

run().catch(console.error);
