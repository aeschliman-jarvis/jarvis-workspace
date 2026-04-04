const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('outlook')) || context.pages()[0];
  await page.bringToFront();
  await page.goto('https://outlook.office.com/calendar/view/week', {waitUntil:'domcontentloaded'}).catch(()=>{});
  await page.waitForTimeout(4000);
  const txt = await page.locator('body').innerText().catch(()=> '');
  console.log(txt.slice(0,12000));
  await browser.close();
})();
