const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('127.0.0.1:4318')) || await context.newPage();
  await page.goto('http://127.0.0.1:4318', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  page.on('console', msg => console.log('BROWSER_CONSOLE', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE_ERROR', err.message));

  const before = await page.evaluate(() => ({
    hasForm: !!document.querySelector('#chat-form'),
    hasInput: !!document.querySelector('#chat-input'),
    hasLog: !!document.querySelector('#chat-log'),
    appJsLoaded: Array.from(document.scripts).map(s => s.src),
    chatLogHtml: document.querySelector('#chat-log')?.innerHTML || null,
  }));
  console.log('BEFORE', JSON.stringify(before, null, 2));

  await page.locator('#chat-input').fill('hello');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);

  const after = await page.evaluate(() => ({
    chatLogHtml: document.querySelector('#chat-log')?.innerHTML || null,
    chatLogText: document.querySelector('#chat-log')?.innerText || null,
    lastSync: document.querySelector('#last-sync')?.innerText || null,
  }));
  console.log('AFTER', JSON.stringify(after, null, 2));
  await browser.close();
})();
