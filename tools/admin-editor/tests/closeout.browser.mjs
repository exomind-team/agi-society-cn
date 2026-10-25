// Installed-browser regression against disposable loopback stores. No production writes.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { ContentStore } from '../server/store.mjs';
import { createHandler } from '../server/http.mjs';

const out = path.resolve(process.env.QA_OUT || 'reports/closeout-browser');
const id = 'content/wiki/editor-demo.md';
const original = '原始正文。\n';
const results = [];
let browser;

async function ready(page) {
  await page.locator('#state').waitFor();
  await page.waitForFunction(() => document.querySelector('#state').textContent !== '正在处理…');
}
async function notice(page, text) {
  await page.waitForFunction(expected => document.querySelector('#notice').textContent.includes(expected), text);
}
async function confirm(page) {
  await page.locator('#dialog[open]').waitFor();
  await page.locator('#dialog-confirm').click();
  await page.locator('#dialog[open]').waitFor({ state: 'hidden' });
}
async function save(page, content) {
  await page.locator('#editor').fill(content);
  await page.locator('#save').click();
  await notice(page, '草稿已保存到本机内容服务');
}
async function publish(page) {
  await page.locator('#publish').click();
  await confirm(page);
  await notice(page, '正式内容版本已保存');
  await ready(page);
}
async function restore(page) {
  await page.locator('#history').click();
  await page.getByRole('button', { name: '查看此版本', exact: true }).last().click();
  await page.waitForFunction(() => document.querySelector('#dialog-title').textContent === '历史内容预览');
  await confirm(page);
  await notice(page, '已创建恢复版本');
  await ready(page);
}

async function scenario(name, reviewWorkflow, run) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'agi-closeout-browser-'));
  const store = new ContentStore(root, { reviewWorkflow });
  let server, context, page;
  const diagnostics = { console: [], pageErrors: [], responses: [], transport: [] };
  const expectedErrors = [];
  let base;
  const result = { name, status: 'FAIL', diagnostics };
  try {
    await store.initialize({ [id]: original, 'content/about/other.md': '另一页正文。\n' });
    let handler;
    server = http.createServer((req, res) => handler(req, res));
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    base = `http://127.0.0.1:${server.address().port}`;
    handler = createHandler(store, { origin: base, reviewWorkflow });
    context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
    context.setDefaultTimeout(10000);
    context.on('page', current => {
      current.on('console', message => {
        if (message.type() === 'error') diagnostics.console.push({ text: message.text(), url: message.location().url });
      });
      current.on('pageerror', error => diagnostics.pageErrors.push(String(error)));
      current.on('requestfailed', request => diagnostics.transport.push({ url: request.url(), error: request.failure()?.errorText }));
      current.on('response', response => {
        if (response.status() < 400) return;
        const request = response.request();
        const action = request.url().endsWith('/api/action') ? request.postDataJSON()?.action : null;
        diagnostics.responses.push({ url: response.url(), status: response.status(), action });
      });
    });
    page = await context.newPage();
    await page.goto(base);
    await ready(page);
    await run({ page, context, base, store, expectedErrors });
    const waived = response => response.url === `${base}/favicon.ico` && response.status === 404;
    const expected = response => expectedErrors.some(error => error.action === response.action && error.status === response.status);
    assert.deepEqual(diagnostics.responses.filter(response => !waived(response) && !expected(response)), [], 'unexpected HTTP errors');
    assert.deepEqual(diagnostics.pageErrors, [], 'uncaught page errors');
    assert.deepEqual(diagnostics.transport, [], 'transport failures');
    // Chrome's automatic favicon fetch may emit only console, without a response event.
    const unexpectedConsole = diagnostics.console.filter(error =>
      !(error.url === `${base}/favicon.ico` && /status of 404\b/.test(error.text))
      && !diagnostics.responses.some(response => response.url === error.url
        && expected(response) && error.text.includes(String(response.status))));
    assert.deepEqual(unexpectedConsole, [], 'unexpected console errors');
    await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
    result.status = 'PASS';
  } catch (error) {
    result.error = String(error.stack || error);
    await page?.screenshot({ path: path.join(out, `${name}-failure.png`), fullPage: true }).catch(() => {});
  } finally {
    await context?.close();
    if (server) await new Promise(resolve => server.close(resolve));
    // Only remove the fresh directory owned by this scenario, after closing all users.
    const resolved = await fs.realpath(root);
    const temp = await fs.realpath(os.tmpdir());
    assert.equal(path.dirname(resolved), temp);
    assert.ok(path.basename(resolved).startsWith('agi-closeout-browser-'));
    await fs.rm(resolved, { recursive: true });
    results.push(result);
    await fs.writeFile(path.join(out, `${name}.json`), JSON.stringify(result, null, 2));
    process.stdout.write(`${result.status} ${name}${result.error ? `: ${result.error.split('\n')[0]}` : ''}\n`);
  }
}

