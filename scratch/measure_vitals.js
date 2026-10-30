import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const BASE_URL = 'http://127.0.0.1:4173/KSAM-deal-ecommerce-website/';
const PAGES = [
  { name: 'index', path: '' },
  { name: 'shop.html', path: 'shop.html' },
  { name: 'heardeprod.html', path: 'heardeprod.html' },
  { name: 'audio.html', path: 'audio.html' },
  { name: 'Product.html', path: 'Product.html' }
];

// Slow 4G & Fast 4G CDP emulation profiles
const NETWORK_PROFILES = {
  slow4g: {
    offline: false,
    downloadThroughput: (400 * 1024) / 8, // 400 Kbps
    uploadThroughput: (400 * 1024) / 8,
    latency: 400 // ms
  },
  fast4g: {
    offline: false,
    downloadThroughput: (1.5 * 1024 * 1024) / 8, // 1.5 Mbps
    uploadThroughput: (750 * 1024) / 8,
    latency: 150 // ms
  }
};

async function measurePageVitals(pageName, urlPath, profileName = 'fast4g') {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });

  const client = await page.target().createCDPSession();
  await client.send('Network.enable');
  await client.send('Network.setCacheDisabled', { cacheDisabled: true });
  if (profileName && NETWORK_PROFILES[profileName]) {
    await client.send('Network.emulateNetworkConditions', NETWORK_PROFILES[profileName]);
  }

  // Inject Web Vitals observer
  await page.evaluateOnNewDocument(() => {
    window.__vitals = { lcp: 0, cls: 0, fcp: 0, ttfb: 0 };
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          window.__vitals.fcp = entry.startTime;
        }
      }
    }).observe({ type: 'paint', buffered: true });

    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const last = entries[entries.length - 1];
      if (last) window.__vitals.lcp = last.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          window.__vitals.cls += entry.value;
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });

  const fullUrl = `${BASE_URL}${urlPath}`;
  const start = Date.now();
  try {
    await page.goto(fullUrl, { waitUntil: 'load', timeout: 30000 });
  } catch (e) {
    // load event timeout fallback
  }

  // Wait extra 2 seconds for LCP observation & layout shift stabilization
  await new Promise(r => setTimeout(r, 2500));

  const vitals = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav) {
      window.__vitals.ttfb = nav.responseStart;
    }
    return window.__vitals;
  });

  await browser.close();
  return {
    page: pageName,
    fcp: Math.round(vitals.fcp),
    lcp: Math.round(vitals.lcp),
    cls: Number(vitals.cls.toFixed(4)),
    ttfb: Math.round(vitals.ttfb)
  };
}

async function run() {
  console.log('Testing Core Web Vitals on Mobile 375px (Fast 4G)...');
  const fast4gResults = [];
  for (const p of PAGES) {
    const res = await measurePageVitals(p.name, p.path, 'fast4g');
    fast4gResults.push(res);
  }
  console.table(fast4gResults);

  console.log('\nTesting Core Web Vitals on Mobile 375px (Slow 4G)...');
  const slow4gResults = [];
  for (const p of PAGES) {
    const res = await measurePageVitals(p.name, p.path, 'slow4g');
    slow4gResults.push(res);
  }
  console.table(slow4gResults);
}

run();
