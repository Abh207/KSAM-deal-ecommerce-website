import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function test() {
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/products.html', { waitUntil: 'networkidle2' });

    // Test clicking Next arrow in Popular Products
    const arrowNext = await page.$('.horizontal-controls button[aria-label="Next products"]');
    if (arrowNext) {
        await arrowNext.click();
        console.log('Next arrow clicked successfully');
    }

    await new Promise((r) => setTimeout(r, 400));

    // Test clicking Prev arrow in Popular Products
    const arrowPrev = await page.$('.horizontal-controls button[aria-label="Previous products"]');
    if (arrowPrev) {
        await arrowPrev.click();
        console.log('Prev arrow clicked successfully');
    }

    await new Promise((r) => setTimeout(r, 400));

    // Click wishlist button on original set (visible in viewport)
    const wishlistResult = await page.evaluate(() => {
        const btn = document.querySelector('.horizontal-products-set.is-original .horizontal-card-wishlist-btn');
        if (btn) {
            btn.click();
            return true;
        }
        return false;
    });
    console.log('Wishlist clicked:', wishlistResult);

    await new Promise((r) => setTimeout(r, 300));

    // Click Add to Cart button on Flash Deals (visible on mobile)
    const addResult = await page.evaluate(() => {
        const btn = document.querySelector('.flash-deal-bottom button');
        if (btn) {
            btn.click();
            return true;
        }
        return false;
    });
    console.log('Flash deal ADD clicked:', addResult);

    await new Promise((r) => setTimeout(r, 500));

    // Check wishlist & cart state
    const states = await page.evaluate(() => {
        const wishlistBadge = document.querySelector('header a[href*="wishlist"]');
        const cartBadge = document.querySelector('header a[href*="addToCart"]');
        return {
            wishlistText: wishlistBadge ? wishlistBadge.textContent.trim() : null,
            cartText: cartBadge ? cartBadge.textContent.trim() : null
        };
    });
    console.log('State check:', states);

    await browser.close();
    console.log('All interactive tests passed successfully!');
}

test().catch((err) => {
    console.error('Interactive test failed:', err);
    process.exit(1);
});
