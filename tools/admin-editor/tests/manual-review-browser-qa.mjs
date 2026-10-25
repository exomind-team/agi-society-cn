// Browser QA for the explicitly local, unauthenticated review-workflow simulation.
// Use only a fresh demo data root. This never touches production WordPress or GitHub.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.QA_BASE_URL || 'http://127.0.0.1:8788';
const OUT = process.env.QA_OUT || path.resolve('reports/review-demo-qa-20261023');
const SHOTS = path.join(OUT, 'screenshots');
const results = [];
let browser;
let page;

function record(name, pass, detail = '') {
  const result = { name, status: pass ? 'PASS' : 'FAIL', detail };
  results.push(result);
  process.stdout.write(`${result.status.padEnd(5)} ${name}${detail ? ` — ${detail}` : ''}\n`);
  if (!pass) throw new Error(`${name}: ${detail || 'assertion failed'}`);
}

async function screenshot(label) {
  await fs.mkdir(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, `${label}.png`), fullPage: true });
}

async function readPage(id) {
  return page.evaluate(async pageId => {
    const response = await fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read', id: pageId })
    });
    return { status: response.status, body: await response.json() };
  }, id);
}

async function waitForReviewStatus(text) {
  await page.waitForFunction(
    expected => document.querySelector('#review-status')?.textContent?.includes(expected),
    text,
    { timeout: 10000 }
  );
}

