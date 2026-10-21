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

async function runTabsVerification() {
  console.log('--- Starting Comprehensive Three Tabs Verification ---');
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
  const report = {
    helpTab: {},
    dangerTab: {},
    appearanceTab: {},
    themeApplication: {},
    sidebar: {},
    viewports: {},
    pageShell: {}
  };

  try {
    // 1. Session injection for authenticated dashboard tests
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
      } catch (e) {}
    });

    // --------------------------------------------------------------------------
    // TEST TAB 1: HELP TAB
    // --------------------------------------------------------------------------
    console.log('\n--- Auditing Help & Legal Tab ---');
    await page.goto(`${BASE_URL}profile.html#help`, { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1200));

    report.helpTab = await page.evaluate(() => {
      const headerOpen = document.querySelector('.kx-panel-header-open');
      const duplicateHeaderCard = document.querySelector('.ks-card-header .ks-card-title');
      const featuredBanner = document.querySelector('.kx-help-featured-banner');
      const bannerBtn = featuredBanner ? featuredBanner.querySelector('a[href*="contact-us.html"]') : null;
      const spotGrid = document.querySelector('.kx-spot-grid-2x2');
      const spots = spotGrid ? spotGrid.querySelectorAll('.kx-spot') : [];
      const tones = Array.from(spots).map(s => s.getAttribute('data-tone'));

      // Verify link targets
      const links = Array.from(document.querySelectorAll('.kx-card-link')).map(a => a.getAttribute('href'));

      return {
        hasOpenHeader: !!headerOpen,
        noDuplicateHeaderCard: !duplicateHeaderCard,
        hasFeaturedBanner: !!featuredBanner,
        bannerHasContactLink: !!bannerBtn,
        has2x2Grid: !!spotGrid,
        cardCount: spots.length,
        tones,
        linksPreserved: links.length === 4 && links.some(l => l.includes('contact-us.html'))
      };
    });
    console.log('Help Tab Check:', report.helpTab);

    // --------------------------------------------------------------------------
    // TEST TAB 2: DANGER ZONE TAB
    // --------------------------------------------------------------------------
    console.log('\n--- Auditing Danger Zone Tab ---');
    await page.goto(`${BASE_URL}profile.html#danger`, { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1200));

    report.dangerTab = await page.evaluate(() => {
      const headerOpen = document.querySelector('.kx-panel-header-open');
      const introBar = document.querySelector('.kx-danger-intro-bar');
      const redCard = document.querySelector('.kx-spot[data-tone="red"]');
      const blueCard = document.querySelector('.kx-spot[data-tone="blue"]');
      const deleteBtn = document.querySelector('.kx-btn-danger-outline');
      const outerBox = document.querySelector('.ks-danger-warning-card');

      return {
        hasOpenHeader: !!headerOpen,
        hasIntroBar: !!introBar,
        noHeavyOuterBox: !outerBox,
        hasRedSpotlightCard: !!redCard,
        hasBlueSessionCard: !!blueCard,
        hasOutlineDeleteButton: !!deleteBtn
      };
    });

    // Test opening modal
    await page.click('.kx-btn-danger-outline');
    await new Promise(r => setTimeout(r, 500));
    const modalCheck = await page.evaluate(() => {
      const modal = document.querySelector('.kx-modal-card');
      const submitBtn = modal ? modal.querySelector('button[type="submit"]') : null;
      const isSubmitDisabled = submitBtn ? submitBtn.disabled : false;
      const closeBtn = modal ? modal.querySelector('button[aria-label="Close dialog"]') : null;
      return {
        modalRendered: !!modal,
        submitInitiallyDisabled: isSubmitDisabled,
        hasCloseButton: !!closeBtn
      };
    });
    report.dangerTab.modal = modalCheck;

    // Close modal
    await page.click('button[aria-label="Close dialog"]');
    await new Promise(r => setTimeout(r, 400));
    console.log('Danger Zone Tab Check:', report.dangerTab);

    // --------------------------------------------------------------------------
    // TEST TAB 3: APPEARANCE & THEME APPLICATION
    // --------------------------------------------------------------------------
    console.log('\n--- Auditing Appearance Tab & Live Theme Switch ---');
    await page.goto(`${BASE_URL}profile.html#appearance`, { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1200));

    report.appearanceTab = await page.evaluate(() => {
      const headerOpen = document.querySelector('.kx-panel-header-open');
      const themeGrid = document.querySelector('.kx-theme-grid');
      const themeCards = themeGrid ? themeGrid.querySelectorAll('.kx-theme-card') : [];
      const miniPreviews = document.querySelectorAll('.kx-mini-preview');
      const swatches = document.querySelectorAll('.kx-swatch-chip');

      const isRadiogroup = themeGrid ? themeGrid.getAttribute('role') === 'radiogroup' : false;
      const cardsHaveRadioRole = Array.from(themeCards).every(c => c.getAttribute('role') === 'radio');

      return {
        hasOpenHeader: !!headerOpen,
        themeCardCount: themeCards.length,
        hasPreviews: miniPreviews.length === 3,
        swatchCount: swatches.length,
        isRadiogroup,
        cardsHaveRadioRole
      };
    });

    // Test clicking Light Theme
    console.log('Clicking Light Theme option...');
    await page.click('[data-theme-option="light"]');
    await new Promise(r => setTimeout(r, 600));

    report.themeApplication = await page.evaluate(() => {
      const docTheme = document.documentElement.getAttribute('data-theme');
      const pageTheme = document.querySelector('.kx-page').getAttribute('data-theme');
      const storedTheme = localStorage.getItem('ksam_theme_pref');
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      const cardBg = window.getComputedStyle(document.querySelector('.kx-spot, .kx-theme-card')).backgroundColor;

      return {
        docTheme,
        pageTheme,
        storedTheme,
        bodyBg,
        cardBg,
        isLightApplied: docTheme === 'light' && pageTheme === 'light'
      };
    });
    console.log('Theme Application Check:', report.themeApplication);

    // Test page reload to confirm light theme persistence with no flash
    await page.goto(`${BASE_URL}profile.html#appearance`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));

    const reloadedTheme = await page.evaluate(() => {
      const docTheme = document.documentElement.getAttribute('data-theme');
      const pageTheme = document.querySelector('.kx-page').getAttribute('data-theme');
      return { docTheme, pageTheme, persisted: docTheme === 'light' && pageTheme === 'light' };
    });
    report.themeApplication.afterReload = reloadedTheme;
    console.log('Theme persistence after reload:', reloadedTheme);

    // Switch back to Dark Theme
    await page.click('[data-theme-option="dark"]');
    await new Promise(r => setTimeout(r, 600));

    // --------------------------------------------------------------------------
    // TEST SIDEBAR: Account item red tone active indicator & 248px width
    // --------------------------------------------------------------------------
    console.log('\n--- Auditing Sidebar & Red Tone Indicator ---');
    await page.goto(`${BASE_URL}profile.html#danger`, { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1000));

    report.sidebar = await page.evaluate(() => {
      const sidebar = document.querySelector('.ks-hub-sidebar');
      const dangerBtn = sidebar ? sidebar.querySelector('.ks-nav-pill-btn.is-danger') : null;
      const activePill = sidebar ? sidebar.querySelector('.ks-nav-active-pill') : null;
      const rect = sidebar ? sidebar.getBoundingClientRect() : null;

      return {
        sidebarWidth: rect ? Math.round(rect.width) : 0,
        hasDangerItem: !!dangerBtn,
        activePillHasDangerClass: activePill ? activePill.classList.contains('is-danger-pill') : false
      };
    });
    console.log('Sidebar Check:', report.sidebar);

    // --------------------------------------------------------------------------
    // TEST VIEWPORTS & HORIZONTAL OVERFLOW
    // --------------------------------------------------------------------------
    console.log('\n--- Auditing Viewports (360px to 2560px) ---');
    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise(r => setTimeout(r, 300));

      const vpResult = await page.evaluate((vpWidth) => {
        const bodyWidth = document.body.scrollWidth;
        const windowWidth = window.innerWidth;
        const hasHorizontalOverflow = bodyWidth > windowWidth + 1;
        const sidebar = document.querySelector('.ks-hub-sidebar');
        const sidebarWidth = sidebar ? Math.round(sidebar.getBoundingClientRect().width) : 0;

        return {
          windowWidth,
          bodyScrollWidth: bodyWidth,
          hasHorizontalOverflow,
          sidebarWidth
        };
      }, vp.width);

      report.viewports[vp.name] = vpResult;
      console.log(`Viewport ${vp.name}: Overflow=${vpResult.hasHorizontalOverflow}, Sidebar=${vpResult.sidebarWidth}px`);
    }

    // Save final report to JSON
    fs.writeFileSync(
      path.resolve(__dirname, 'profile-tabs-verification-results.json'),
      JSON.stringify(report, null, 2)
    );
    console.log('\n--- Full Report Written to profile-tabs-verification-results.json ---');

  } catch (err) {
    console.error('Verification failed with error:', err);
  } finally {
    await browser.close();
  }
}

runTabsVerification();
