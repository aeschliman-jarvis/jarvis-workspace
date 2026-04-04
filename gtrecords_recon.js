const { chromium } = require('playwright');

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  const page = pages.find(p => p.url().includes('crm.mygtrecords.info')) || await context.newPage();
  await page.bringToFront();
  await page.goto('https://crm.mygtrecords.info', {waitUntil:'domcontentloaded'}).catch(()=>{});
  await page.waitForTimeout(5000);

  async function snap(label) {
    const title = await page.title().catch(()=> '');
    const url = page.url();
    const text = await page.locator('body').innerText().catch(()=> '');
    console.log(`\n===== ${label} =====`);
    console.log('TITLE:', title);
    console.log('URL:', url);
    console.log(text.slice(0,5000));
  }

  await snap('LANDING');

  // Inventory clickable text elements.
  const items = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('a, button, [role="button"], input[type="button"], input[type="submit"], div, span'));
    const out = [];
    for (const el of els) {
      const txt = (el.innerText || el.value || '').trim().replace(/\s+/g,' ');
      if (!txt) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 5 || rect.height < 5) continue;
      out.push(txt);
    }
    return [...new Set(out)].slice(0,300);
  });
  console.log('\n===== CLICKABLE_TEXT_CANDIDATES =====');
  console.log(items.join('\n'));

  // Try clicking a small number of obvious nav items if present.
  const targets = ['Customer', 'Customers', 'Search', 'Sales', 'Reports', 'Appointments', 'Leads', 'Jobs', 'Orders', 'Production'];
  for (const target of targets) {
    try {
      const loc = page.locator(`text=${target}`).first();
      if (await loc.count()) {
        await loc.click({timeout:2000}).catch(()=>{});
        await page.waitForTimeout(2500);
        await snap(`AFTER_${target.toUpperCase()}`);
      }
    } catch(e) {}
  }

  await browser.close();
})();
