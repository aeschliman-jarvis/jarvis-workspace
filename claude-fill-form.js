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
    
    console.log('🖱️  Clicking "New Workspace"...');
    await page.getByRole('button', { name: 'New Workspace' }).click();
    await page.waitForTimeout(1000);
    
    // Step 1: Pick an icon (optional, default is 📁)
    console.log('🎨 Selecting icon...');
    await page.locator('button[type="button"]').filter({ hasText: '💼' }).first().click();
    await page.waitForTimeout(500);
    
    // Step 2: Fill the name field
    console.log('⌨️  Filling name field...');
    const nameInput = page.locator('input[type="text"][placeholder*="Acme"]');
    await nameInput.fill('Jacob Test Workspace');
    console.log('✅ Name filled.');
    
    // Step 3: Wait for the Create button to become enabled
    console.log('⏳ Waiting for Create button to enable...');
    await page.waitForFunction(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn && !btn.disabled;
    }, { timeout: 5000 });
    console.log('✅ Create button is now enabled.');
    
    // Step 4: Click Create
    console.log('🖱️  Clicking "Create Workspace"...');
    await page.getByRole('button', { name: 'Create Workspace' }).click();
    
    // Wait for navigation or modal close
    await page.waitForTimeout(3000);
    
    // Verify success
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    await page.screenshot({ path: 'claude-form-success.png', fullPage: true });
    console.log('📸 Success screenshot saved to claude-form-success.png');
    
    // Check if we're in the new workspace
    const pageText = await page.locator('body').textContent();
    if (pageText.includes('Jacob Test Workspace')) {
      console.log('✅ Workspace "Jacob Test Workspace" created successfully!');
    } else {
      console.log('⚠️  Could not confirm workspace creation. Check the screenshot.');
    }
    
    await page.waitForTimeout(3000);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await page.screenshot({ path: 'claude-form-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 Done.');
  }
})();
