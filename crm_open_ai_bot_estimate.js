const { chromium } = require('playwright');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
async function click(page, sel, label, timeout = 5000) {
  try {
    await page.locator(sel).first().click({ timeout });
    console.log('ACTION: clicked ' + label + ' via ' + sel);
    await sleep(1200);
    return true;
  } catch { return false; }
}
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages().find(p => (p.url() || '').includes('app.remotesf.com/jobs')) || context.pages()[0];
  await page.bringToFront();
  console.log('ACTION: focused customer list');
  await sleep(700);
  await click(page, 'text=/ai\\.bot\\.test@example\\.com/i', 'AI BOT TEST customer');
  await click(page, 'text=/View Details/i', 'View Details');
  await click(page, 'text=/Estimate/i', 'Estimate section');
  await click(page, 'button:has-text("Add Estimate")', 'Add Estimate');
  console.log('URL:', page.url());
  const body = await page.locator('body').innerText().catch(() => '');
  console.log('---FINAL_BODY_START---');
  console.log(body.slice(0, 20000));
  console.log('---FINAL_BODY_END---');
})();
