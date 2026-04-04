const { chromium } = require('playwright');
(async()=>{
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const rows = [];
  for (const p of context.pages()) {
    rows.push({ title: await p.title().catch(()=>''), url: p.url() });
  }
  console.log(JSON.stringify(rows, null, 2));
})();
