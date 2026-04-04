const { chromium } = require('playwright');
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function click(page, sel, label, timeout=5000){
  try { await page.locator(sel).first().click({ timeout }); console.log('ACTION: clicked '+label+' via '+sel); await sleep(1200); return true; } catch { return false; }
}
async function fill(page, sel, value, label, timeout=5000){
  try { const loc = page.locator(sel).first(); await loc.click({ timeout }); await sleep(200); await loc.fill(value); console.log('ACTION: filled '+label+' = '+value+' via '+sel); await sleep(700); return true; } catch { return false; }
}

(async()=>{
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url()||'').includes('console.cloud.google.com/auth/clients')) || context.pages().find(p => (p.url()||'').includes('console.cloud.google.com'));
  if (!page) throw new Error('Clients page not found');
  await page.bringToFront();
  await sleep(1200);

  await click(page, 'button:has-text("Create client"), text=/Create client/i', 'Create client');

  // Choose desktop app first: simplest local OAuth flow.
  await click(page, 'text=/Desktop app/i', 'Desktop app option');
  await click(page, '[role="option"]:has-text("Desktop app")', 'Desktop app role option');
  await click(page, 'li:has-text("Desktop app")', 'Desktop app list item');

  await fill(page, 'input', 'Jarvis Desktop OAuth', 'OAuth client name');

  await click(page, 'button:has-text("Create"), text=/Create/i', 'Create OAuth client');
  await sleep(4000);

  console.log('URL:', page.url());
  const body = await page.locator('body').innerText().catch(()=> '');
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 25000));
  console.log('---FINAL_BODY_END---');
})();
