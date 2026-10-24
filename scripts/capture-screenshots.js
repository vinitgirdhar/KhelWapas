const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function main() {
  const dir = path.join(process.cwd(), 'docs', 'assets', 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  console.log('1. Capturing homepage...');
  await page.goto('http://localhost:9002/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(dir, 'homepage.png') });

  console.log('2. Capturing catalog...');
  await page.goto('http://localhost:9002/shop/preowned', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(dir, 'catalog.png') });

  console.log('3. Capturing product detail...');
  await page.goto('http://localhost:9002/products/demo-cricket-batting-gloves', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(dir, 'product-detail.png') });

  console.log('4. Capturing sell equipment page...');
  await page.goto('http://localhost:9002/sell', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(dir, 'sell.png') });

  console.log('5. Capturing mobile view...');
  const mobileContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:9002/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(dir, 'mobile.png') });

  console.log('6. Capturing admin login / dashboard...');
  try {
    await page.goto('http://localhost:9002/admin/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@khelwapas.com');
    await page.fill('input[type="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/**', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(dir, 'admin.png') });
  } catch (err) {
    console.warn('Admin capture note:', err.message);
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
