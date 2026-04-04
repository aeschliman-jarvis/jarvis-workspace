const { chromium } = require('playwright');
const names = [
  'Lisa Stutz','Michelle Coleman','Vicki Scavo','Lisa Clark','Brenda Williams',
  'Margie Landry','Melecia Matias','David Valentine','Donna Silver','Garrett Mccarley'
];
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('app.remotesf.com/jobs')) || context.pages()[0];
  await page.bringToFront();
  for (const name of names) {
    try {
      await page.goto('https://app.remotesf.com/jobs', {waitUntil:'domcontentloaded'});
      await page.waitForTimeout(2000);
      const search = page.locator('input').first();
      await search.fill('');
      await search.fill(name);
      await page.waitForTimeout(2000);
      const body = await page.locator('body').innerText().catch(()=> '');
      const found = body.toLowerCase().includes(name.toLowerCase());
      console.log(`NAME: ${name} | FOUND: ${found}`);
      if (found) {
        const lines = body.split('\n').filter(l => l.toLowerCase().includes(name.toLowerCase()) || /(price|appointment|updated|view details)/i.test(l));
        console.log(lines.slice(0,20).join(' | '));
      }
    } catch(e) {
      console.log(`NAME: ${name} | ERROR: ${String(e)}`);
    }
  }
  await browser.close();
})();
