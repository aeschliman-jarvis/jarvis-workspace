const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  await page.goto('https://www.google.com/search?q=Granite+Transformations+of+Nashville', {waitUntil:'domcontentloaded'}).catch(()=>{});
  await page.waitForTimeout(4000);
  const text = await page.locator('body').innerText().catch(()=> '');
  console.log(text.slice(0,8000));
  await browser.close();
})();
