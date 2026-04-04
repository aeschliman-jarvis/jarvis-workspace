const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('crm.mygtrecords.info'));
  if (!page) { console.log('NO_PAGE'); await browser.close(); return; }
  await page.bringToFront();
  const body = await page.locator('body').innerText().catch(()=> '');
  console.log(body.slice(0,3000));
  const ls = await page.evaluate(() => ({ls: {...localStorage}, ss: {...sessionStorage}, cookies: document.cookie})).catch(()=>({}));
  console.log(JSON.stringify(ls, null, 2).slice(0,3000));
  await browser.close();
})();
