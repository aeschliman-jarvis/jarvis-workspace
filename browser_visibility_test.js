const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://example.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.bringToFront();
  await page.waitForTimeout(5000);
  console.log('VISIBILITY_TEST_DONE');
})();
