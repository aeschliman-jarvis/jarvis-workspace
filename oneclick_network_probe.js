const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('app.remotesf.com')) || context.pages()[0];
  await page.bringToFront();
  const seen = [];
  page.on('request', req => {
    const u = req.url();
    if (/remotesf|api\./i.test(u)) {
      seen.push({method:req.method(), url:u});
    }
  });
  await page.goto('https://app.remotesf.com/jobs', {waitUntil:'networkidle'}).catch(()=>{});
  await page.waitForTimeout(3000);
  const uniq = [];
  const done = new Set();
  for (const x of seen) {
    const k = x.method+' '+x.url;
    if (!done.has(k)) { done.add(k); uniq.push(x); }
  }
  console.log(JSON.stringify(uniq.slice(0,120), null, 2));
  await browser.close();
})();
