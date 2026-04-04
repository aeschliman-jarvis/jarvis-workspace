const { chromium } = require('playwright');

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('notion.so')) || await context.newPage();
  await page.bringToFront();
  await page.goto(page.url(), { waitUntil: 'domcontentloaded' }).catch(()=>{});
  await page.waitForTimeout(2500);

  async function clickText(text) {
    const loc = page.getByText(text, { exact: true }).first();
    if (await loc.count().catch(() => 0)) {
      await loc.click({ timeout: 2000 }).catch(() => {});
      return true;
    }
    return false;
  }

  await clickText('Add new');
  await page.waitForTimeout(1200);

  const titleInput = page.locator('input[placeholder*="Untitled"], textarea[placeholder*="Untitled"], [contenteditable="true"]').first();
  await titleInput.click().catch(()=>{});
  await page.keyboard.type('Jarvis Hub');
  await page.waitForTimeout(1200);

  const body = await page.locator('body').innerText().catch(()=> '');
  console.log('URL', page.url());
  console.log('TITLE', await page.title());
  console.log(body.slice(0,3000));

  await browser.close();
})();
