const { chromium } = require('playwright');
(async()=>{
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url()||'').includes('console.cloud.google.com'));
  if (!page) throw new Error('Google Cloud/Auth tab not found');
  await page.bringToFront();
  console.log('URL:', page.url());
  console.log('TITLE:', await page.title().catch(()=>''));
  const body = await page.locator('body').innerText().catch(()=> '');
  console.log(body.slice(0, 20000));
})();
