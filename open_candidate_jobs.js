const { chromium } = require('playwright');
const names = ['Shawn & Tracy Jones','Michelle & Kevin Killin','DeAnn Idso','Giles & Laura Lovejoy'];
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const base = context.pages().find(p => p.url().includes('app.remotesf.com/jobs'));
  await base.bringToFront();
  await base.waitForLoadState('domcontentloaded');
  for (const name of names) {
    try {
      await base.goto('https://app.remotesf.com/jobs', {waitUntil:'domcontentloaded'});
      const card = base.locator('.job').filter({ hasText: name }).first();
      await card.scrollIntoViewIfNeeded();
      await card.click({timeout:3000});
      await base.waitForTimeout(2500);
      const txt = await base.locator('body').innerText().catch(()=> '');
      console.log('\n===== '+name+' =====');
      console.log('URL', base.url());
      console.log(txt.slice(0,7000));
    } catch(e) {
      console.log('\n===== '+name+' ERROR =====');
      console.log(String(e));
    }
  }
  await browser.close();
})();
