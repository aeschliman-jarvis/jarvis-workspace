const { chromium } = require('playwright');

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('app.remotesf.com/jobs')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForLoadState('domcontentloaded');

  async function dump(label) {
    const txt = await page.locator('body').innerText().catch(()=> '');
    console.log('\n===== '+label+' =====\n');
    console.log(txt.slice(0,8000));
  }

  await dump('START');

  // Try a few likely navigation/search patterns without assuming exact DOM.
  const candidates = [
    {role:'link', name:/contacts/i},
    {role:'link', name:/customers/i},
    {role:'link', name:/jobs/i},
    {role:'link', name:/dashboard/i},
  ];
  for (const c of candidates) {
    const loc = page.getByRole(c.role, { name: c.name }).first();
    if (await loc.count().catch(()=>0)) {
      try { await loc.click({timeout:1500}); await page.waitForLoadState('domcontentloaded'); break; } catch(e) {}
    }
  }

  await dump('AFTER_NAV');

  // Collect likely visible names/status text.
  const body = await page.locator('body').innerText().catch(()=> '');
  const interesting = body.split('\n').filter(l => /(sold|closed|purple|lovejoy|monica|kevin|killin|jones|anderson|estimate|contact|customer)/i.test(l));
  console.log('\n===== INTERESTING LINES =====\n');
  console.log(interesting.slice(0,200).join('\n'));

  await browser.close();
})();
