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

    // Step 1: Enter the Default Workspace
    console.log('🚪 Entering "Default Workspace"...');
    await page.getByRole('link', { name: /Default Workspace/ }).click();
    await page.waitForTimeout(2000); // Wait for workspace to load

    // Step 2: Inspect the page for the "Rocketship"
    console.log('🚀 Looking for the Rocketship icon in the top right...');
    await page.screenshot({ path: 'workspace-inspect.png', fullPage: true });
    
    const allButtons = await page.locator('button, [role="button"], a').all();
    console.log(`Found ${allButtons.length} interactive elements.`);
    
    let rocketshipFound = false;
    for (let i = 0; i < allButtons.length; i++) {
      const btn = allButtons[i];
      const text = (await btn.textContent() || '').trim();
      const aria = await btn.getAttribute('aria-label') || '';
      const title = await btn.getAttribute('title') || '';
      
      if (text.includes('🚀') || aria.includes('rocket') || aria.includes('new') || title.includes('rocket')) {
        console.log(`✅ Found Rocketship at index [${i}]: "${text}" (aria: "${aria}")`);
        await btn.click();
        rocketshipFound = true;
        break;
      }
    }

    if (!rocketshipFound) {
      console.log('⚠️  Rocketship not found by text/aria. Taking another look...');
      // Fallback: Click the last button in the header or a specific "New Mission" button
      await page.getByRole('button', { name: /New Mission|New Project|Start/i }).first().click().catch(() => {});
    }

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'after-rocketship.png', fullPage: true });
    console.log('📸 Screenshots saved. Check "workspace-inspect.png" and "after-rocketship.png".');

    // Step 3: Inspect the new modal/form
    console.log('\n🔍 Inspecting the new project/mission form...');
    const formHTML = await page.locator('form, [role="dialog"], [class*="modal"]').first().innerHTML().catch(() => 'No modal found');
    console.log(formHTML.slice(0, 3000));

    await page.waitForTimeout(5000);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await page.screenshot({ path: 'rocketship-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 Inspection complete.');
  }
})();
