const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--remote-debugging-port=9223']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🧭 Navigating to localhost:4000...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('🚪 Entering "Default Workspace"...');
    await page.getByRole('link', { name: /Default Workspace/ }).click();
    await page.waitForTimeout(2000);

    console.log('🚀 Clicking the Rocketship (Autopilot)...');
    await page.getByRole('link', { name: 'Autopilot' }).click();
    await page.waitForTimeout(2000);

    console.log('📦 Clicking "Create First Product"...');
    await page.getByRole('button', { name: /Create First Product|Create Product|New Product/ }).click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'create-product-modal.png', fullPage: true });
    console.log('📸 Modal screenshot saved to create-product-modal.png');

    // Dump form content
    console.log('\n🔍 Inspecting the product creation form...');
    const modalHTML = await page.locator('[role="dialog"], form, [class*="modal"], [class*="dialog"]').first().innerHTML().catch(() => {
      return page.locator('body').innerHTML();
    });
    console.log(modalHTML.slice(0, 4000));

    // List all fields
    const inputs = await page.locator('input, textarea, select').all();
    console.log(`\nFound ${inputs.length} form fields:`);
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type') || 'text';
      const placeholder = await input.getAttribute('placeholder') || '';
      const name = await input.getAttribute('name') || '';
      const id = await input.getAttribute('id') || '';
      console.log(`  [${i}] <${type}> placeholder="${placeholder}" name="${name}" id="${id}"`);
    }

    await page.waitForTimeout(5000);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await page.screenshot({ path: 'create-product-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 Done.');
  }
})();
