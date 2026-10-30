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
  
  // Track network
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
      const url = response.url();
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

  // Wait a moment for layout/paint metrics
  await new Promise(r => setTimeout(r, 2000));

  const metrics = await page.evaluate(() => {
    let fcp = 0;
    let lcp = 0;
    let cls = 0;

    const paintEntries = performance.getEntriesByType('paint');
    for (const e of paintEntries) {
      if (e.name === 'first-contentful-paint') fcp = Math.round(e.startTime);
    }

    // Try reading LCP from performance observer entries if available
    return {
      fcp,
      timing: {
        domInteractive: Math.round(performance.timing.domInteractive - performance.timing.navigationStart),
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

  const results = [];
  for (const p of PAGES) {
    console.log(`Measuring ${p.name}...`);
    const res = await measurePage(browser, p);
    results.push(res);
  }

  await browser.close();

  console.log('\n=== BASELINE PERFORMANCE MEASUREMENTS (MOBILE 375px PREVIEW BUILD) ===');
  console.table(results.map(r => ({
    Page: r.name,
    'Total (MB)': r.totalMB,
    'Requests': r.requestCount,
    'Img (KB)': r.imgKB,
    'Video (KB)': r.videoKB,
    'JS (KB)': r.jsKB,
    'CSS (KB)': r.cssKB,
    'DCL (ms)': r.domContentLoadedMs,
    'Load (ms)': r.loadEventMs,
    'FCP (ms)': r.fcpMs
  })));

  fs.writeFileSync('scratch/baseline_results.json', JSON.stringify(results, null, 2));
  console.log('Saved baseline to scratch/baseline_results.json');
}

run().catch(console.error);
