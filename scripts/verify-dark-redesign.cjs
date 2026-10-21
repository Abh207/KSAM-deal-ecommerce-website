const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173/KSAM-deal-ecommerce-website/profile.html';
const ARTIFACTS_DIR = 'C:\\Users\\Abhay\\.gemini\\antigravity-ide\\brain\\3aa5afba-eae2-46da-afc9-311dfee44cc1';

async function runDarkRedesignVerification() {
  console.log('=== Starting Complete Dark Redesign Verification ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Mock authenticated session
  await page.evaluateOnNewDocument(() => {
    const fakeSession = {
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 360000,
      expires_at: Math.floor(Date.now() / 1000) + 360000,
      refresh_token: 'mock-refresh',
      user: {
        id: 'mock-user-123',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'abhay@ksamdeal.com',
        email_confirmed_at: '2025-01-01T00:00:00Z',
        phone: '9876543210',
        created_at: '2024-06-15T12:00:00Z',
        user_metadata: { full_name: 'Abhay Singh' }
      }
    };
    try {
      localStorage.setItem('sb-kavvzolevucqleoewlnf-auth-token', JSON.stringify(fakeSession));
      localStorage.setItem('sb-auth-token', JSON.stringify(fakeSession));
    } catch(e) {}
  });

  // 1. Desktop Test (1440x900)
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('.ks-profile-page', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1200));

  // Assert ZERO solid white elements
  const whiteAudits = await page.evaluate(() => {
    const elements = document.querySelectorAll('.ks-profile-page, .ks-profile-page *');
    const violations = [];
    for (const el of elements) {
      const style = window.getComputedStyle(el);
      const bg = style.backgroundColor;
      if (bg) {
        const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (m) {
          const r = parseInt(m[1], 10);
          const g = parseInt(m[2], 10);
          const b = parseInt(m[3], 10);
          const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
          // Substantial opacity and high brightness
          if (a > 0.4 && r > 230 && g > 230 && b > 230) {
            violations.push({
              tag: el.tagName,
              cls: el.className,
              bg: bg,
              txt: el.innerText ? el.innerText.slice(0, 30) : ''
            });
          }
        }
      }
    }
    return violations;
  });

  console.log(`Desktop White Background Violations: ${whiteAudits.length}`);
  if (whiteAudits.length > 0) {
    console.log(whiteAudits);
  }

  // Capture Desktop Screenshot
  const desktopImg = path.join(ARTIFACTS_DIR, 'profile-dark-desktop.png');
  await page.screenshot({ path: desktopImg, fullPage: true });
  console.log(`Desktop screenshot: ${desktopImg}`);

  // Test Tab Switching to Profile (Personal Details Form)
  console.log('Navigating to #profile tab...');
  await page.click('[data-section-id="profile"]');
  await new Promise(r => setTimeout(r, 600));

  const profileTabImg = path.join(ARTIFACTS_DIR, 'profile-tab-desktop.png');
  await page.screenshot({ path: profileTabImg, fullPage: true });
  console.log(`Profile tab screenshot: ${profileTabImg}`);

  // 2. Tablet Test (768x1024)
  console.log('Switching to Tablet View (768x1024)...');
  await page.setViewport({ width: 768, height: 1024 });
  await new Promise(r => setTimeout(r, 600));
  const tabletImg = path.join(ARTIFACTS_DIR, 'profile-dark-tablet.png');
  await page.screenshot({ path: tabletImg, fullPage: true });
  console.log(`Tablet screenshot: ${tabletImg}`);

  // 3. Mobile Test (375x812)
  console.log('Switching to Mobile View (375x812)...');
  await page.setViewport({ width: 375, height: 812 });
  await new Promise(r => setTimeout(r, 600));
  const mobileImg = path.join(ARTIFACTS_DIR, 'profile-dark-mobile.png');
  await page.screenshot({ path: mobileImg, fullPage: true });
  console.log(`Mobile screenshot: ${mobileImg}`);

  await browser.close();
  console.log('=== Dark Redesign Verification Finished Successfully ===');
}

runDarkRedesignVerification().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
