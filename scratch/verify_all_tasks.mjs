import puppeteer from 'puppeteer-core';
import fs from 'fs';
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

    console.log('Testing mobile 375px viewport...');
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/products.html', { waitUntil: 'networkidle2' });

    // Wait for components to render
    await page.waitForSelector('.horizontal-products-section', { timeout: 8000 });
    await page.waitForSelector('.flash-deals-section', { timeout: 8000 });

    // Check overflow at 375px
    const overflow375 = await page.evaluate(() => {
        return {
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
            hasOverflow: document.documentElement.scrollWidth > window.innerWidth
        };
    });
    console.log('375px overflow check:', overflow375);

    // Verify Popular Products on mobile
    const popularCheck = await page.evaluate(async () => {
        const section = document.querySelector('.horizontal-products-section');
        const track = document.querySelector('.horizontal-products-track');
        const set1 = document.querySelector('.horizontal-products-set.is-clone');
        const set2 = document.querySelector('.horizontal-products-set.is-original');
        const firstCard = document.querySelector('.horizontal-product-card');

        const initialTransform = track ? track.style.transform : null;
        // Wait 300ms to observe auto-movement
        await new Promise((r) => setTimeout(r, 400));
        const laterTransform = track ? track.style.transform : null;

        const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 0;
        const cardWidthVw = (cardWidth / window.innerWidth) * 100;

        return {
            trackFound: !!track,
            cloneSetAriaHidden: set1 ? set1.getAttribute('aria-hidden') : null,
            originalSetFound: !!set2,
            initialTransform,
            laterTransform,
            transformsDiffer: initialTransform !== laterTransform,
            cardWidthPx: cardWidth,
            cardWidthVw: cardWidthVw.toFixed(1) + 'vw'
        };
    });
    console.log('Popular Products Mobile Check:', popularCheck);

    // Scroll to popular products and take screenshot
    await page.evaluate(() => {
        const el = document.querySelector('.horizontal-products-section');
        if (el) el.scrollIntoView({ block: 'center' });
    });
    await new Promise((r) => setTimeout(r, 500));

    const popMobilePath = path.join(artifactDir, 'screenshot_popular_products_mobile_375px.png');
    await page.screenshot({ path: popMobilePath });
    console.log('Captured:', popMobilePath);

    // Verify Flash Deals on mobile (2 columns grid, no horizontal scroll)
    const flashCheck = await page.evaluate(() => {
        const section = document.querySelector('.flash-deals-section');
        const productsGrid = document.querySelector('.flash-deals-products');
        const firstCard = document.querySelector('.flash-deal-card');
        const firstImg = document.querySelector('.flash-deal-image img');
        const computedGrid = productsGrid ? window.getComputedStyle(productsGrid) : null;
        const computedImg = firstImg ? window.getComputedStyle(firstImg) : null;

        return {
            gridDisplay: computedGrid ? computedGrid.display : null,
            gridTemplateColumns: computedGrid ? computedGrid.gridTemplateColumns : null,
            overflowX: computedGrid ? computedGrid.overflowX : null,
            cardWidth: firstCard ? firstCard.getBoundingClientRect().width : 0,
            hasHorizontalScroll: productsGrid ? productsGrid.scrollWidth > productsGrid.clientWidth : false
        };
    });
    console.log('Flash Deals Mobile Check:', flashCheck);

    // Scroll to Flash Deals and take screenshot
    await page.evaluate(() => {
        const el = document.querySelector('.flash-deals-section');
        if (el) el.scrollIntoView({ block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 500));

    const flashMobilePath = path.join(artifactDir, 'screenshot_flash_deals_grid_mobile_375px.png');
    await page.screenshot({ path: flashMobilePath });
    console.log('Captured:', flashMobilePath);

    // Check overflow at 414px and 768px
    await page.setViewport({ width: 414, height: 896 });
    await new Promise((r) => setTimeout(r, 300));
    const overflow414 = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    console.log('414px no horizontal scroll:', overflow414);

    await page.setViewport({ width: 768, height: 1024 });
    await new Promise((r) => setTimeout(r, 300));
    const overflow768 = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    console.log('768px no horizontal scroll:', overflow768);

    // Now test Desktop (1280px)
    console.log('Testing Desktop 1280px viewport...');
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto('http://localhost:5173/products.html', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.btn-colorful', { timeout: 8000 });

    // Verify Task 3 Button styling on desktop
    const buttonCheck = await page.evaluate(() => {
        const btn = document.querySelector('.btn-colorful');
        const icon = btn ? btn.querySelector('.btn-colorful-icon') : null;
        const badge = btn ? btn.querySelector('.btn-colorful-badge') : null;
        const style = btn ? window.getComputedStyle(btn) : null;

        return {
            btnFound: !!btn,
            iconFound: !!icon,
            badgeFound: !!badge,
            borderRadius: style ? style.borderRadius : null,
            minHeight: style ? style.minHeight : null,
            boxShadow: style ? style.boxShadow : null,
            background: style ? style.backgroundImage : null
        };
    });
    console.log('Button Desktop Check:', buttonCheck);

    // Scroll to Flash Deals button on desktop
    await page.evaluate(() => {
        const btn = document.querySelector('.btn-colorful');
        if (btn) btn.scrollIntoView({ block: 'center' });
    });
    await new Promise((r) => setTimeout(r, 500));

    // Normal button screenshot
    const btnNormalPath = path.join(artifactDir, 'screenshot_view_all_deals_desktop_normal.png');
    const footerElement = await page.$('.flash-deals-footer');
    if (footerElement) {
        await footerElement.screenshot({ path: btnNormalPath });
        console.log('Captured:', btnNormalPath);
    }

    // Hover button screenshot
    await page.hover('.btn-colorful');
    await new Promise((r) => setTimeout(r, 300));
    const btnHoverPath = path.join(artifactDir, 'screenshot_view_all_deals_desktop_hover.png');
    if (footerElement) {
        await footerElement.screenshot({ path: btnHoverPath });
        console.log('Captured:', btnHoverPath);
    }

    // Full section desktop screenshot
    const flashSection = await page.$('.flash-deals-section');
    if (flashSection) {
        const desktopSectionPath = path.join(artifactDir, 'screenshot_flash_deals_desktop_full.png');
        await flashSection.screenshot({ path: desktopSectionPath });
        console.log('Captured:', desktopSectionPath);
    }

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
    console.error('Test run failed:', err);
    process.exit(1);
});

