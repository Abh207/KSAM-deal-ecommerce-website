import puppeteer from 'puppeteer-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Abhay\\.gemini\\antigravity\\brain\\24bc4af4-e560-4625-9340-82e1ea268a28';

async function run() {
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const consoleErrors = [];
    const page = await browser.newPage();

    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    page.on('pageerror', (err) => {
        consoleErrors.push(err.message);
    });

    // 1. Desktop Test (1280px)
    console.log('Testing Desktop 1280px...');
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto('http://localhost:5173/products.html', { waitUntil: 'networkidle2' });

    await page.waitForSelector('.flash-deals-section', { timeout: 8000 });
    await page.waitForSelector('.horizontal-products-section', { timeout: 8000 });

    // Verify computed styles on desktop
    const desktopStyles = await page.evaluate(() => {
        const flashCard = document.querySelector('.flash-deal-card');
        const flashImg = document.querySelector('.flash-deal-image');
        const flashTitle = document.querySelector('.flash-deal-info h3');
        const flashCat = document.querySelector('.flash-deal-category');
        const flashOldPrice = document.querySelector('.flash-deal-price del');
        const flashRating = document.querySelector('.flash-deal-rating');
        const flashStock = document.querySelector('.flash-stock');
        const flashBtn = document.querySelector('.flash-deal-bottom button');

        const popCard = document.querySelector('.horizontal-product-card');
        const popImg = document.querySelector('.horizontal-product-image');
        const popTitle = document.querySelector('.horizontal-product-info h3');
        const popPrice = document.querySelector('.horizontal-price strong');

        return {
            flashCardBg: flashCard ? getComputedStyle(flashCard).backgroundColor : null,
            flashCardBorder: flashCard ? getComputedStyle(flashCard).borderColor : null,
            flashImgBg: flashImg ? getComputedStyle(flashImg).backgroundColor : null,
            flashTitleColor: flashTitle ? getComputedStyle(flashTitle).color : null,
            flashCatColor: flashCat ? getComputedStyle(flashCat).color : null,
            flashOldPriceColor: flashOldPrice ? getComputedStyle(flashOldPrice).color : null,
            flashRatingColor: flashRating ? getComputedStyle(flashRating).color : null,
            flashStockColor: flashStock ? getComputedStyle(flashStock).color : null,
            flashBtnBg: flashBtn ? getComputedStyle(flashBtn).backgroundColor : null,
            popCardBg: popCard ? getComputedStyle(popCard).backgroundColor : null,
            popImgBg: popImg ? getComputedStyle(popImg).backgroundColor : null,
            popTitleColor: popTitle ? getComputedStyle(popTitle).color : null,
            popPriceColor: popPrice ? getComputedStyle(popPrice).color : null
        };
    });
    console.log('Desktop Computed Styles:', desktopStyles);

    // Scroll to and screenshot Desktop Flash Deals
    await page.evaluate(() => {
        const el = document.querySelector('.flash-deals-section');
        if (el) el.scrollIntoView({ block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 500));
    const flashDesktopPath = path.join(artifactDir, 'screenshot_flash_deals_desktop_white.png');
    const flashSec = await page.$('.flash-deals-section');
    if (flashSec) await flashSec.screenshot({ path: flashDesktopPath });
    console.log('Captured:', flashDesktopPath);

    // Scroll to and screenshot Desktop Popular Products
    await page.evaluate(() => {
        const el = document.querySelector('.horizontal-products-section');
        if (el) el.scrollIntoView({ block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 500));
    const popDesktopPath = path.join(artifactDir, 'screenshot_popular_products_desktop_white.png');
    const popSec = await page.$('.horizontal-products-section');
    if (popSec) await popSec.screenshot({ path: popDesktopPath });
    console.log('Captured:', popDesktopPath);

    // 2. Mobile Test (375px)
    console.log('\nTesting Mobile 375px...');
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/products.html', { waitUntil: 'networkidle2' });

    await page.waitForSelector('.flash-deals-section', { timeout: 8000 });
    await page.waitForSelector('.horizontal-products-section', { timeout: 8000 });

    const overflow375 = await page.evaluate(() => {
        return {
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
            hasOverflow: document.documentElement.scrollWidth > window.innerWidth
        };
    });
    console.log('375px Overflow Check:', overflow375);

    // Scroll to Flash Deals mobile and screenshot
    await page.evaluate(() => {
        const el = document.querySelector('.flash-deals-section');
        if (el) el.scrollIntoView({ block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 500));
    const flashMobilePath = path.join(artifactDir, 'screenshot_flash_deals_mobile_375px_white.png');
    await page.screenshot({ path: flashMobilePath });
    console.log('Captured:', flashMobilePath);

    // Scroll to Popular Products mobile and screenshot
    await page.evaluate(() => {
        const el = document.querySelector('.horizontal-products-section');
        if (el) el.scrollIntoView({ block: 'center' });
    });
    await new Promise((r) => setTimeout(r, 600));
    const popMobilePath = path.join(artifactDir, 'screenshot_popular_products_mobile_375px_white.png');
    await page.screenshot({ path: popMobilePath });
    console.log('Captured:', popMobilePath);

    console.log('\n--- VERIFICATION SUMMARY ---');
    console.log('Total console errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
        console.log('Console errors:', consoleErrors);
    } else {
        console.log('ZERO console errors verified!');
    }

    await browser.close();
}

run().catch((err) => {
    console.error('Verification failed:', err);
    process.exit(1);
});

