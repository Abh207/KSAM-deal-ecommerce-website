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

  // Test Signed-Out Gate State
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:5173/KSAM-deal-ecommerce-website/profile.html', { waitUntil: 'networkidle2', timeout: 15000 });
  
  const signedOutInfo = await page.evaluate(() => {
    return {
      title: document.title,
      isGate: !!document.querySelector('.ks-signed-out-gate'),
      signInBtnHref: document.querySelector('.ks-signed-out-gate a[href*="login"]')?.getAttribute('href'),
      signUpBtnHref: document.querySelector('.ks-signed-out-gate a[href*="signUp"]')?.getAttribute('href'),
      hasNewsletter: !!document.querySelector('.ksam-newsletter'),
      hasFooter: !!document.querySelector('footer')
    };
  });
  console.log('Signed-Out Gate Status:', JSON.stringify(signedOutInfo, null, 2));

  // Test login.html next parameter & Back to Profile link
  await page.goto('http://localhost:5173/KSAM-deal-ecommerce-website/login.html?next=profile.html', { waitUntil: 'networkidle2', timeout: 15000 });
  const loginInfo = await page.evaluate(() => {
    return {
      hasBackLink: !!document.getElementById('backToProfileLink'),
      backLinkText: document.getElementById('backToProfileLink')?.textContent,
      signUpLinkHref: document.querySelector('.signUpLoginLink a[href*="signUp"]')?.getAttribute('href')
    };
  });
  console.log('Login Page with next=profile.html:', JSON.stringify(loginInfo, null, 2));

  // Test signUp.html next parameter & Back to Profile link
  await page.goto('http://localhost:5173/KSAM-deal-ecommerce-website/signUp.html?next=profile.html', { waitUntil: 'networkidle2', timeout: 15000 });
  const signUpInfo = await page.evaluate(() => {
    return {
      hasBackLink: !!document.getElementById('backToProfileLink'),
      backLinkText: document.getElementById('backToProfileLink')?.textContent,
      loginLinkHref: document.querySelector('.signUpLoginLink a[href*="login"]')?.getAttribute('href')
    };
  });
  console.log('SignUp Page with next=profile.html:', JSON.stringify(signUpInfo, null, 2));

  // Test responsive overflow across viewports
  const viewports = [360, 390, 768, 1024, 1366, 1920, 2560];
  console.log('Responsive overflow checks:');
  for (const w of viewports) {
    await page.setViewport({ width: w, height: 800 });
    await page.goto('http://localhost:5173/KSAM-deal-ecommerce-website/profile.html', { waitUntil: 'domcontentloaded' });
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth
    }));
    const isOverflow = scrollWidth > innerWidth;
    console.log(`- ${w}px: scrollWidth=${scrollWidth}, innerWidth=${innerWidth}, overflow=${isOverflow ? 'FAIL' : 'PASS'}`);
  }

  // Save screenshot of gate state
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:5173/KSAM-deal-ecommerce-website/profile.html', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'scripts/profile-gate-preview.png', fullPage: false });
  console.log('Screenshot captured: scripts/profile-gate-preview.png');

  await browser.close();
})();
