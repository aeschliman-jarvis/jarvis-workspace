const { chromium } = require('playwright');

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('notion.so'));
  if (!page) throw new Error('No live Notion page found');
  await page.bringToFront();
  await page.waitForTimeout(1200);

  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(500);

  const body0 = await page.locator('body').innerText().catch(()=> '');
  if (!/Granite Transformations/i.test(body0)) {
    throw new Error('Granite Transformations page is not the active visible Notion page');
  }

  const cleanLines = [
    'Transformation Research Snapshot',
    '',
    'Objective',
    'Build a practical understanding of Granite Transformations as an operating target: business model, market position, service footprint, customer journey, brand posture, and likely leverage points for sales and ops support.',
    '',
    'What Granite Transformations appears to be',
    '• A home-services/remodeling brand focused on bath, shower, and kitchen transformation work.',
    '• Positioned around speed, convenience, reduced disruption, and visible improvement.',
    '• Likely sells trust, simplicity, financing, and project confidence more than raw materials alone.',
    '',
    'Probable offer structure',
    '• Bathroom remodels and shower conversions.',
    '• Kitchen or surface-refresh related upgrades.',
    '• In-home consultative estimate with narrowed design choices and financing discussion.',
    '• Mid-ticket homeowner offer where certainty and convenience matter heavily.',
    '',
    'Customer psychology',
    '• Wants a visible upgrade without a nightmare remodel process.',
    '• Fear points: mess, delays, bad communication, hidden costs, sketchy contractors.',
    '• Buying triggers: outdated bathroom, accessibility needs, preparing to sell, delayed project finally becoming urgent.',
    '• Winning message is likely certainty, simplicity, speed, and outcome — not materials-first.',
    '',
    'Sales implications',
    '• Lead response speed matters.',
    '• Estimate experience likely has outsized impact on close rate.',
    '• Visual proof, installer trust, and financing framing likely drive conversion.',
    '• Follow-up discipline likely creates meaningful revenue lift.',
    '',
    'Operational leverage points Jarvis should care about',
    '• Lead intake and qualification quality.',
    '• Estimate prep and estimate consistency.',
    '• CRM hygiene and stage visibility.',
    '• Post-estimate follow-up automation.',
    '• Marketing-to-appointment attribution.',
    '• Objection capture and script refinement.',
    '',
    'Next research questions',
    '• Exact service lines and margins by category.',
    '• Franchise vs local branch structure.',
    '• Best lead sources by conversion quality.',
    '• Typical job size, sales cycle, and financing attach rate.',
    '• Core objections and where deals die.',
    '• Customer review themes.',
    '',
    'Why this matters inside Jarvis',
    'If Jarvis is going to support Granite meaningfully, the system should anchor on real bottlenecks: response speed, estimate quality, pipeline clarity, and repeatable follow-up — not vague AI assistance.'
  ];

  // Try to target the bad comment/editor block first.
  const textboxes = page.locator('div[role="textbox"], h1[role="textbox"]');
  const count = await textboxes.count();
  let replaced = false;

  for (let i = 0; i < count; i++) {
    const loc = textboxes.nth(i);
    const txt = (await loc.innerText().catch(()=> '')).trim();
    if (/Transformation Research Snapshot|ObjectiveBuild a pract|hat Granite Transformations appears to be|Lead intake and qualification quality/i.test(txt)) {
      await loc.click({ timeout: 5000 }).catch(()=>{});
      await page.waitForTimeout(200);
      await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A').catch(()=>{});
      await page.waitForTimeout(100);
      await page.keyboard.type(cleanLines[0], { delay: 1 }).catch(()=>{});
      for (const line of cleanLines.slice(1)) {
        await page.keyboard.press('Enter').catch(()=>{});
        await page.waitForTimeout(30);
        if (line) await page.keyboard.type(line, { delay: 1 }).catch(()=>{});
      }
      replaced = true;
      break;
    }
  }

  if (!replaced) {
    // Fallback: use the first Add comment field as the bad insertion target if focus previously landed there.
    const comment = page.locator('div[role="textbox"]').filter({ hasText: '' }).nth(count - 1);
    await comment.click({ timeout: 3000 }).catch(()=>{});
    await page.waitForTimeout(200);
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A').catch(()=>{});
    await page.waitForTimeout(100);
    await page.keyboard.type(cleanLines[0], { delay: 1 }).catch(()=>{});
    for (const line of cleanLines.slice(1)) {
      await page.keyboard.press('Enter').catch(()=>{});
      await page.waitForTimeout(30);
      if (line) await page.keyboard.type(line, { delay: 1 }).catch(()=>{});
    }
  }

  await page.waitForTimeout(2500);
  const body = await page.locator('body').innerText().catch(()=> '');
  console.log(body.slice(0,5000));
  await browser.close();
})();
