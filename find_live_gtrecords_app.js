const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  let i = 0;
  for (const p of context.pages()) {
    try {
      const title = await p.title();
      const url = p.url();
      await p.bringToFront();
      await p.waitForTimeout(800);
      const body = await p.locator('body').innerText().catch(()=> '');
      console.log(`\n=== TAB ${i++} ===`);
      console.log('URL:', url);
      console.log('TITLE:', title);
      console.log(body.slice(0,1500));
    } catch(e) {
      console.log(`\n=== TAB ${i++} ERROR ===`);
      console.log(String(e));
    }
  }
  await browser.close();
})();
