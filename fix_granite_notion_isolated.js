const { chromium } = require('playwright');

(async() => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:18800');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://www.notion.so/Jarvis-Hub-3362225c1eac80cfa382dda618acb112', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // If auth wall or generic landing page appears, dump quick state and exit.
  const initial = await page.locator('body').innerText().catch(()=> '');
  if (/log in|sign up|continue with google|welcome to notion/i.test(initial) && !/Jarvis Hub/i.test(initial)) {
    console.log('AUTH_REQUIRED');
    console.log(initial.slice(0,1500));
    await browser.close();
    return;
  }

  // Open Granite Transformations page via search / quick switcher if present on hub.
  if (/Jarvis Hub/i.test(initial) && /Granite Transformations/i.test(initial)) {
    await page.locator('text=Granite Transformations').first().click({ timeout: 10000 }).catch(()=>{});
    await page.waitForTimeout(3000);
  }

  let body = await page.locator('body').innerText().catch(()=> '');
  if (!/Granite Transformations/i.test(body)) {
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+P' : 'Control+P').catch(()=>{});
    await page.waitForTimeout(800);
    await page.keyboard.type('Granite Transformations', { delay: 20 }).catch(()=>{});
    await page.waitForTimeout(1200);
    await page.keyboard.press('Enter').catch(()=>{});
    await page.waitForTimeout(3000);
    body = await page.locator('body').innerText().catch(()=> '');
  }

  if (!/Granite Transformations/i.test(body)) {
    console.log('FAILED_TO_OPEN_TARGET');
    console.log(body.slice(0,2000));
    await browser.close();
    return;
  }

  // Locate all editable blocks for cleanup/debug.
  const blocks = await page.evaluate(() => Array.from(document.querySelectorAll('[contenteditable="true"], div[role="textbox"], h1[role="textbox"]')).map((el, i) => ({
    i,
    tag: el.tagName,
    role: el.getAttribute('role'),
    text: (el.innerText || '').trim().slice(0,200),
    ph: el.getAttribute('placeholder') || ''
  })));
  console.log('BLOCKS', JSON.stringify(blocks.slice(0,80), null, 2));

  const cleanContent = [
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

  // Heuristic cleanup: remove/replace the malformed snapshot region if found as editable text blocks.
  const editable = page.locator('div[role="textbox"], h1[role="textbox"]');
  const count = await editable.count();
  let found = false;
  for (let i = 0; i < count; i++) {
    const loc = editable.nth(i);
    const txt = (await loc.innerText().catch(()=> '')).trim();
    if (/Transformation Research Snapshot|ObjectiveBuild a pract|hat Granite Transformations appears to be|Lead intake and qualification quality/i.test(txt)) {
      found = true;
      await loc.click({ timeout: 5000 }).catch(()=>{});
      await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A').catch(()=>{});
      await page.keyboard.type(cleanContent[0], { delay: 1 }).catch(()=>{});
      for (let j = 1; j < cleanContent.length; j++) {
        await page.keyboard.press('Enter').catch(()=>{});
        await page.waitForTimeout(40);
        await page.keyboard.type(cleanContent[j], { delay: 1 }).catch(()=>{});
      }
      break;
    }
  }

  if (!found) {
    // fallback: append clean version at end so page has a usable section
    await page.keyboard.press('Escape').catch(()=>{});
    await page.waitForTimeout(300);
    await page.keyboard.press('End').catch(()=>{});
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter').catch(()=>{});
    await page.waitForTimeout(500);
    for (const line of cleanContent) {
      await page.keyboard.type(line, { delay: 1 }).catch(()=>{});
      await page.keyboard.press('Enter').catch(()=>{});
      await page.waitForTimeout(40);
    }
  }

  await page.waitForTimeout(2500);
  console.log('FINAL_URL', page.url());
  console.log((await page.locator('body').innerText().catch(()=> '')).slice(0,5000));
  await browser.close();
})();
