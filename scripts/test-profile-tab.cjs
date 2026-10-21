const fs = require('fs');
const puppeteer = require('puppeteer-core');

(async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Inject session into localStorage on load
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
      sessionStorage.setItem('ksam_last_profile_section', 'profile');
    } catch(e) {}
  });

  const viewports = [360, 390, 768, 1024, 1366, 1920];
  const results = [];

  console.log('--- Starting Profile Tab Verification Across Viewports ---');

  for (const w of viewports) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto('http://localhost:5173/KSAM-deal-ecommerce-website/profile.html#profile', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    // Wait for the profile form to be mounted
    try {
      await page.waitForSelector('.ks-profile-form-grid', { timeout: 8000 });
    } catch(e) {
      await page.evaluate(() => {
        const tab = document.querySelector('[data-section-id="profile"]');
        if (tab) tab.click();
      });
      await page.waitForSelector('.ks-profile-form-grid', { timeout: 8000 });
    }

    await new Promise(r => setTimeout(r, 400));

    const check = await page.evaluate((width) => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const hasOverflow = docW > winW;

      // 1. Header clipped check
      const headerBand = document.querySelector('.ks-panel-header-band');
      const headerRect = headerBand ? headerBand.getBoundingClientRect() : null;
      const navH = width >= 1024 ? 72 : 64;

      // 2. Email & Change button overlap check
      const emailInput = document.querySelector('.ks-unified-input--email');
      const changeBtn = document.querySelector('.ks-email-change-btn');
      let emailOverlap = false;
      if (emailInput && changeBtn) {
        const inputPaddingRight = parseFloat(window.getComputedStyle(emailInput).paddingRight);
        emailOverlap = inputPaddingRight < 60;
      }

      // 3. Helper texts font-size check
      const helperTexts = Array.from(document.querySelectorAll('.ks-field-helper-text'));
      const helperSizes = helperTexts.map(el => window.getComputedStyle(el).fontSize);
      const helperSizeOk = helperSizes.every(s => parseFloat(s) <= 13);

      // 4. Mobile prefix +91 check
      const prefixChip = document.querySelector('.ks-phone-prefix-chip');
      const phoneLabel = document.querySelector('.ks-unified-label--phone');
      let phoneChipOk = false;
      if (prefixChip && phoneLabel) {
        const chipRect = prefixChip.getBoundingClientRect();
        const labelRect = phoneLabel.getBoundingClientRect();
        phoneChipOk = labelRect.left >= chipRect.right - 2;
      }

      // 5. Stray white line
      const formCardHeader = document.querySelector('.ks-form-card-header');
      const headerBorderBottom = formCardHeader ? window.getComputedStyle(formCardHeader).borderBottomWidth : '0px';

      // 6. DPDP pill
      const dpdpPill = document.querySelector('.ks-dpdp-pill');
      const dpdpHeight = dpdpPill ? dpdpPill.getBoundingClientRect().height : 0;
      const dpdpOk = dpdpHeight >= 26 && dpdpHeight <= 32;

      // 7. Date picker scheme
      const dateInput = document.querySelector('.ks-unified-input--date');
      const colorScheme = dateInput ? window.getComputedStyle(dateInput).colorScheme : '';

      // 8. Heading letter-spacing
      const heading = document.querySelector('.ks-panel-heading');
      const headingLs = heading ? window.getComputedStyle(heading).letterSpacing : '';

      // 9. Photo card avatar and camera button
      const avatarCircle = document.querySelector('.ks-avatar-anchor-circle');
      const cameraBtn = document.querySelector('.ks-avatar-anchor-btn');
      const avatarW = avatarCircle ? avatarCircle.getBoundingClientRect().width : 0;
      const cameraW = cameraBtn ? cameraBtn.getBoundingClientRect().width : 0;

      // 10. Form Grid alignment
      const formGrid = document.querySelector('.ks-profile-form-grid');
      const formGridAlign = formGrid ? window.getComputedStyle(formGrid).alignItems : '';

      return {
        width,
        docW,
        winW,
        hasOverflow,
        headerRect: headerRect ? { top: headerRect.top, height: headerRect.height } : null,
        navH,
        emailOverlap,
        helperSizes,
        helperSizeOk,
        phoneChipOk,
        headerBorderBottom,
        dpdpHeight,
        dpdpOk,
        colorScheme,
        headingLs,
        avatarW,
        cameraW,
        formGridAlign
      };
    }, w);

    results.push(check);
    console.log(`Viewport ${w}px result:`, {
      overflow: check.hasOverflow ? 'FAIL' : 'PASS',
      emailOverlap: check.emailOverlap ? 'FAIL' : 'PASS',
      helperSizes: check.helperSizeOk ? 'PASS (12.5px)' : 'FAIL',
      phoneChipOk: check.phoneChipOk ? 'PASS (No overlap)' : 'FAIL',
      dpdpOk: check.dpdpOk ? `PASS (${check.dpdpHeight}px)` : 'FAIL',
      avatarSize: `${check.avatarW}px (req: 112px)`,
      cameraSize: `${check.cameraW}px (req: 36px)`,
      formGridAlign: check.formGridAlign
    });
  }

  // Test Unsaved Changes Save Bar
  console.log('\n--- Testing Unsaved Changes Save Bar ---');
  await page.setViewport({ width: 1280, height: 900 });
  const nameInput = await page.$('.ks-unified-input');
  await nameInput.type(' Updated');
  await new Promise(r => setTimeout(r, 400));

  const saveBarCheck = await page.evaluate(() => {
    const bar = document.querySelector('.ks-save-bar');
    return {
      exists: !!bar,
      isVisible: bar?.classList.contains('is-visible'),
      height: bar?.getBoundingClientRect().height,
      hasDiscard: !!bar?.querySelector('.ks-btn-secondary'),
      hasSave: !!bar?.querySelector('.ks-btn-primary')
    };
  });
  console.log('Save bar check:', saveBarCheck);

  await page.evaluate(() => {
    const discardBtn = document.querySelector('.ks-save-bar .ks-btn-secondary');
    if (discardBtn) discardBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  await browser.close();
  console.log('--- Finished Verification ---');
  fs.writeFileSync('scripts/profile-tab-results.json', JSON.stringify(results, null, 2));
})();
