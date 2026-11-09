import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Abhay\\.gemini\\antigravity\\brain\\24bc4af4-e560-4625-9340-82e1ea268a28';

async function verify() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const consoleErrors = [];

  try {
    const page = await browser.newPage();
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[${page.url()}] ${msg.text()}`);
      }
    });

    console.log('=== VERIFYING TASK 1: products.html ===');
    const productsBreakpoints = [1440, 1280, 1024, 768, 414, 360];

    for (const width of productsBreakpoints) {
      await page.setViewport({ width, height: 900 });
      await page.goto('http://localhost:5173/products.html', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.home-products-grid', { timeout: 8000 });

      const gridInfo = await page.evaluate(() => {
        const grid = document.querySelector('.home-products-grid');
        const style = window.getComputedStyle(grid);
        const cols = style.gridTemplateColumns.split(' ').filter(Boolean).length;
        const gap = style.gap;
        const cards = document.querySelectorAll('.home-product-card');
        const firstCard = cards[0];
        const viewBtn = firstCard ? firstCard.querySelector('.home-product-view') : null;
        const viewBtnText = viewBtn ? viewBtn.innerText.trim() : '';
        const viewBtnArrow = firstCard ? firstCard.querySelector('.home-product-view-arrow') : null;
        const arrowVisible = viewBtnArrow && window.getComputedStyle(viewBtnArrow).display !== 'none';
        const rect = grid.getBoundingClientRect();

        return {
          cols,
          gap,
          cardCount: cards.length,
          viewBtnText,
          arrowVisible,
          gridWidth: rect.width,
          bodyWidth: document.body.clientWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth
        };
      });

      console.log(`Width ${width}px -> Grid cols: ${gridInfo.cols}, gap: ${gridInfo.gap}, ViewBtn: "${gridInfo.viewBtnText}", ArrowVisible: ${gridInfo.arrowVisible}, Overflow: ${gridInfo.hasOverflow}`);
    }

    console.log('\n=== VERIFYING TASK 2: watchwishlist.html ===');
    const wishlistBreakpoints = [1440, 1280, 1024, 768, 414, 360];

    for (const width of wishlistBreakpoints) {
      await page.setViewport({ width, height: 900 });
      await page.goto('http://localhost:5173/watchwishlist.html', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.kx-rec-section', { timeout: 8000 });

      const recInfo = await page.evaluate(() => {
        const container = document.querySelector('.kx-rec-container');
        const header = document.querySelector('.kx-rec-header');
        const viewport = document.querySelector('.kx-rec-marquee-viewport');
        const cardWrap = document.querySelector('.kx-rec-card-wrap');
        const group = document.querySelector('.kx-rec-marquee-group');
        const card = cardWrap ? cardWrap.querySelector('.kx-wish-card') : null;
        const viewBtn = card ? card.querySelector('.kx-wish-view-btn') : null;
        const viewBtnText = viewBtn ? viewBtn.innerText.trim() : '';

        const cStyle = container ? window.getComputedStyle(container) : {};
        const vStyle = viewport ? window.getComputedStyle(viewport) : {};
        const gStyle = group ? window.getComputedStyle(group) : {};
        const cwRect = cardWrap ? cardWrap.getBoundingClientRect() : {};
        const cRect = container ? container.getBoundingClientRect() : {};
        const hRect = header ? header.getBoundingClientRect() : {};

        return {
          containerPaddingLeft: cStyle.paddingLeft,
          containerPaddingRight: cStyle.paddingRight,
          containerMaxWidth: cStyle.maxWidth,
          viewportOverflow: vStyle.overflowX || vStyle.overflow,
          cardWrapWidth: Math.round(cwRect.width),
          groupGap: gStyle.gap,
          viewBtnText,
          headerLeft: Math.round(hRect.left),
          containerLeft: Math.round(cRect.left + parseFloat(cStyle.paddingLeft || 0)),
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth
        };
      });

      console.log(`Width ${width}px -> Padding: L=${recInfo.containerPaddingLeft} R=${recInfo.containerPaddingRight}, CardWidth: ${recInfo.cardWrapWidth}px, Gap: ${recInfo.groupGap}, ViewportOverflow: ${recInfo.viewportOverflow}, ViewBtn: "${recInfo.viewBtnText}", Overflow: ${recInfo.hasOverflow}`);
    }

    console.log('\n=== TESTING ARROW CLICK SLIDE ON CAROUSEL ===');
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto('http://localhost:5173/watchwishlist.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.kx-rec-nav-btn.next-btn');

    const prevTransform = await page.evaluate(() => {
      const el = document.querySelector('.kx-rec-marquee-shift-wrapper');
      return el ? el.style.transform : null;
    });

    await page.click('.kx-rec-nav-btn.next-btn');
    await new Promise(r => setTimeout(r, 450));

    const nextTransform = await page.evaluate(() => {
      const el = document.querySelector('.kx-rec-marquee-shift-wrapper');
      return el ? el.style.transform : null;
    });

    console.log(`Transform before next click: ${prevTransform} -> after next click: ${nextTransform}`);

    console.log('\n=== CONSOLE ERRORS CHECK ===');
    console.log(`Total console errors captured: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors);
    }
  } finally {
    await browser.close();
  }
}

verify().catch(console.error);

