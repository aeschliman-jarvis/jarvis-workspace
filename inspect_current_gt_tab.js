const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  // use most recently active-looking GT tab by checking visibility/frontmost-ish after user opened it
  const gtPages = pages.filter(p => p.url().includes('crm.mygtrecords.info'));
  for (let idx = gtPages.length - 1; idx >= 0; idx--) {
    const p = gtPages[idx];
    try {
      await p.bringToFront();
      await p.waitForTimeout(1200);
      const title = await p.title();
      const body = await p.locator('body').innerText().catch(()=> '');
      console.log('URL', p.url());
      console.log('TITLE', title);
      console.log('BODY', body.slice(0,4000));
      break;
    } catch (e) {
      console.log('ERR', String(e));
    }
  }
  await browser.close();
})();
