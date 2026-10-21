const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173/KSAM-deal-ecommerce-website/profile.html';

async function runContrastVerification() {
  console.log('--- Starting Profile Contrast & Readability Verification ---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Mock authenticated session
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

  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const evaluation = await page.evaluate(() => {
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

    const darkBase = { r: 7, g: 9, b: 11 }; // #07090b
    const cardBase = { r: 13, g: 17, b: 20 }; // #0d1114

    const checks = [
      { sel: '.ks-hero-title', label: 'Hero Title' },
      { sel: '.ks-hero-name-highlight', label: 'Hero Name Highlight' },
      { sel: '.ks-hero-email', label: 'Hero Email' },
      { sel: '.ks-stat-num', label: 'Hero Stat Number' },
      { sel: '.ks-stat-tag', label: 'Hero Stat Tag' },
      { sel: '.ks-nav-tab-text', label: 'Sidebar Nav Tab' },
      { sel: '.ks-nav-count-badge', label: 'Sidebar Count Badge' },
      { sel: '.ks-overview-heading', label: 'Overview Heading' },
      { sel: '.ks-overview-body-desc', label: 'Overview Description' },
      { sel: '.ks-completeness-label', label: 'Completeness Label' },
      { sel: '.ks-completeness-fraction', label: 'Completeness Fraction' },
      { sel: '.ks-card-section-title', label: 'Card Section Title' },
      { sel: '.ks-card-section-desc', label: 'Card Section Description' },
      { sel: '.ks-checklist-item-title', label: 'Checklist Item Title' },
      { sel: '.ks-checklist-item-desc', label: 'Checklist Item Description' },
      { sel: '.ks-overview-card-title', label: 'Alerts Card Title' },
      { sel: '.ks-overview-card-subtitle', label: 'Alerts Card Subtitle' }
    ];

    const results = checks.map(item => {
      const el = document.querySelector(item.sel);
      if (!el) return { label: item.label, found: false };
      const comp = window.getComputedStyle(el);
      const colorRgb = getRgb(comp.color);
      const ratio = contrastRatio(colorRgb, cardBase);
      return {
        label: item.label,
        selector: item.sel,
        color: comp.color,
        contrast: ratio.toFixed(2),
        passesAA: ratio >= 4.5
      };
    });

    // Check borders
    const borderChecks = [
      { sel: '.ks-overview-welcome-card', label: 'Welcome Card' },
      { sel: '.ks-checklist-card', label: 'Checklist Card' },
      { sel: '.ks-alerts-card', label: 'Alerts Card' },
      { sel: '.ks-hub-sidebar .ks-sticky-nav', label: 'Sidebar Sticky Nav' },
      { sel: '.ks-hero-stat-card', label: 'Hero Stat Card' }
    ].map(b => {
      const el = document.querySelector(b.sel);
      if (!el) return { label: b.label, found: false };
      const comp = window.getComputedStyle(el);
      return {
        label: b.label,
        borderColor: comp.borderColor,
        borderWidth: comp.borderWidth
      };
    });

    return { textResults: results, borderResults: borderChecks };
  });

  console.log('--- Results ---');
  console.table(evaluation.textResults);
  console.log('--- Borders ---');
  console.table(evaluation.borderResults);

  const failures = evaluation.textResults.filter(r => r.found !== false && !r.passesAA);
  if (failures.length > 0) {
    console.error('FAILURES detected below 4.5:1 contrast:', failures);
  } else {
    console.log('ALL evaluated text items exceed WCAG AA (4.5:1)!');
  }

  await browser.close();
}

runContrastVerification().catch(e => {
  console.error(e);
  process.exit(1);
});
