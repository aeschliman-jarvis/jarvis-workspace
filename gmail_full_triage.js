const { chromium } = require('playwright');
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

(async()=>{
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  let page = context.pages().find(p => (p.url()||'').includes('mail.google.com'));
  if (!page) throw new Error('Gmail tab not found');
  await page.bringToFront();
  console.log('ACTION: focused Gmail');
  await sleep(1500);

  // Try to standardize inbox view.
  await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil:'domcontentloaded', timeout:30000 }).catch(()=>{});
  await sleep(3000);
  console.log('ACTION: opened inbox');

  const body = await page.locator('body').innerText().catch(()=> '');
  console.log('---GMAIL_INBOX_START---');
  console.log(body.slice(0, 25000));
  console.log('---GMAIL_INBOX_END---');

  // Gather visible threads from rows.
  const rows = await page.evaluate(() => {
    const out = [];
    const candidates = Array.from(document.querySelectorAll('tr, [role="main"] tr, [data-legacy-thread-id]'));
    for (const el of candidates) {
      const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
      if (!text) continue;
      if (text.length < 8) continue;
      out.push(text);
    }
    return out.slice(0, 50);
  }).catch(()=>[]);
  console.log('---VISIBLE_ROWS_START---');
  console.log(JSON.stringify(rows, null, 2));
  console.log('---VISIBLE_ROWS_END---');
})();
