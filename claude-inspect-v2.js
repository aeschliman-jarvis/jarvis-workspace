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
    await page.waitForTimeout(1500);
    
    // Get the modal/overlay HTML specifically
    const modalHTML = await page.locator('[role="dialog"], .modal, [class*="modal"], [class*="dialog"], form, .fixed backdrop-blur').first().innerHTML().catch(async () => {
      // Fallback: get the entire body but focus on the visible overlay
      return await page.locator('body').innerHTML();
    });
    
    console.log('\n📄 MODAL HTML:');
    console.log(modalHTML);
    
    // Get label/Input pairs
    console.log('\n🔍 FORM FIELD DETAILS:');
    const labels = await page.locator('label').all();
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      const text = (await label.textContent() || '').trim();
      const forAttr = await label.getAttribute('for') || '';
      
      let associatedInput = null;
      if (forAttr) {
        associatedInput = await page.locator(`#${forAttr}`).first();
      } else {
        associatedInput = await label.locator('input, textarea, select').first();
      }
      
      if (associatedInput && await associatedInput.count() > 0) {
        const type = await associatedInput.getAttribute('type') || 'text';
        const placeholder = await associatedInput.getAttribute('placeholder') || '';
        const name = await associatedInput.getAttribute('name') || '';
        const id = await associatedInput.getAttribute('id') || '';
        const value = await associatedInput.inputValue().catch(() => '');
        
        console.log(`  Label: "${text}"`);
        console.log(`    → <input type="${type}" name="${name}" id="${id}" placeholder="${placeholder}" value="${value}">`);
        console.log('');
      }
    }
    
    await page.waitForTimeout(5000);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Done.');
  }
})();
