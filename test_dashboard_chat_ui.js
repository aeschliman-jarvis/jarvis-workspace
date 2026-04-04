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

  const input = page.locator('#chat-input');
  await input.fill('hello');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);

  const chatText = await page.locator('#chat-log').innerText().catch(() => '');
  console.log('CHAT_LOG_START');
  console.log(chatText);
  console.log('CHAT_LOG_END');

  await page.screenshot({ path: '/Users/jaeschliman/.openclaw/workspace/dashboard-chat-test.png', fullPage: false });
  console.log('SCREENSHOT /Users/jaeschliman/.openclaw/workspace/dashboard-chat-test.png');

  await browser.close();
})();
