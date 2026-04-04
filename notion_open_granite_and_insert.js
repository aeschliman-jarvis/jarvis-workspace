const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('notion.so/Jarvis-Hub')) || context.pages().find(p => p.url().includes('3362225c1eac80cfa382dda618acb112')) || context.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1200);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(500);

  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+P' : 'Control+P').catch(()=>{});
  await page.waitForTimeout(1000);
  await page.keyboard.type('Granite Transformations', { delay: 20 });
  await page.waitForTimeout(1200);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);

  let target = context.pages()[context.pages().length - 1] || page;
  for (const p of context.pages()) {
    try {
      const t = await p.title().catch(()=> '');
      const b = await p.locator('body').innerText().catch(()=> '');
      if (/Granite Transformations/i.test(t) || /^Granite Transformations/m.test(b)) target = p;
    } catch {}
  }

  await target.bringToFront();
  await target.waitForTimeout(1500);

  const existing = await target.locator('body').innerText().catch(()=> '');
  if (/Transformation Research Snapshot/i.test(existing)) {
    console.log('ALREADY_PRESENT');
    await browser.close();
    return;
  }

  const content = [
    'Transformation Research Snapshot',
    '',
    'Objective',
    'Build a practical understanding of Granite Transformations as an operating target: business model, market position, service footprint, customer journey, brand posture, and likely leverage points for sales and ops support.',
    '',
    'What Granite Transformations appears to be',
    '- A home-services/remodeling brand focused on bath, shower, and kitchen transformation work.',
    '- Positioned around speed, convenience, reduced disruption, and visible improvement.',
    '- Likely sells trust, simplicity, financing, and project confidence more than raw materials alone.',
    '',
    'Probable offer structure',
    '- Bathroom remodels and shower conversions',
    '- Kitchen or surface-refresh related upgrades',
    '- In-home consultative estimate with narrowed design choices and financing discussion',
    '- Mid-ticket homeowner offer where certainty and convenience matter heavily',
    '',
    'Customer psychology',
    '- Wants a visible upgrade without a nightmare remodel process',
    '- Fear points: mess, delays, bad communication, hidden costs, sketchy contractors',
    '- Buying triggers: outdated bathroom, accessibility needs, preparing to sell, delayed project finally becoming urgent',
    '- Winning message is likely certainty, simplicity, speed, and outcome — not materials-first',
    '',
    'Sales implications',
    '- Lead response speed matters',
    '- Estimate experience likely has outsized impact on close rate',
    '- Visual proof, installer trust, and financing framing likely drive conversion',
    '- Follow-up discipline likely creates meaningful revenue lift',
    '',
    'Operational leverage points Jarvis should care about',
    '- Lead intake and qualification quality',
    '- Estimate prep and estimate consistency',
    '- CRM hygiene and stage visibility',
    '- Post-estimate follow-up automation',
    '- Marketing-to-appointment attribution',
    '- Objection capture and script refinement',
    '',
    'Next research questions',
    '- Exact service lines and margins by category',
    '- Franchise vs local branch structure',
    '- Best lead sources by conversion quality',
    '- Typical job size, sales cycle, and financing attach rate',
    '- Core objections and where deals die',
    '- Customer review themes',
    '',
    'Why this matters inside Jarvis',
    'If Jarvis is going to support Granite meaningfully, the system should anchor on real bottlenecks: response speed, estimate quality, pipeline clarity, and repeatable follow-up — not vague AI assistance.',
  ].join('\n');

  const titleBox = target.locator('h1[role="textbox"]').first();
  await titleBox.click({ timeout: 10000 });
  await target.keyboard.press('End').catch(()=>{});
  await target.waitForTimeout(400);
  await target.keyboard.press('Enter');
  await target.waitForTimeout(700);
  await target.keyboard.type(content, { delay: 3 });
  await target.waitForTimeout(2000);

  console.log('DONE');
  console.log('URL', target.url());
  console.log((await target.locator('body').innerText().catch(()=> '')).slice(0,3500));
  await browser.close();
})();