async function run() {
  await fs.mkdir(OUT, { recursive: true });
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const failedResponses = [];
  browser = await chromium.launch({ channel: 'chrome', headless: false });
  const browserVersion = `Chrome ${browser.version()}`;
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  page = await context.newPage();
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push({ text: message.text(), url: message.location().url });
  });
  page.on('pageerror', error => pageErrors.push(String(error)));
  page.on('requestfailed', request => failedRequests.push(request.url()));
  page.on('response', response => {
    if (response.status() >= 400) failedResponses.push({ status: response.status(), url: response.url() });
  });

  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#editor:not([disabled])', { timeout: 15000 });
    record('review-demo-mode', await page.locator('#review-simulation').isVisible(), await page.locator('#mode').textContent());
    record('simulation-warning-visible', await page.locator('#review-heading').textContent().then(t => t.includes('审核流程演示'))
      && await page.locator('#review-simulation').textContent().then(t => t.includes('不做身份认证')), 'the UI labels the persona switch as an unauthenticated simulation');
    record('role-selector-labelled', await page.getByLabel('当前模拟角色').isVisible());

    const listing = await page.evaluate(async () => (await fetch('/api/pages')).json());
    const id = listing.pages?.[0]?.id;
    record('demo-page-loaded', Boolean(id && await page.locator('#title').textContent()), String(id));
    record('review-capability-labelled', listing.capabilities?.reviewWorkflow === 'local-simulation');
    record('external-publish-disabled', listing.capabilities?.websitePublish === false && listing.capabilities?.remoteSync === false);
    const baseRevision = listing.revision;

    const editor = page.locator('#editor');
    const original = await editor.inputValue();
    const firstDraftText = `${original}\n本机审核流程验收：第一修订。`;
    await editor.fill(firstDraftText);
    await page.locator('#save').click();
    await page.getByText(/草稿已保存到本机内容服务/).waitFor({ timeout: 10000 });
    let loaded = await readPage(id);
    record('save-keeps-formal-revision', loaded.status === 200 && loaded.body.revision === baseRevision && loaded.body.draft?.content === firstDraftText);
    record('draft-starts-unsubmitted', loaded.body.draft?.reviewStatus === 'draft');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#editor:not([disabled])', { timeout: 15000 });
    record('draft-persists-after-reload', (await page.locator('#editor').inputValue()) === firstDraftText);
    record('review-demo-visible-after-reload', await page.locator('#review-simulation').isVisible());

    await page.locator('#review-submit').click();
    await waitForReviewStatus('待审核修订');
    loaded = await readPage(id);
    record('submit-freezes-exact-revision', loaded.body.draft?.reviewStatus === 'in-review'
      && loaded.body.draft?.reviewRevision === loaded.body.draft?.draftRevision);
    record('submit-does-not-advance-formal-content', loaded.body.revision === baseRevision);
    await screenshot('01-pending-review');

    await page.getByLabel('当前模拟角色').selectOption('reviewer');
    record('reviewer-persona-is-simulated', await page.locator('#review-approve').isVisible());
    await page.locator('#review-return').click();
    await page.waitForSelector('#dialog[open]');
    await page.locator('#review-return-reason').fill('请补充来源说明。');
    await page.locator('#dialog-confirm').click();
    await waitForReviewStatus('已退回修改');
    loaded = await readPage(id);
    record('return-persists-reason', loaded.body.draft?.reviewStatus === 'returned'
      && loaded.body.draft?.reviewReason === '请补充来源说明。');
    await screenshot('02-returned');

    await page.getByLabel('当前模拟角色').selectOption('editor');
    const revisedText = `${firstDraftText}\n本机审核流程验收：按意见补充来源。`;
    await editor.fill(revisedText);
    await page.locator('#save').click();
    await page.getByText(/草稿已保存到本机内容服务/).waitFor({ timeout: 10000 });
    loaded = await readPage(id);
    record('edit-invalidates-returned-review', loaded.body.draft?.reviewStatus === 'draft'
      && loaded.body.draft?.draftRevision !== loaded.body.draft?.reviewRevision);
    await page.locator('#review-submit').click();
    await waitForReviewStatus('待审核修订');
    loaded = await readPage(id);
    record('resubmit-uses-new-revision', loaded.body.draft?.reviewStatus === 'in-review'
      && loaded.body.draft?.reviewRevision === loaded.body.draft?.draftRevision);

    await page.getByLabel('当前模拟角色').selectOption('reviewer');
    await page.locator('#review-approve').click();
    await page.waitForSelector('#dialog[open]');
    record('approve-dialog-discloses-simulation', (await page.locator('#dialog-body').textContent()).includes('没有真实登录或角色权限'));
    await page.locator('#dialog-confirm').click();
    await waitForReviewStatus('已由模拟审核员批准');
    loaded = await readPage(id);
    record('approval-persists-exact-revision', loaded.body.draft?.reviewStatus === 'approved'
      && loaded.body.draft?.reviewRevision === loaded.body.draft?.draftRevision);
    await screenshot('03-approved');

    await page.getByLabel('当前模拟角色').selectOption('editor');
    await page.locator('#publish').click();
    await page.waitForSelector('#dialog[open]');
    await page.locator('#dialog-confirm').click();
    await page.getByText(/正式内容版本已保存/).waitFor({ timeout: 15000 });
    loaded = await readPage(id);
    record('approved-version-commits-locally', loaded.status === 200 && loaded.body.revision !== baseRevision
      && loaded.body.draft?.status === 'matches-published');
    record('publish-still-not-website-deploy', listing.capabilities.websitePublish === false
      && listing.capabilities.remoteSync === false);
    record('review-event-trail-persists', loaded.body.draft?.reviewEvents?.map(event => event.action).join(',')
      === 'draft-saved,submitted,returned,draft-saved,submitted,approved');
    const committedRevision = loaded.body.revision;
    const approvedDraftRevision = loaded.body.draft.draftRevision;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#editor:not([disabled])', { timeout: 15000 });
    loaded = await readPage(id);
    record('approved-version-survives-real-reload', loaded.status === 200
      && loaded.body.revision === committedRevision
      && loaded.body.draft?.draftRevision === approvedDraftRevision
      && loaded.body.draft?.reviewStatus === 'approved'
      && (await page.locator('#editor').inputValue()) === revisedText
      && await page.locator('#publish').isDisabled());
    record('approved-status-survives-reload', await page.locator('#review-status').textContent().then(t => t.includes('已写入本地正式版本')));
    await screenshot('04-local-version');

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    record('desktop-no-horizontal-overflow', !overflow);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => window.innerWidth === 390);
    record('narrow-no-horizontal-overflow', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
    await screenshot('05-narrow');

    // Only the exact missing favicon resource is waived, never arbitrary 404 text.
    const favicon = new URL('/favicon.ico', BASE).href;
    const scriptConsoleErrors = consoleErrors.filter(error => !(error.url === favicon && /status of 404\b/.test(error.text)));
    record('no-page-or-console-errors', pageErrors.length === 0 && scriptConsoleErrors.length === 0,
      [...pageErrors, ...scriptConsoleErrors.map(error => error.text)].slice(0, 3).join(' | '));
    record('no-failed-requests', failedRequests.length === 0, failedRequests.join(' | '));
    const unexpectedResponses = failedResponses.filter(response => !(response.url === favicon && response.status === 404));
    record('no-http-errors-except-favicon-404', unexpectedResponses.length === 0, JSON.stringify(unexpectedResponses));
  } catch (error) {
    results.push({ name: 'harness', status: 'FAIL', detail: String(error?.stack || error) });
    await fs.mkdir(SHOTS, { recursive: true });
    if (page) await page.screenshot({ path: path.join(SHOTS, 'failure.png'), fullPage: true }).catch(() => {});
  } finally {
    await browser?.close();
    await fs.writeFile(path.join(OUT, 'review-browser-report.json'), JSON.stringify({
      schema: 'admin-editor-local-review-browser-qa/v1',
      base_url: BASE,
      browser: browserVersion || 'Chrome launch failed',
      review_mode: 'local persona simulation; unauthenticated',
      generated_at: new Date().toISOString(),
      diagnostics: { consoleErrors, pageErrors, failedRequests, failedResponses },
      results
    }, null, 2), 'utf8');
  }

  const failures = results.filter(result => result.status === 'FAIL');
  process.stdout.write(`\n${results.length - failures.length}/${results.length} passed\n`);
  process.exitCode = failures.length ? 1 : 0;
}

run();
