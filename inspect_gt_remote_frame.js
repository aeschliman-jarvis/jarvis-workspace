const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('crm.mygtrecords.info/software/html5.html'));
  await page.bringToFront();
  await page.waitForTimeout(2000);
  for (const f of page.frames()) {
    try {
      const html = await f.content();
      console.log('\nFRAME URL:', f.url());
      console.log(html.slice(0,12000));
    } catch (e) {
      console.log('\nFRAME URL:', f.url());
      console.log('ERR', String(e));
    }
  }
  await browser.close();
})();
