const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('app.remotesf.com')) || context.pages()[0];

  await page.bringToFront();
  console.log('ACTION: focused CRM tab');
  await sleep(2000);

  // Return to a stable top-level view.
  await page.goto('https://app.remotesf.com/jobs', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
  console.log('ACTION: opened jobs home');
  await sleep(2500);

  const body1 = await page.locator('body').innerText().catch(() => '');
  console.log('---HOME_BODY_START---');
  console.log(body1.slice(0, 12000));
  console.log('---HOME_BODY_END---');

  // Gather clickable texts and hrefs/buttons to find closest name match.
  const candidates = await page.evaluate(() => {
    const rows = [];
    const els = Array.from(document.querySelectorAll('a, button, [role="button"], td, li, div, span'));
    for (const el of els) {
      const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
      if (!text || text.length > 80) continue;
      const href = el.tagName === 'A' ? el.href : '';
      rows.push({ text, href, tag: el.tagName });
    }
    return rows;
  });

  const targetWords = ['giles', 'lovejoy'];
  function score(s) {
    const t = (s || '').toLowerCase();
    let sc = 0;
    if (t.includes('giles')) sc += 3;
    if (t.includes('lovejoy')) sc += 4;
    for (const w of targetWords) if (t.includes(w)) sc += 1;
    return sc;
  }

  const ranked = [...candidates]
    .map(c => ({ ...c, score: score(c.text) }))
    .filter(c => c.score > 0)
    .sort((a,b) => b.score - a.score || a.text.localeCompare(b.text));

  console.log('---RANKED_MATCHES---');
  console.log(JSON.stringify(ranked.slice(0, 20), null, 2));

  if (ranked.length === 0) {
    console.log('NO_MATCHES_FOUND');
    return;
  }

  const chosen = ranked[0].text;
  const loc = page.locator(`text=${chosen}`).first();
  await loc.click({ timeout: 5000 }).catch(() => {});
  console.log('ACTION: clicked closest match -> ' + chosen);
  await sleep(3000);

  // Try estimate-related navigation after opening.
  const estimateLoc = page.locator('text=/estimate/i').first();
  if (await estimateLoc.count().catch(() => 0)) {
    await estimateLoc.click({ timeout: 5000 }).catch(() => {});
    console.log('ACTION: clicked estimate');
    await sleep(3000);
  }

  const title = await page.title().catch(() => '');
  const url = page.url();
  const body2 = await page.locator('body').innerText().catch(() => '');
  console.log('---FINAL_TITLE---');
  console.log(title);
  console.log('---FINAL_URL---');
  console.log(url);
  console.log('---FINAL_BODY_START---');
  console.log(body2.slice(0, 16000));
  console.log('---FINAL_BODY_END---');
})();
