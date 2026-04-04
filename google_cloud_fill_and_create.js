const { chromium } = require('playwright');
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
(async()=>{
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url()||'').includes('console.cloud.google.com/projectcreate'));
  if (!page) throw new Error('projectcreate page not found');
  await page.bringToFront();
  await sleep(1000);

  const all = page.locator('input');
  const count = await all.count().catch(()=>0);
  for (let i=0;i<count;i++) {
    const inp = all.nth(i);
    const aria = await inp.getAttribute('aria-label').catch(()=> '');
    const ph = await inp.getAttribute('placeholder').catch(()=> '');
    const name = await inp.getAttribute('name').catch(()=> '');
    const val = await inp.inputValue().catch(()=> '');
    console.log('INPUT', i, {aria, ph, name, val});
    if ((aria+' '+ph+' '+name).toLowerCase().includes('project')) {
      await inp.click({ timeout: 3000 }).catch(()=>{});
      await sleep(200);
      await inp.fill('Jarvis Personal Ops').catch(()=>{});
      console.log('ACTION: force-filled project name');
      await sleep(700);
    }
  }

  await page.locator('button:has-text("Create")').first().click({ timeout: 5000 }).catch(()=>{});
  console.log('ACTION: clicked Create');
  await sleep(6000);
  console.log('URL:', page.url());
  const body = await page.locator('body').innerText().catch(()=> '');
  console.log(body.slice(0, 20000));
})();
