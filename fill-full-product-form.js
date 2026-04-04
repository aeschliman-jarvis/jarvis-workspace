const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--remote-debugging-port=9223']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🧭 Navigating to localhost:4000/autopilot/new...');
    await page.goto('http://localhost:4000/autopilot/new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Step 1: Fill Product Details
    console.log('📋 Step 1: Filling Product Details...');
    const inputs = await page.locator('input, textarea, select').all();
    await inputs[0].fill('Autensa Form Filler');
    await inputs[1].fill('Automatically fills and submits forms on the Autensa Mission Control dashboard using Playwright automation.');
    await inputs[2].fill('https://github.com/aeschliman-jarvis/jarvis-workspace');
    await inputs[3].fill('https://localhost:4000');
    await inputs[4].selectOption({ index: 0 });
    await inputs[5].fill('main');
    console.log('✅ All 6 fields filled.');

    // Step 2: Click "Next: Product Program"
    console.log('\n▶️  Clicking "Next: Product Program"...');
    await page.getByRole('button', { name: 'Next: Product Program' }).click();
    await page.waitForTimeout(3000);

    console.log('📍 Current URL:', page.url());
    await page.screenshot({ path: 'product-program-step.png', fullPage: true });
    console.log('📸 Step 2 screenshot saved.');

    // Step 3: Inspect the Product Program form
    console.log('\n🔍 Inspecting Product Program form...');
    const pageText = await page.locator('body').textContent();
    console.log('Page text:', pageText.slice(0, 1500));

    const step2Inputs = await page.locator('input, textarea, select').all();
    console.log(`\nFound ${step2Inputs.length} form fields on Step 2.`);
    for (let i = 0; i < step2Inputs.length; i++) {
      const input = step2Inputs[i];
      try {
        const placeholder = await input.getAttribute('placeholder') || '';
        const tagName = await input.evaluate(el => el.tagName.toLowerCase());
        console.log(`  [${i}] <${tagName}> placeholder="${placeholder}"`);
      } catch (e) {}
    }

    const step2Buttons = await page.locator('button').all();
    console.log('\nButtons on Step 2:');
    for (let i = 0; i < step2Buttons.length; i++) {
      const btn = step2Buttons[i];
      try {
        const text = (await btn.textContent() || '').trim();
        console.log(`  [${i}] "${text}"`);
      } catch (e) {}
    }

    await page.waitForTimeout(5000);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await page.screenshot({ path: 'product-program-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 Done.');
  }
})();
