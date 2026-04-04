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
    await page.goto('http://localhost:4000/autopilot/new', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);

    console.log('⌨️  Filling form fields...');
    const inputs = await page.locator('input, textarea, select').all();
    
    const formData = [
      { value: 'Autensa Form Filler Test', match: ['My Product', 'name', 'product'] },
      { value: 'Automatically fills forms on the Autensa Mission Control dashboard using Playwright.', match: ['What does this', 'description', 'do'] },
      { value: 'https://github.com/aeschliman-jarvis/jarvis-workspace', match: ['github', 'repo', 'repository'] },
      { value: 'https://localhost:4000', match: ['https://', 'url', 'website'] },
      { value: 'Node.js, Playwright, Next.js', match: ['stack', 'tech', 'framework', 'language'] },
      { value: 'main', match: ['main', 'branch', 'default'] }
    ];

    for (let i = 0; i < Math.min(inputs.length, formData.length); i++) {
      const input = inputs[i];
      const tagName = await input.evaluate(el => el.tagName.toLowerCase());
      const placeholder = (await input.getAttribute('placeholder') || '').toLowerCase();
      const name = (await input.getAttribute('name') || '').toLowerCase();
      const id = (await input.getAttribute('id') || '').toLowerCase();
      
      // Find matching data
      let filled = false;
      for (const field of formData) {
        if (field.match.some(m => placeholder.includes(m) || name.includes(m) || id.includes(m))) {
          if (tagName === 'select') {
            // For select elements, try to pick the closest option
            const options = await input.locator('option').all();
            for (const opt of options) {
              const optText = (await opt.textContent() || '').toLowerCase();
              if (optText.includes(field.value.toLowerCase().slice(0, 5))) {
                await input.selectOption({ label: await opt.textContent() });
                console.log(`  [${i}] ✅ Selected option: "${await opt.textContent()}"`);
                filled = true;
                break;
              }
            }
            if (!filled) {
              // Fallback: select first option
              await input.selectOption({ index: 0 });
              console.log(`  [${i}] ✅ Selected first option (fallback)`);
            }
          } else {
            await input.fill(field.value);
            console.log(`  [${i}] ✅ Filled with: "${field.value}"`);
          }
          filled = true;
          break;
        }
      }
      
      // Fallback: fill in order if no match
      if (!filled && formData[i]) {
        if (tagName === 'select') {
          await input.selectOption({ index: 0 });
          console.log(`  [${i}] ✅ Selected first option (fallback)`);
        } else {
          await input.fill(formData[i].value);
          console.log(`  [${i}] ✅ Filled (fallback) with: "${formData[i].value}"`);
        }
      }
    }

    // Find and click the submit/create button
    console.log('\n🔘 Looking for Submit button...');
    const submitBtn = await page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Submit"), button:has-text("Save")').first();
    
    if (await submitBtn.count() > 0) {
      await submitBtn.scrollIntoViewIfNeeded();
      await submitBtn.click();
      console.log('✅ Submit button clicked!');
      
      // Wait for result
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'product-created-success.png', fullPage: true });
      console.log('📸 Post-submit screenshot saved.');
      
      console.log('📍 Final URL:', page.url());
    } else {
      console.log('⚠️  No submit button found.');
    }

    await page.waitForTimeout(3000);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await page.screenshot({ path: 'product-form-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🏁 Done.');
  }
})();
