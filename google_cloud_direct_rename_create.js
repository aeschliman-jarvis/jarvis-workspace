const { chromium } = require('playwright');
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

(async()=>{
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url()||'').includes('console.cloud.google.com/projectcreate')) || context.pages().find(p => (p.url()||'').includes('console.cloud.google.com'));
  if (!page) throw new Error('Google Cloud project page not found');
  await page.bringToFront();
  await sleep(1200);

  const inputs = page.locator('input');
  const count = await inputs.count().catch(()=>0);
  let renamed = false;

  for (let i = 0; i < count; i++) {
    const inp = inputs.nth(i);
    const val = await inp.inputValue().catch(()=> '');
    console.log('INPUT', i, 'VAL=', val);
    if ((val || '').includes('My Project')) {
      await inp.click({ timeout: 4000 }).catch(()=>{});
      await sleep(200);
      // select all + replace
      await inp.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A').catch(()=>{});
      await sleep(100);
      await inp.fill('Jarvis Personal Ops').catch(()=>{});
      console.log('ACTION: renamed project to Jarvis Personal Ops');
      renamed = true;
      await sleep(1000);
      break;
    }
  }

  if (!renamed) {
    throw new Error('Could not find project name input');
  }

  await page.locator('button:has-text("Create")').first().click({ timeout: 5000 }).catch(()=>{});
  console.log('ACTION: clicked Create');
  await sleep(8000);
  console.log('URL:', page.url());
  const body = await page.locator('body').innerText().catch(()=> '');
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 20000));
  console.log('---FINAL_BODY_END---');
})();
