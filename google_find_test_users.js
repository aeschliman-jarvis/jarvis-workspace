const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('console.cloud.google.com')) || context.pages()[0];
  await page.bringToFront();
  await page.goto('https://console.cloud.google.com/auth/audience?project=jarvis-personal-ops', {waitUntil:'domcontentloaded'}).catch(()=>{});
  await page.waitForTimeout(5000);
  const text = await page.locator('body').innerText().catch(()=> '');
  console.log(text.slice(0,12000));
  await browser.close();
})();
