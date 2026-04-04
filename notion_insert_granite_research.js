const { chromium } = require('playwright');

function escapeRegex(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const hub = context.pages().find(p => p.url().includes('Jarvis-Hub-3362225c1eac80cfa382dda618acb112')) || context.pages().find(p => p.url().includes('notion.so/Jarvis-Hub')) || context.pages().find(p => p.url().includes('notion.so'));
  if (!hub) throw new Error('No Notion page found');
  await hub.bringToFront();
  await hub.waitForTimeout(1500);

  const graniteLink = hub.locator('text=Granite Transformations').first();
  await graniteLink.click({ timeout: 10000 });
  await hub.waitForTimeout(2500);

  let page = hub;
  for (const p of context.pages()) {
    try {
      const t = await p.title();
      const u = p.url();
      if (/Granite Transformations/i.test(t) || /Granite-Transformations/i.test(u)) {
        page = p;
      }
    } catch {}
  }

  await page.bringToFront();
  await page.waitForTimeout(2000);

  const bodyText = await page.locator('body').innerText().catch(()=> '');
  if (/Transformation Research Snapshot/i.test(bodyText)) {
    console.log('ALREADY_PRESENT');
    await browser.close();
    return;
  }

  const title = 'Granite Transformations — Transformation Research Snapshot';
  const content = [
    title,
    '',
    'Objective',
    'Build a practical understanding of Granite Transformations as an operating target: business model, market position, service footprint, customer journey, brand posture, and likely leverage points for sales/ops support.',
    '',
    'What Granite Transformations appears to be',
    '- A home-services/remodeling brand focused on bath, shower, and kitchen surface or fixture transformations.',
    '- Positioned around speed, convenience, and aesthetic upgrades rather than full custom luxury remodel complexity.',
    '- Likely sells trust, reduced disruption, financing, and cleaner project execution more than commodity materials alone.',
    '',
    'Probable offer structure',
    '- Bathroom remodels / shower conversions',
    '- Kitchen or surface refresh / countertops / related upgrades',
    '- Consultative in-home estimate followed by design-choice narrowing and financing discussion',
    '- Offer likely optimized for mid-ticket homeowner decisions where speed and confidence matter more than lowest price',
    '',
    'Customer psychology',
    '- Homeowner wants visible improvement without a nightmare project',
    '- Fear points: mess, delays, untrustworthy contractors, hidden costs, bad communication',
    '- Buying triggers: aging bathroom, ugly/outdated finishes, accessibility needs, preparing home for sale, finally acting after long delay',
    '- Winning message is probably not “materials” first — it is certainty, simplicity, speed, and outcome',
    '',
    'Sales implications',
    '- Lead handling speed matters a lot',
    '- Estimate experience likely determines close rate more than pure top-of-funnel volume',
    '- Visual proof, financing framing, and confidence in installer quality are likely central',
    '- Follow-up discipline probably creates material revenue lift if current process is inconsistent',
    '',
    'Operational leverage points Jarvis should care about',
    '- Lead intake and qualification quality',
    '- Estimate prep and estimate consistency',
    '- CRM hygiene and stage visibility',
    '- Follow-up automation after estimate',
    '- Marketing-to-appointment attribution',
    '- Sales script and objection pattern capture',
    '',
    'Useful research questions to deepen next',
    '- Exact service lines and margins by category',
    '- Franchise vs local branch structure',
    '- Lead sources that actually convert',
    '- Typical job size, sales cycle length, and financing attach rate',
    '- Core objections and where deals die',
    '- Review themes customers mention most often',
    '',
    'Why this matters inside Jarvis',
    'If Jarvis is going to support Granite meaningfully, the system should be built around real bottlenecks: response speed, estimate quality, pipeline clarity, and repeatable follow-up — not vague “AI assistance.”',
    '',
    'Status',
    'This is a first-pass strategic framing note placed into Notion so Granite research has a dedicated home inside the Jarvis operating hub. It should later be replaced or expanded with harder company-specific facts, competitor comparisons, review analysis, and CRM-grounded insights.'
  ].join('\n');

  const titleBox = page.locator('h1[role="textbox"]').first();
  await titleBox.click({ timeout: 10000 });
  await page.keyboard.press('End').catch(()=>{});
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  await page.keyboard.type(content, { delay: 3 });
  await page.waitForTimeout(2000);

  console.log('INSERTED_INTO', page.url());
  console.log((await page.locator('body').innerText().catch(()=> '')).slice(0,4000));
  await browser.close();
})();
