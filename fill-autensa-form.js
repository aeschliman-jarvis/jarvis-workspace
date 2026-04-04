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
    
    // Take a snapshot to see what's on the page
    console.log('📸 Page loaded. Getting page content...');
    const title = await page.title();
    const url = page.url();
    console.log(`Title: ${title}, URL: ${url}`);
    
    const bodyText = await page.locator('body').textContent();
    console.log('Page text preview:', bodyText.slice(0, 500));
    
    // Try to find and fill form fields
    console.log('\n🔍 Looking for form fields...');
    
    // Generic approach: find all text inputs
    const inputs = await page.locator('input[type="text"], input[type="email"], input:not([type]), textarea').all();
    console.log(`Found ${inputs.length} input fields.`);
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const placeholder = await input.getAttribute('placeholder') || 'unknown';
      const name = await input.getAttribute('name') || 'unknown';
      const id = await input.getAttribute('id') || 'unknown';
      
      console.log(`  Input ${i}: placeholder="${placeholder}", name="${name}", id="${id}"`);
      
      // Fill based on field hints
      if (placeholder.toLowerCase().includes('name') || name.toLowerCase().includes('name') || id.toLowerCase().includes('name')) {
        await input.fill('Jacob');
        console.log('    ✅ Filled with "Jacob"');
      } else if (placeholder.toLowerCase().includes('email') || name.toLowerCase().includes('email') || id.toLowerCase().includes('email')) {
        await input.fill('jacob@test.com');
        console.log('    ✅ Filled with "jacob@test.com"');
      } else if (placeholder.toLowerCase().includes('message') || name.toLowerCase().includes('message') || id.toLowerCase().includes('message') || placeholder.toLowerCase().includes('comment')) {
        await input.fill('Testing Autensa Form Fill');
        console.log('    ✅ Filled with "Testing Autensa Form Fill"');
      }
    }
    
    // Find and click submit
    console.log('\n🔘 Looking for submit button...');
    const submitBtn = await page.locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Send")').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.scrollIntoViewIfNeeded();
      await submitBtn.click();
      console.log('✅ Submit button clicked!');
    } else {
      console.log('⚠️  No submit button found.');
    }
    
    // Wait a moment to see the result
    await page.waitForTimeout(3000);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Done.');
  }
})();
