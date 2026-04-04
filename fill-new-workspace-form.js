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
    
    // Click "New Workspace"
    console.log('🖱️  Clicking "New Workspace"...');
    await page.getByRole('button', { name: 'New Workspace' }).click();
    await page.waitForTimeout(2000);
    
    // Screenshot the modal
    await page.screenshot({ path: 'autensa-new-workspace-modal.png', fullPage: true });
    console.log('📸 Modal screenshot saved to autensa-new-workspace-modal.png');
    
    // Find all form elements in the modal
    console.log('\n🔍 Finding form fields in modal...');
    const inputs = await page.locator('input, textarea, select').all();
    console.log(`Found ${inputs.length} form fields:\n`);
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type') || 'text';
      const placeholder = await input.getAttribute('placeholder') || '';
      const name = await input.getAttribute('name') || '';
      const id = await input.getAttribute('id') || '';
      const label = await input.locator('xpath=preceding::label[1]').textContent().catch(() => '');
      
      console.log(`  [${i}] type="${type}", placeholder="${placeholder}", name="${name}", id="${id}"`);
      if (label) console.log(`      label: "${label.trim()}"`);
    }
    
    // Fill the fields
    console.log('\n⌨️  Filling form fields...');
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const placeholder = (await input.getAttribute('placeholder') || '').toLowerCase();
      const name = (await input.getAttribute('name') || '').toLowerCase();
      const id = (await input.getAttribute('id') || '').toLowerCase();
      const type = await input.getAttribute('type') || 'text';
      
      if (placeholder.includes('name') || name.includes('name') || id.includes('name') || type === 'text') {
        await input.fill('Jacob Test Workspace');
        console.log(`  [${i}] ✅ Filled with "Jacob Test Workspace"`);
      } else if (placeholder.includes('email') || name.includes('email') || id.includes('email')) {
        await input.fill('jacob@test.com');
        console.log(`  [${i}] ✅ Filled with "jacob@test.com"`);
      } else if (placeholder.includes('desc') || name.includes('desc') || id.includes('desc') || placeholder.includes('message')) {
        await input.fill('Testing Autensa Form Fill via Playwright');
        console.log(`  [${i}] ✅ Filled with description`);
      }
    }
    
    // Find and click submit/create
    console.log('\n🔘 Looking for submit/create button...');
    const submitBtn = await page.locator('button:has-text("Create"), button:has-text("Submit"), button:has-text("Save"), button[type="submit"]').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.scrollIntoViewIfNeeded();
      await submitBtn.click();
      console.log('✅ Submit button clicked!');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'autensa-after-submit.png', fullPage: true });
      console.log('📸 Post-submit screenshot saved to autensa-after-submit.png');
    } else {
      console.log('⚠️  No submit button found.');
    }
    
    await page.waitForTimeout(3000);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await page.screenshot({ path: 'autensa-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 Done.');
  }
})();
