const { chromium } = require('playwright');
(async() => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const contexts = browser.contexts();
    const context = contexts[0] || await browser.newContext();
    const page = context.pages()[0] || await context.newPage();
    await page.bringToFront();
    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('BROWSER_OK');
    console.log(await page.title());
    // do not close the browser; it's the user's Chrome session
  } catch (e) {
    console.error('BROWSER_FAIL');
    console.error(e && e.stack ? e.stack : String(e));
    process.exit(1);
  }
})();
