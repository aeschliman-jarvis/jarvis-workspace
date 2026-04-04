const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--remote-debugging-port=9223']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🧭 Step 1: Product Details...');
    await page.goto('http://localhost:4000/autopilot/new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const inputs = await page.locator('input, textarea, select').all();
    await inputs[0].fill('Autensa Form Filler');
    await inputs[1].fill('Automatically fills and submits forms on the Autensa Mission Control dashboard.');
    await inputs[2].fill('https://github.com/aeschliman-jarvis/jarvis-workspace');
    await inputs[3].fill('https://localhost:4000');
    await inputs[4].selectOption({ index: 0 });
    await inputs[5].fill('main');
    
    console.log('▶️  Moving to Step 2...');
    await page.getByRole('button', { name: 'Next: Product Program' }).click();
    await page.waitForTimeout(2000);

    // Step 2: Product Program
    console.log('📝 Step 2: Filling Product Program...');
    const programTextarea = page.locator('textarea').first();
    await programTextarea.fill(`# Product Program: Autensa Form Filler

## Purpose
Automates the filling of complex, dynamic forms within the Mission Control dashboard using Playwright.

## Target Users
Jacob (System Operator) needs to test and verify form submissions without manual input.

## Priorities
1. Reliability: Must handle dynamic selectors and modal states.
2. Speed: Fast execution using Playwright's CDP integration.
3. Visibility: Provide screenshots and logs for every action.

## Research Directives
Focus on accessibility tree mapping and shadow DOM traversal.

## Exclusions
Do not use vision-based models; rely on DOM structure and accessibility labels.`);

    console.log('▶️  Moving to Step 3...');
    await page.getByRole('button', { name: 'Next: Schedules' }).click();
    await page.waitForTimeout(3000);

    // Step 3: Schedules
    console.log('📅 Step 3: Inspecting Schedules...');
    await page.screenshot({ path: 'schedules-step.png', fullPage: true });
    
    const scheduleBtns = await page.locator('button').all();
    let submitFound = false;
    for (const btn of scheduleBtns) {
      const text = (await btn.textContent() || '').trim();
      if (text.match(/Create|Launch|Start|Finish/i)) {
        console.log(`🚀 Found final button: "${text}"`);
        await btn.click();
        submitFound = true;
        break;
      }
    }

    if (!submitFound) {
      console.log('⚠️  No final submit found. Taking final screenshot.');
    }

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'final-product-state.png', fullPage: true });
    console.log('📍 Final URL:', page.url());
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Sequence complete.');
  }
})();
