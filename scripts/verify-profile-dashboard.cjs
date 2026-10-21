const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173/KSAM-deal-ecommerce-website/';
const VIEWPORTS = [
  { width: 360, height: 740, name: '360px-mobile' },
  { width: 390, height: 844, name: '390px-mobile' },
  { width: 768, height: 1024, name: '768px-tablet' },
  { width: 1024, height: 768, name: '1024px-desktop' },
  { width: 1366, height: 768, name: '1366px-desktop' },
  { width: 1920, height: 1080, name: '1920px-fhd' },
  { width: 2560, height: 1440, name: '2560px-qhd' },
];

async function runVerification() {
  console.log('--- Starting Profile Dashboard Automated Checks ---');
  if (!fs.existsSync(CHROME_PATH)) {
    console.error('Chrome executable not found at:', CHROME_PATH);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  const results = {
    viewports: {},
    checks: {}
  };

  try {
    // 1. Check footer on index.html vs profile.html
    console.log('Checking Footer absence on profile.html vs presence on index.html...');
    await page.goto(`${BASE_URL}index.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const hasFooterOnHome = await page.evaluate(() => {
      return !!document.querySelector('footer, .ks-site-footer, .footer');
    });
    results.checks.homeHasFooter = hasFooterOnHome;
    console.log(`Home page has footer: ${hasFooterOnHome}`);

    // Set up mock auth session for dashboard tests
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
        sessionStorage.setItem('ksam_last_profile_section', 'notifications');
      } catch (e) {}
    });

    await page.goto(`${BASE_URL}profile.html#notifications`, { waitUntil: 'networkidle0', timeout: 25000 });
    await new Promise(r => setTimeout(r, 1500));

    // Verify footer is absent on profile.html
    const profileHasFooter = await page.evaluate(() => {
      // Check if global footer exists
      const footer = document.querySelector('footer, .ks-site-footer');
      return !!footer;
    });
    results.checks.profileHasNoFooter = !profileHasFooter;
    console.log(`Profile page has no footer: ${!profileHasFooter}`);

    // Verify Newsletter is present on profile.html
    const hasNewsletter = await page.evaluate(() => {
      return !!document.querySelector('.ks-profile-newsletter-wrap, .ks-newsletter, form[action*="newsletter"], .newsletter-section');
    });
    results.checks.profileHasNewsletter = hasNewsletter;
    console.log(`Profile page has Newsletter section: ${hasNewsletter}`);

    // Verify decorative text strip under navbar is removed
    const hasCutTextStrip = await page.evaluate(() => {
      const el = document.querySelector('.ks-hero-marquee-wrap, .ks-hero-marquee');
      return !!el;
    });
    results.checks.textStripRemoved = !hasCutTextStrip;
    console.log(`Top cut-off decorative text strip removed: ${!hasCutTextStrip}`);

    // Verify Live Backdrop Canvas
    const backdropCheck = await page.evaluate(() => {
      const canvas = document.querySelector('.kx-live-backdrop-canvas');
      const container = document.querySelector('.kx-live-backdrop');
      const grid = document.querySelector('.kx-live-backdrop-grid');
      const grain = document.querySelector('.kx-live-backdrop-grain');
      return {
        exists: !!canvas,
        hasContainer: !!container,
        hasGrid: !!grid,
        hasGrain: !!grain,
        width: canvas ? canvas.width : 0,
        height: canvas ? canvas.height : 0
      };
    });
    results.checks.backdropCanvas = backdropCheck;
    console.log('Live Backdrop status:', backdropCheck);

    // Verify Product Strip
    const productStripCheck = await page.evaluate(() => {
      const strip = document.querySelector('.kx-product-strip-section');
      const tracks = document.querySelectorAll('.kx-strip-track');
      const cards = document.querySelectorAll('.kx-strip-card');
      const forwardTrack = document.querySelector('.kx-strip-track--forward');
      const reverseTrack = document.querySelector('.kx-strip-track--reverse');
      const showcaseLinks = Array.from(document.querySelectorAll('.kx-strip-card')).every(a => 
        a.getAttribute('href') && a.getAttribute('href').includes('index.html#showcase')
      );
      return {
        exists: !!strip,
        trackCount: tracks.length,
        cardCount: cards.length,
        hasForwardAndReverse: !!forwardTrack && !!reverseTrack,
        linksToShowcase: showcaseLinks
      };
    });
    results.checks.productStrip = productStripCheck;
    console.log('Product Strip status:', productStripCheck);

    // Verify Spotlight and Notification Rows
    const notificationsCheck = await page.evaluate(() => {
      const spotList = document.querySelector('.kx-spot-list');
      const spots = document.querySelectorAll('.kx-spot');
      const toggles = document.querySelectorAll('.kx-toggle-btn');
      const lockedToggle = document.querySelector('.kx-toggle-btn.is-locked');
      const thumbs = document.querySelectorAll('.kx-toggle-thumb');

      // Tones check
      const tones = Array.from(spots).map(s => s.getAttribute('data-tone'));

      // Check first toggle dimensions
      let firstToggleBox = null;
      let firstThumbBox = null;
      if (toggles[0]) {
        const rect = toggles[0].getBoundingClientRect();
        firstToggleBox = { width: Math.round(rect.width), height: Math.round(rect.height) };
      }
      if (thumbs[0]) {
        const rect = thumbs[0].getBoundingClientRect();
        firstThumbBox = { width: Math.round(rect.width), height: Math.round(rect.height) };
      }

      // Check if outer card was removed (no double borders)
      const outerNestedBox = document.querySelector('.ks-tab-panel > .ks-card .kx-spot-list');

      return {
        hasSpotList: !!spotList,
        rowCount: spots.length,
        tones,
        toggleCount: toggles.length,
        hasLockedToggle: !!lockedToggle,
        firstToggleDimensions: firstToggleBox,
        firstThumbDimensions: firstThumbBox,
        noDoubleBorders: !outerNestedBox
      };
    });
    results.checks.notifications = notificationsCheck;
    console.log('Notifications & Toggles status:', notificationsCheck);

    // Test toggle interaction
    console.log('Testing toggle interactive click...');
    const toggleTest = await page.evaluate(async () => {
      const toggle = document.querySelector('.kx-spot:first-child .kx-toggle-btn');
      if (!toggle) return { error: 'No toggle found' };
      const before = toggle.getAttribute('aria-checked');
      toggle.click();
      await new Promise(r => setTimeout(r, 200));
      const after = toggle.getAttribute('aria-checked');
      return { before, after, toggled: before !== after };
    });
    results.checks.toggleInteraction = toggleTest;
    console.log('Toggle interactive test:', toggleTest);

    // Test Viewports for Layout, Sidebar width, and no horizontal overflow
    console.log('Testing Viewports...');
    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise(r => setTimeout(r, 400));

      const vpResult = await page.evaluate((vpWidth) => {
        const bodyWidth = document.body.scrollWidth;
        const windowWidth = window.innerWidth;
        const hasHorizontalOverflow = bodyWidth > windowWidth + 1;

        let sidebarWidth = 0;
        let sidebarLayout = null;
        const sidebar = document.querySelector('.ks-hub-sidebar');
        if (sidebar) {
          const rect = sidebar.getBoundingClientRect();
          sidebarWidth = Math.round(rect.width);
        }

        const layoutEl = document.querySelector('.ks-account-hub-layout');
        if (layoutEl) {
          const style = window.getComputedStyle(layoutEl);
          sidebarLayout = style.getPropertyValue('grid-template-columns');
        }

        return {
          windowWidth,
          bodyScrollWidth: bodyWidth,
          hasHorizontalOverflow,
          sidebarWidth,
          sidebarLayout
        };
      }, vp.width);

      results.viewports[vp.name] = vpResult;
      console.log(`Viewport ${vp.name} (${vp.width}x${vp.height}): Overflow: ${vpResult.hasHorizontalOverflow}, Sidebar: ${vpResult.sidebarWidth}px`);

      // Take representative screenshots
      if (['390px-mobile', '1024px-desktop', '1920px-fhd'].includes(vp.name)) {
        const shotPath = path.resolve(__dirname, `profile-audit-${vp.name}.png`);
        await page.screenshot({ path: shotPath, fullPage: false });
        console.log(`Saved screenshot: ${shotPath}`);
      }
    }

    console.log('\n--- Final Verification Summary ---');
    console.log(JSON.stringify(results, null, 2));

    fs.writeFileSync(
      path.resolve(__dirname, 'profile-verification-results.json'),
      JSON.stringify(results, null, 2)
    );

  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    await browser.close();
  }
}

runVerification();
