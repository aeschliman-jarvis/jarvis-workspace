const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const pages = browser.contexts()[0].pages();
  for (const p of pages) {
    try {
      console.log('TAB', p.url(), '|', await p.title());
    } catch(e) {}
  }
  await browser.close();
})();
