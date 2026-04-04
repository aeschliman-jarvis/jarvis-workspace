const { chromium } = require('playwright');
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function click(page, sel, label, timeout=4000){
  try { await page.locator(sel).first().click({timeout}); console.log('ACTION: clicked '+label+' via '+sel); await sleep(700); return true; } catch { return false; }
}
async function fill(page, sel, value, label, timeout=4000){
  try { const loc = page.locator(sel).first(); await loc.click({timeout}); await sleep(150); await loc.fill(value); console.log('ACTION: filled '+label+' = '+value+' via '+sel); await sleep(500); return true; } catch { return false; }
}
async function addItem(page, query, fix36to30=false){
  await click(page, 'button:has-text("Add Line Item")', 'Add Line Item');
  await fill(page, 'input[placeholder*="search" i], input[type="search"]', query, 'line-item search');
  let selected = await click(page, `text=/${query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}/i`, 'select '+query, 2500);
  if (!selected) {
    // fallback: click first meaningful visible option in the open area
    const candidates = page.locator('text=/Onyx|Tear out|Plumbing|Installation|Fixture|Shower/i');
    if (await candidates.count().catch(()=>0)) {
      await candidates.first().click({timeout:2500}).catch(()=>{});
      console.log('ACTION: clicked closest visible fallback option for '+query);
      await sleep(700);
    }
  }

  // If description box exists, optionally correct size.
  const desc = page.locator('textarea[name="description"]').first();
  if (await desc.count().catch(()=>0)) {
    let cur = await desc.inputValue().catch(async()=>await desc.textContent().catch(()=>''));
    if (fix36to30 && (cur||'').includes('36 x 60')) {
      cur = cur.replace(/36 x 60/g, '30 x 60');
      await desc.fill(cur).catch(()=>{});
      console.log('ACTION: corrected description -> '+cur);
      await sleep(300);
    }
  }

  const qty = page.locator('input[name="quantity"]').first();
  if (await qty.count().catch(()=>0)) {
    await qty.fill('1').catch(()=>{});
    console.log('ACTION: set quantity 1');
    await sleep(250);
  }

  await click(page, 'button:has-text("Save Changes")', 'blue Save Changes');
  await sleep(1000);
}

(async()=>{
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url()||'').includes('/jobs/4440744/estimates/new')) || context.pages().find(p => (p.url()||'').includes('/jobs/4440744/estimates')) || context.pages().find(p => (p.url()||'').includes('app.remotesf.com'));
  await page.bringToFront();
  console.log('ACTION: focused AI BOT TEST estimate');
  await sleep(700);

  await addItem(page, 'Onyx Shower', true);
  await addItem(page, 'Tear out and Plumbing', false);
  await addItem(page, 'Installation of Onyx System', false);
  await addItem(page, 'Shower & Tub Fixtures', false);

  const body = await page.locator('body').innerText().catch(()=> '');
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 40000));
  console.log('---FINAL_BODY_END---');
})();
