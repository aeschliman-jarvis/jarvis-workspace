const { chromium } = require('playwright');
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function click(page, sel, label, timeout = 5000){
  try {
    await page.locator(sel).first().click({ timeout });
    console.log('ACTION: clicked ' + label + ' via ' + sel);
    await sleep(1200);
    return true;
  } catch { return false; }
}

(async()=>{
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url()||'').includes('console.cloud.google.com'));
  if (!page) throw new Error('Google Cloud Console tab not found');
  await page.bringToFront();
  console.log('ACTION: focused Google Cloud Console');
  await sleep(1500);

  // Try to open project selector.
  await click(page, 'button:has-text("Select a project")', 'Select a project');
  await click(page, 'text=/Select a project/i', 'Select a project text');
  await click(page, '[aria-label*="Select a project" i]', 'Select project aria');

  // Try create project path.
  await click(page, 'text=/New Project/i', 'New Project');
  await click(page, 'button:has-text("New Project")', 'New Project button');

  // Fill project name if field exists.
  try {
    const input = page.locator('input').filter({ has: page.locator('..') }).first();
    await input.click({ timeout: 3000 }).catch(()=>{});
  } catch {}

  const nameInputs = page.locator('input');
  const count = await nameInputs.count().catch(()=>0);
  for (let i=0;i<count;i++) {
    try {
      const inp = nameInputs.nth(i);
      const ph = await inp.getAttribute('placeholder').catch(()=> '');
      const aria = await inp.getAttribute('aria-label').catch(()=> '');
      const name = await inp.getAttribute('name').catch(()=> '');
      if ((ph||aria||name||'').toLowerCase().includes('project')) {
        await inp.fill('Jarvis Personal Ops').catch(()=>{});
        console.log('ACTION: filled project name');
        await sleep(1000);
        break;
      }
    } catch {}
  }

  await click(page, 'button:has-text("Create")', 'Create');
  await click(page, 'text=/Create/i', 'Create text');

  console.log('URL:', page.url());
  const body = await page.locator('body').innerText().catch(()=> '');
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 20000));
  console.log('---FINAL_BODY_END---');
})();
