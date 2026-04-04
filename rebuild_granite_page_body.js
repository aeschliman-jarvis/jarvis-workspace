const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('notion.so'));
  if (!page) throw new Error('No live Notion page found');
  await page.bringToFront();
  await page.waitForTimeout(1200);

  const cleanLines = [
    'Transformation Research Snapshot',
    'Objective',
    'Build a practical understanding of Granite Transformations as an operating target: business model, market position, service footprint, customer journey, brand posture, and likely leverage points for sales and ops support.',
    'What Granite Transformations appears to be',
    '• A home-services/remodeling brand focused on bath, shower, and kitchen transformation work.',
    '• Positioned around speed, convenience, reduced disruption, and visible improvement.',
    '• Likely sells trust, simplicity, financing, and project confidence more than raw materials alone.',
    'Probable offer structure',
    '• Bathroom remodels and shower conversions.',
    '• Kitchen or surface-refresh related upgrades.',
    '• In-home consultative estimate with narrowed design choices and financing discussion.',
    '• Mid-ticket homeowner offer where certainty and convenience matter heavily.',
    'Customer psychology',
    '• Wants a visible upgrade without a nightmare remodel process.',
    '• Fear points: mess, delays, bad communication, hidden costs, sketchy contractors.',
    '• Buying triggers: outdated bathroom, accessibility needs, preparing to sell, delayed project finally becoming urgent.',
    '• Winning message is likely certainty, simplicity, speed, and outcome — not materials-first.',
    'Sales implications',
    '• Lead response speed matters.',
    '• Estimate experience likely has outsized impact on close rate.',
    '• Visual proof, installer trust, and financing framing likely drive conversion.',
    '• Follow-up discipline likely creates meaningful revenue lift.',
    'Operational leverage points Jarvis should care about',
    '• Lead intake and qualification quality.',
    '• Estimate prep and estimate consistency.',
    '• CRM hygiene and stage visibility.',
    '• Post-estimate follow-up automation.',
    '• Marketing-to-appointment attribution.',
    '• Objection capture and script refinement.',
    'Next research questions',
    '• Exact service lines and margins by category.',
    '• Franchise vs local branch structure.',
    '• Best lead sources by conversion quality.',
    '• Typical job size, sales cycle, and financing attach rate.',
    '• Core objections and where deals die.',
    '• Customer review themes.',
    'Why this matters inside Jarvis',
    'If Jarvis is going to support Granite meaningfully, the system should anchor on real bottlenecks: response speed, estimate quality, pipeline clarity, and repeatable follow-up — not vague AI assistance.'
  ];

  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(300);

  const title = page.locator('h1[role="textbox"]').filter({ hasText: 'Granite Transformations' }).first();
  await title.click({ timeout: 5000 });
  await page.waitForTimeout(300);
  await page.keyboard.press('ArrowRight').catch(()=>{});
  await page.keyboard.press('Enter').catch(()=>{});
  await page.waitForTimeout(800);

  // We should now have a page body block, not the comment field.
  for (const line of cleanLines) {
    if (line === 'Transformation Research Snapshot' || line === 'Objective' || line === 'What Granite Transformations appears to be' || line === 'Probable offer structure' || line === 'Customer psychology' || line === 'Sales implications' || line === 'Operational leverage points Jarvis should care about' || line === 'Next research questions' || line === 'Why this matters inside Jarvis') {
      await page.keyboard.type('/heading 2', { delay: 2 }).catch(()=>{});
      await page.waitForTimeout(400);
      await page.keyboard.press('Enter').catch(()=>{});
      await page.waitForTimeout(400);
      await page.keyboard.type(line, { delay: 1 }).catch(()=>{});
    } else {
      await page.keyboard.type(line, { delay: 1 }).catch(()=>{});
    }
    await page.keyboard.press('Enter').catch(()=>{});
    await page.waitForTimeout(80);
  }

  await page.waitForTimeout(2000);
  console.log((await page.locator('body').innerText().catch(()=> '')).slice(0,5000));
  await browser.close();
})();
