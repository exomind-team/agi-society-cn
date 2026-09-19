import { chromium } from 'playwright';
import path from 'node:path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`CONSOLE ERROR: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });
  page.on('requestfailed', req => {
    errors.push(`REQUEST FAILED: ${req.url()} — ${req.failure()?.errorText}`);
  });

  console.log('Navigating to http://localhost:5173/ ...');
  const resp = await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 });

  console.log(`Response status: ${resp?.status()}`);

  const title = await page.title();
  console.log(`Page title: "${title}"`);

  const h1Count = await page.locator('h1').count();
  const navCount = await page.locator('nav').count();
  console.log(`h1 count: ${h1Count}, nav count: ${navCount}`);

  const ssPath = process.env.TEST_SCREENSHOT_PATH
    ?? path.join(process.env.TEMP ?? process.cwd(), 'nolebase-wiki-test.png');
  await page.screenshot({ path: ssPath, fullPage: false });
  console.log(`Screenshot saved: ${ssPath}`);

  if (errors.length > 0) {
    console.log(`\n=== ERRORS (${errors.length}) ===`);
    errors.forEach(e => console.log(`  - ${e}`));
  } else {
    console.log('\n=== NO ERRORS ===');
  }

  await browser.close();
})();