async function failReadAfterMutation(page, action, expectedErrors) {
  let armed = false;
  const counts = { mutations: 0, readFailures: 0 };
  expectedErrors.push({ action: 'read', status: 503 });
  await page.route('**/api/action', async route => {
    const body = route.request().postDataJSON();
    if (body.action === action) {
      counts.mutations++;
      const response = await route.fetch();
      armed = response.ok();
      await route.fulfill({ response });
    } else if (body.action === 'read' && armed) {
      armed = false;
      counts.readFailures++;
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { code: 'QA_READ_FAILURE', message: '受控回读失败' } }) });
    } else await route.continue();
  });
  return counts;
}

async function reconcile(page) {
  await page.locator('#reload').click();
  await confirm(page);
  await page.locator('#conflict').waitFor({ state: 'hidden' });
  await page.locator('#conflict').waitFor({ state: 'hidden' });
  await page.waitForFunction(() => document.querySelector('#notice').hidden);
  await page.locator('#state').waitFor();
}

await fs.mkdir(out, { recursive: true });
try {
  browser = await chromium.launch({ channel: process.env.QA_BROWSER_CHANNEL || 'chrome', headless: process.env.QA_HEADLESS === 'true' });
  await scenario('history-restores-new-commit-retains-draft', false, async ({ page, store }) => {
    const initial = store.head();
    await save(page, '已确认的新正文。\n');
    await publish(page);
    const committed = store.head();
    const draft = await store.draft(id);
    await restore(page);
    const restored = store.head();
    assert.notEqual(restored, initial);
    assert.equal(store.git(['rev-parse', `${restored}^`]), committed);
    assert.equal(store.text(id), original);
    assert.deepEqual(await store.draft(id), draft);
    assert.equal(await page.locator('#editor').inputValue(), draft.content);
    assert.equal((await store.history({ id })).versions.length, 3);
  });
  await scenario('two-windows-ui-conflict-retains-loser', false, async ({ page, context, base, store, expectedErrors }) => {
    const other = await context.newPage();
    await other.goto(base);
    await ready(other);
    await other.locator('#editor').fill('第二窗口尚未保存的正文。');
    await save(page, '第一窗口已保存的正文。');
    expectedErrors.push({ action: 'saveDraft', status: 409 });
    await other.locator('#save').click();
    await other.locator('#conflict').waitFor();
    assert.equal(await other.locator('#editor').inputValue(), '第二窗口尚未保存的正文。');
    assert.equal((await store.draft(id)).content, '第一窗口已保存的正文。');
    assert.equal(store.text(id), original);
  });
  await scenario('native-refresh-and-leave-cancel', false, async ({ page, base }) => {
    await page.locator('#editor').fill('取消离开时保留这段输入。');
    for (const navigate of [() => page.reload(), () => page.goto(`${base}/index.html`)]) {
      const dialog = page.waitForEvent('dialog');
      const navigation = navigate().then(() => null, error => error);
      const prompt = await dialog;
      assert.equal(prompt.type(), 'beforeunload');
      await prompt.dismiss();
      assert.ok(await navigation, 'cancel must abort the navigation');
      assert.equal(await page.locator('#editor').inputValue(), '取消离开时保留这段输入。');
    }
    await page.getByRole('button', { name: 'about/other', exact: true }).click();
    await page.getByRole('button', { name: '返回', exact: true }).click();
    assert.equal(await page.locator('#editor').inputValue(), '取消离开时保留这段输入。');
  });
  for (const action of ['publish', 'restore']) {
    await scenario(`${action}-receipt-survives-read-failure`, false, async ({ page, store, expectedErrors }) => {
      await save(page, '受控写入故障验证正文。');
      if (action === 'restore') await publish(page);
      const before = store.head();
      const counts = await failReadAfterMutation(page, action, expectedErrors);
      if (action === 'publish') await publish(page);
      else await restore(page);
      await notice(page, '但读取最新内容失败');
      const committed = store.head();
      assert.notEqual(committed, before);
      assert.ok((await page.locator('#notice').textContent()).includes(committed));
      assert.equal(await page.locator('#save').isDisabled(), true);
      assert.equal(await page.locator('#publish').isDisabled(), true);
      await page.keyboard.press('Control+s');
      assert.equal(counts.mutations, 1);
      assert.equal(counts.readFailures, 1);
      await reconcile(page);
      assert.equal(store.head(), committed);
    });
  }
  for (const decision of ['submit', 'approve', 'return']) {
    await scenario(`review-${decision}-receipt-survives-read-failure`, true, async ({ page, store, expectedErrors }) => {
      await save(page, '审核回读失败验证正文。');
      if (decision !== 'submit') {
        await page.locator('#review-submit').click();
        await page.waitForFunction(() => document.querySelector('#review-status').textContent.includes('待审核修订'));
        await page.getByLabel('当前模拟角色').selectOption('reviewer');
      }
      const action = decision === 'submit' ? 'submitForReview' : 'decideReview';
      const counts = await failReadAfterMutation(page, action, expectedErrors);
      if (decision === 'submit') await page.locator('#review-submit').click();
      else {
        await page.locator(decision === 'approve' ? '#review-approve' : '#review-return').click();
        if (decision === 'return') await page.locator('#review-return-reason').fill('请补充可核对来源。');
        await confirm(page);
      }
      // Current implementation must disclose the successful mutation and block retries.
      await notice(page, '但读取最新内容失败');
      const draft = await store.draft(id);
      assert.equal(draft.reviewStatus, { submit: 'in-review', approve: 'approved', return: 'returned' }[decision]);
      assert.ok((await page.locator('#notice').textContent()).includes(draft.draftRevision));
      const visibleReviewState = await page.locator('#review-status').textContent();
      assert.ok(visibleReviewState.includes({ submit: '待审核修订', approve: '模拟审核员批准', return: '已退回修改' }[decision]));
      assert.equal(await page.locator('#review-submit').isDisabled(), true);
      assert.equal(await page.locator('#review-approve').isVisible(), false);
      assert.equal(await page.locator('#review-return').isVisible(), false);
      assert.equal(counts.mutations, 1);
      assert.equal(counts.readFailures, 1);
      await reconcile(page);
      assert.equal((await store.draft(id)).reviewEvents.length, draft.reviewEvents.length);
    });
  }
} catch (error) {
  results.push({ name: 'browser-harness', status: 'FAIL', error: String(error.stack || error) });
} finally {
  const version = browser?.version() || null;
  await browser?.close();
  await fs.writeFile(path.join(out, 'closeout-browser-report.json'), JSON.stringify({
    schema: 'admin-editor-closeout-browser/v1', generatedAt: new Date().toISOString(),
    browser: version, node: process.version, platform: `${process.platform}/${process.arch}`,
    nativeIME: 'NOT_RUN', physicalKeysAndHumanFeel: 'NOT_RUN', results
  }, null, 2));
}
const failed = results.filter(result => result.status === 'FAIL').length;
process.stdout.write(`${results.length - failed}/${results.length} scenarios passed\n`);
process.exitCode = failed ? 1 : 0;
