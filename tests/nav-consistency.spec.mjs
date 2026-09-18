import { chromium } from 'playwright';

const BASE = '/agi-society-cn';
const PAGES = ['/', '/conference/', '/about/', '/research/', '/wiki/', '/projects/', '/contact/'];
const TIMEOUT = 60000;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  let allPassed = true;
  const results = [];

  for (const path of PAGES) {
    try {
      await page.goto(`http://localhost:5173${BASE}${path}`, { waitUntil: 'networkidle', timeout: TIMEOUT });

      const nav = await page.locator('.VPNav').evaluate(el => getComputedStyle(el).backgroundColor);
      const navBar = await page.locator('.VPNavBar').evaluate(el => getComputedStyle(el).backgroundColor);
      const cbCount = await page.locator('.content-body').count();
      const contentBody = cbCount > 0
        ? await page.locator('.content-body').evaluate(el => getComputedStyle(el).backgroundColor)
        : 'N/A';

      const navOk = nav === 'rgb(255, 255, 255)';
      const barOk = navBar === 'rgb(255, 255, 255)';
      const cbOk = contentBody === 'N/A' || contentBody === 'rgb(255, 255, 255)';

      results.push({ path, nav, navBar, contentBody, navOk, barOk, cbOk });
      console.log(`${path}: VPNav=${nav} ${navOk ? '✅' : '❌'} | VPNavBar=${navBar} ${barOk ? '✅' : '❌'} | content-body=${contentBody} ${cbOk ? '✅' : '❌'}`);

      if (!navOk || !barOk || !cbOk) allPassed = false;
    } catch (err) {
      results.push({ path, error: err.message });
      console.log(`${path}: ❌ ERROR — ${err.message}`);
      allPassed = false;
    }
  }

  console.log(allPassed ? `\n✅ PASS: 全站 ${PAGES.length} 页面顶栏纯白一致` : '\n❌ FAIL: 存在不一致页面');
  await browser.close();
  process.exit(allPassed ? 0 : 1);
})();
