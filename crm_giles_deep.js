const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function safeClick(locator, label, timeout = 5000) {
  try {
    await locator.first().click({ timeout });
    console.log('ACTION: clicked ' + label);
    await sleep(2500);
    return true;
  } catch {
    return false;
  }
}

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('app.remotesf.com')) || context.pages()[0];

  await page.bringToFront();
  console.log('ACTION: focused CRM tab');
  await sleep(1500);

  await page.goto('https://app.remotesf.com/jobs', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
  console.log('ACTION: opened jobs home');
  await sleep(2500);

  // Expand/select the Giles card.
  const gilesOptions = [
    page.locator('text=/Giles\\s*&\\s*Laura\\s*Lovejoy/i'),
    page.locator('text=/Lovejoy/i'),
    page.locator('text=/giles\\.lovejoy@gmail\\.com/i')
  ];
  let clicked = false;
  for (const loc of gilesOptions) {
    if (await safeClick(loc, 'Giles Lovejoy')) { clicked = true; break; }
  }

  // Try clicking nearby/details actions repeatedly if present.
  const actionPatterns = [
    ['text=/View Details/i', 'View Details'],
    ['text=/Details/i', 'Details'],
    ['text=/Estimate/i', 'Estimate'],
    ['text=/Proposal/i', 'Proposal'],
    ['text=/Job Details/i', 'Job Details'],
    ['text=/Open/i', 'Open']
  ];

  for (const [sel, label] of actionPatterns) {
    await safeClick(page.locator(sel), label);
  }

  // If still on list, inspect clickable elements around the page and try href/button candidates.
  const currentUrl = page.url();
  if (/\/jobs$/.test(currentUrl)) {
    const actionable = await page.evaluate(() => {
      const rows = [];
      const els = Array.from(document.querySelectorAll('a, button, [role="button"]'));
      for (const el of els) {
        const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        const href = el.tagName === 'A' ? el.href : '';
        rows.push({ text, href });
      }
      return rows;
    });
    console.log('---ACTIONABLES---');
    console.log(JSON.stringify(actionable.slice(0, 200), null, 2));

    const priorityTexts = ['View Details', 'Details', 'Estimate', 'Proposal', 'Open'];
    for (const t of priorityTexts) {
      const ok = await safeClick(page.locator(`text=${t}`), t, 3000);
      if (ok && !/\/jobs$/.test(page.url())) break;
    }
  }

  // Once deeper, keep drilling into estimate-ish controls.
  for (const [sel, label] of actionPatterns) {
    await safeClick(page.locator(sel), label);
  }

  const title = await page.title().catch(() => '');
  const url = page.url();
  const body = await page.locator('body').innerText().catch(() => '');
  console.log('---FINAL_TITLE---');
  console.log(title);
  console.log('---FINAL_URL---');
  console.log(url);
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 24000));
  console.log('---FINAL_BODY_END---');
})();
