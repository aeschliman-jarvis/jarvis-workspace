const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('/3362225c1eac80cfa382dda618acb112')) || context.pages().find(p => p.url().includes('notion.so'));
  await page.bringToFront();
  await page.waitForTimeout(1200);

  const title = page.locator('h1[role="textbox"]').first();
  await title.click();
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  await page.keyboard.type('Jarvis Hub');
  await page.waitForTimeout(800);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  const blockText = [
    'Jarvis Hub',
    '',
    'Mission',
    'Build a visual operating system for Jacob and Jarvis: clear, usable, customizable, and tied to real execution.',
    '',
    'Now',
    '- Current Focus',
    '- Top Priorities',
    '- Next Actions',
    '- Waiting / Blocked',
    '',
    'Command Center',
    '- Chat with Jarvis',
    '- Workflows',
    '- Projects',
    '- Second Brain',
    '- Activity Feed',
    '- System State',
    '',
    'Projects',
    '- Dashboard / Command Center',
    '- Granite Transformations research',
    '- GT Records / CRM understanding',
    '- Google / Notion operating hub',
    '',
    'Second Brain',
    '- Ideas',
    '- Decisions',
    '- Preferences',
    '- References',
    '',
    'Operating Rules',
    '- Keep continuity outside chat',
    '- Prefer systems over one-off fixes',
    '- Keep visible state honest',
    '- Show execution, not just outputs',
  ].join('\n');

  await page.keyboard.type(blockText, { delay: 5 });
  await page.waitForTimeout(1500);

  console.log('URL', page.url());
  console.log('TITLE', await page.title());
  console.log((await page.locator('body').innerText().catch(()=> '')).slice(0,5000));
  await browser.close();
})();
