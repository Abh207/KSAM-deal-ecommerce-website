const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173/KSAM-deal-ecommerce-website/profile.html';

const TABS = [
  'overview',
  'profile',
  'addresses',
  'alerts',
  'recent',
  'security',
  'notifications',
  'appearance',
  'help',
  'danger'
];

async function verifyAllTabsContrast() {
  console.log('=== Checking Contrast Across All 10 Profile Tabs ===\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.evaluateOnNewDocument(() => {
    const fakeSession = {
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 360000,
      expires_at: Math.floor(Date.now() / 1000) + 360000,
      refresh_token: 'mock-refresh',
      user: {
        id: 'mock-user-12345',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'abhay.chauhan8088@gmail.com',
        user_metadata: {
          full_name: 'Abhay Chauhan'
        }
      }
    };
    try {
      localStorage.setItem('sb-kavvzolevucqleoewlnf-auth-token', JSON.stringify(fakeSession));
      localStorage.setItem('sb-auth-token', JSON.stringify(fakeSession));
    } catch(e) {}
  });

  let totalElementsChecked = 0;
  let allPassed = true;

  for (const tab of TABS) {
    await page.goto(`${BASE_URL}#${tab}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    const report = await page.evaluate((tabName) => {
      function getRgb(str) {
        const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!match) return { r: 0, g: 0, b: 0, a: 1 };
        return {
          r: parseInt(match[1], 10),
          g: parseInt(match[2], 10),
          b: parseInt(match[3], 10),
          a: match[4] !== undefined ? parseFloat(match[4]) : 1
        };
      }

      function luminance(r, g, b) {
        const a = [r, g, b].map(v => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      }

      function contrastRatio(c1, c2) {
        const l1 = luminance(c1.r, c1.g, c1.b) + 0.05;
        const l2 = luminance(c2.r, c2.g, c2.b) + 0.05;
        return l1 > l2 ? l1 / l2 : l2 / l1;
      }

      const cardBase = { r: 13, g: 17, b: 20 }; // #0d1114

      // Sample all headings, paragraphs, labels, spans inside active panel
      const textNodes = Array.from(document.querySelectorAll(`
        #panel-${tabName} h1, #panel-${tabName} h2, #panel-${tabName} h3, #panel-${tabName} h4,
        #panel-${tabName} p, #panel-${tabName} label, #panel-${tabName} .kx-spot-desc,
        #panel-${tabName} .kx-spot-title, #panel-${tabName} .ks-card-desc,
        #panel-${tabName} .ks-field-helper-text, #panel-${tabName} .kx-danger-intro-bar,
        #panel-${tabName} .ks-photo-specs-note
      `));

      const samples = [];
      for (const el of textNodes) {
        const text = el.textContent ? el.textContent.trim().slice(0, 40) : '';
        if (!text) continue;
        const comp = window.getComputedStyle(el);
        const color = comp.color;
        // Ignore transparent text with gradient fills
        if (color === 'rgba(0, 0, 0, 0)' || comp.webkitBackgroundClip === 'text') continue;
        const rgb = getRgb(color);
        const ratio = contrastRatio(rgb, cardBase);
        samples.push({
          tag: el.tagName.toLowerCase(),
          text,
          color,
          contrast: parseFloat(ratio.toFixed(2)),
          passes: ratio >= 4.5
        });
      }

      return samples;
    }, tab);

    const fails = report.filter(s => !s.passes);
    console.log(`[Tab: ${tab.toUpperCase()}] Checked ${report.length} text elements.`);
    if (fails.length > 0) {
      console.warn(`  Warning: ${fails.length} elements below 4.5:1 in tab ${tab}:`, fails);
      allPassed = false;
    } else {
      console.log(`  ✓ All ${report.length} elements pass WCAG AA contrast!`);
    }
    totalElementsChecked += report.length;
  }

  console.log(`\n=== Verification Summary ===`);
  console.log(`Total text elements inspected: ${totalElementsChecked}`);
  console.log(`All tabs pass WCAG AA: ${allPassed ? 'YES ✓' : 'NO ✗'}`);

  await browser.close();
}

verifyAllTabsContrast().catch(console.error);
