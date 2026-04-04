const { chromium } = require('playwright');

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('notion.so'));
  if (!page) throw new Error('No live Notion page found');
  await page.bringToFront();
  await page.waitForTimeout(1200);

  const body = await page.locator('body').innerText().catch(()=> '');
  if (!/Granite Transformations/i.test(body)) throw new Error('Granite Transformations page not active');

  const lines = [
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

  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(500);

  const title = page.locator('h1[role="textbox"]').filter({ hasText: 'Granite Transformations' }).first();
  await title.click({ timeout: 5000 });
  await page.waitForTimeout(200);
  await page.keyboard.press('ArrowRight').catch(()=>{});
  await page.keyboard.press('Enter').catch(()=>{});
  await page.waitForTimeout(400);

  await page.keyboard.type('/page', { delay: 10 }).catch(()=>{});
  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter').catch(()=>{});
  await page.waitForTimeout(1200);

  // Name new subpage
  await page.keyboard.type('Transformation Research Snapshot', { delay: 8 }).catch(()=>{});
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter').catch(()=>{});
  await page.waitForTimeout(1800);

  for (const line of lines.slice(2)) {
    if (!line) {
      await page.keyboard.press('Enter').catch(()=>{});
      await page.waitForTimeout(60);
      continue;
    }
    const isHeading = [
      'Objective',
      'What Granite Transformations appears to be',
      'Probable offer structure',
      'Customer psychology',
      'Sales implications',
      'Operational leverage points Jarvis should care about',
      'Next research questions',
      'Why this matters inside Jarvis'
    ].includes(line);

    if (isHeading) {
      await page.keyboard.type('/heading 2', { delay: 5 }).catch(()=>{});
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter').catch(()=>{});
      await page.waitForTimeout(300);
      await page.keyboard.type(line, { delay: 3 }).catch(()=>{});
      await page.keyboard.press('Enter').catch(()=>{});
      await page.waitForTimeout(80);
    } else {
      await page.keyboard.type(line, { delay: 2 }).catch(()=>{});
      await page.keyboard.press('Enter').catch(()=>{});
      await page.waitForTimeout(80);
    }
  }

  await page.waitForTimeout(2000);
  console.log('URL', page.url());
  console.log((await page.locator('body').innerText().catch(()=> '')).slice(0,5000));
  await browser.close();
})();
