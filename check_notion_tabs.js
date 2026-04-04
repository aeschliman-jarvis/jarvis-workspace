const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  for (const p of context.pages()) {
    try {
      const url = p.url();
      const title = await p.title();
      if (url.includes('notion.so')) {
        await p.bringToFront();
        await p.waitForTimeout(1000);
        const body = await p.locator('body').innerText().catch(()=> '');
        console.log('URL', url);
        console.log('TITLE', title);
        console.log(body.slice(0,3000));
      }
    } catch(e) {}
  }
  await browser.close();
})();
