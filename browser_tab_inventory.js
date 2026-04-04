const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const pages = context.pages();
  const rows = [];
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    let title = '';
    let url = '';
    try { title = await p.title(); } catch {}
    try { url = p.url(); } catch {}
    rows.push({ index: i, title, url });
  }
  console.log(JSON.stringify(rows, null, 2));
})();
