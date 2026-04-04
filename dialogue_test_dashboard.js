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

  page.on('console', msg => console.log('BROWSER_CONSOLE', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE_ERROR', err.message));

  await page.waitForTimeout(2000);

  async function send(text) {
    console.log('\n=== SENDING ===', text);
    const input = page.locator('#chat-input');
    await input.fill(text);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2500);
    const sync = await page.locator('#last-sync').innerText().catch(() => '');
    const logText = await page.locator('#chat-log').innerText().catch(() => '');
    console.log('LAST_SYNC', sync);
    console.log('CHAT_LOG');
    console.log(logText || '[blank]');
  }

  await send('hello');
  await send('what is my current focus');
  await send('what are my top next tasks');

  await page.screenshot({ path: '/Users/jaeschliman/.openclaw/workspace/dashboard-dialogue-test.png', fullPage: false });
  console.log('SCREENSHOT /Users/jaeschliman/.openclaw/workspace/dashboard-dialogue-test.png');

  await browser.close();
})();
