const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  let page = context.pages().find(p => p.url().includes('127.0.0.1:4318'));
  if (!page) {
    page = await context.newPage();
    await page.goto('http://127.0.0.1:4318', { waitUntil: 'domcontentloaded' });
  } else {
    await page.bringToFront();
    await page.reload({ waitUntil: 'domcontentloaded' });
  }
  await page.waitForTimeout(2000);

  const sync = await page.locator('#last-sync').innerText().catch(()=> '');
  const exec = await page.locator('#execution-strip').innerText().catch(()=> '');
  const mode = await page.locator('#chat-mode-pill').innerText().catch(()=> '');
  const chips = await page.locator('.prompt-chip').allInnerTexts().catch(()=> []);
  console.log('SYNC', sync);
  console.log('EXEC', exec);
  console.log('MODE', mode);
  console.log('CHIPS', JSON.stringify(chips));

  await page.locator('#chat-input').fill('hello');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
  console.log('CHAT', await page.locator('#chat-log').innerText().catch(()=> ''));
  await page.screenshot({ path: '/Users/jaeschliman/.openclaw/workspace/dashboard-hardened-test.png', fullPage: false });
  console.log('SCREENSHOT /Users/jaeschliman/.openclaw/workspace/dashboard-hardened-test.png');
  await browser.close();
})();
