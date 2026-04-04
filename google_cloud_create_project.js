const { chromium } = require('playwright');
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
(async()=>{
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url()||'').includes('console.cloud.google.com/projectcreate')) || context.pages().find(p => (p.url()||'').includes('console.cloud.google.com'));
  if (!page) throw new Error('Google Cloud project page not found');
  await page.bringToFront();
  await sleep(1000);
  try {
    const inputs = page.locator('input');
    const count = await inputs.count().catch(()=>0);
    for (let i=0;i<count;i++) {
      const inp = inputs.nth(i);
      const aria = await inp.getAttribute('aria-label').catch(()=> '');
      const ph = await inp.getAttribute('placeholder').catch(()=> '');
      const name = await inp.getAttribute('name').catch(()=> '');
      const sig = (aria + ' ' + ph + ' ' + name).toLowerCase();
      if (sig.includes('project')) {
        await inp.fill('Jarvis Personal Ops').catch(()=>{});
        console.log('ACTION: filled project name');
        await sleep(500);
        break;
      }
    }
  } catch {}

  await page.locator('button:has-text("Create"), text=/Create/i').first().click({ timeout: 5000 }).catch(()=>{});
  console.log('ACTION: clicked Create project');
  await sleep(6000);
  console.log('URL:', page.url());
  const body = await page.locator('body').innerText().catch(()=> '');
  console.log(body.slice(0, 20000));
})();
