const { chromium } = require('playwright');

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('/Jarvis-Hub-3362225c1eac80cfa382dda618acb112')) || context.pages().find(p => p.url().includes('3362225c1eac80cfa382dda618acb112'));
  await page.bringToFront();
  await page.waitForTimeout(2000);

  // Select body area and clear rough seeded content below title.
  await page.keyboard.press('Escape').catch(()=>{});
  await page.mouse.click(420, 260);
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A').catch(()=>{});
  await page.keyboard.press('Backspace').catch(()=>{});
  await page.waitForTimeout(1000);

  const content = [
    'Mission',
    'Build a visual operating system for Jacob and Jarvis that is clear, customizable, execution-oriented, and better than raw text files for everyday use.',
    '',
    'Home',
    '- Current Focus',
    '- Priorities',
    '- What Changed',
    '- Waiting / Blocked',
    '',
    'Command Center',
    '- Chat with Jarvis',
    '- Workflow Runner',
    '- Execution / Jobs',
    '- Browser + Tool Control',
    '',
    'Projects',
    '- Dashboard / Command Center',
    '- Granite Transformations',
    '- GT Records / CRM Understanding',
    '- Notion / Google Operating Hub',
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
    '- Make execution visible',
    '- Keep the UI simple on the surface and deep underneath',
  ].join('\n');

  await page.keyboard.type(content, { delay: 5 });
  await page.waitForTimeout(1500);

  // Add dividers between major groups with slash command.
  async function addDivider() {
    await page.keyboard.press('Enter');
    await page.keyboard.type('/divider');
    await page.waitForTimeout(700);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  }

  await addDivider();
  await addDivider();
  await addDivider();

  console.log('URL', page.url());
  console.log('TITLE', await page.title());
  console.log((await page.locator('body').innerText().catch(()=> '')).slice(0,5000));
  await browser.close();
})();
