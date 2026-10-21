import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ContentStore } from '../server/store.mjs';

const PAGE = 'content/wiki/example.md';
const OTHER = 'content/wiki/other.md';
const ORIGINAL = 'Original public text\n';

async function fixture(t, options) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'admin-security-review-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const store = new ContentStore(root, options);
  const { revision } = await store.initialize({ [PAGE]: ORIGINAL, [OTHER]: 'Other page\n' });
  return { root, store, revision };
}

const rejectsCode = (promise, code) => assert.rejects(promise, error => error.code === code);

async function draft(store, revision, content = 'Private draft marker 8f18\n') {
  return store.saveDraft({ id: PAGE, content, baseRevision: revision, expectedDraftRevision: null });
}

test('draft is excluded from canonical content, published history, and Git objects', async t => {
  const { store, revision } = await fixture(t);
  const saved = await draft(store, revision);
  assert.equal(store.head(), revision);
  assert.equal(store.text(PAGE), ORIGINAL);
  assert.equal((await store.history({ id: PAGE })).versions.length, 1);
  assert.equal((await store.preview({ id: PAGE })).content, saved.content);
  const objects = store.git(['cat-file', '--batch-all-objects', '--batch']);
  assert.equal(objects.includes(saved.content.trim()), false);
});

test('allowlisted IDs reject traversal, Git revision syntax, options and unknown pages', async t => {
  const { store, revision } = await fixture(t);
  for (const id of ['../private-drafts/a.json', 'content/wiki/../../secret.md', '/etc/passwd', 'content/wiki/a.md:HEAD', '--help', 'content/wiki/a%2fb.md', 'content/wiki/a\\b.md']) {
    await rejectsCode(store.read({ id }), 'INVALID_PAGE');
    await rejectsCode(store.saveDraft({ id, content: 'text', baseRevision: revision, expectedDraftRevision: null }), 'INVALID_PAGE');
  }
  await rejectsCode(store.read({ id: 'content/wiki/unlisted.md' }), 'UNKNOWN_PAGE');
  assert.equal(store.head(), revision);
});

test('Vue, raw HTML, frontmatter and executable module forms never become drafts', async t => {
  const { store, revision } = await fixture(t);
  for (const content of ['<script>alert(1)</script>', '{{ process.env }}', '---\ntitle: injected\n---', 'import x from "evil"', 'export default {}', 'safe\0bad']) {
    await assert.rejects(draft(store, revision, content));
    assert.equal(await store.draft(PAGE), null);
  }
  assert.equal(store.head(), revision);
});

test('draft CAS rejects stale editor without replacing the newer draft', async t => {
  const { store, revision } = await fixture(t);
  const first = await draft(store, revision);
  const next = await store.saveDraft({ id: PAGE, content: 'Newer draft', baseRevision: revision, expectedDraftRevision: first.draftRevision });
  await rejectsCode(store.saveDraft({ id: PAGE, content: 'Stale overwrite', baseRevision: revision, expectedDraftRevision: first.draftRevision }), 'DRAFT_CONFLICT');
  assert.deepEqual(await store.draft(PAGE), next);
  await rejectsCode(store.publish({ id: PAGE, expectedRevision: revision, expectedDraftRevision: first.draftRevision }), 'DRAFT_CONFLICT');
  assert.equal(store.head(), revision);
});

test('separate store instances cannot both overwrite the same draft version', async t => {
  const { store, root, revision } = await fixture(t);
  const second = new ContentStore(root);
  const results = await Promise.allSettled([
    draft(store, revision, 'Writer A'),
    draft(second, revision, 'Writer B'),
  ]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  const loser = results.find(result => result.status === 'rejected');
  assert.ok(['BUSY', 'DRAFT_CONFLICT'].includes(loser.reason.code));
  assert.ok(['Writer A', 'Writer B'].includes((await store.draft(PAGE)).content));
});

test('publish is a new local version, not a build or remote sync; rollback appends history', async t => {
  const { store, revision } = await fixture(t);
  const saved = await draft(store, revision);
  const published = await store.publish({ id: PAGE, expectedRevision: revision, expectedDraftRevision: saved.draftRevision });
  assert.notEqual(published.revision, revision);
  assert.equal(published.publishedToWebsite, false);
  assert.equal(published.synced, false);
  assert.equal(store.text(OTHER), 'Other page\n');
  const restored = await store.restore({ id: PAGE, targetRevision: revision, expectedRevision: published.revision });
  assert.notEqual(restored.revision, revision);
  assert.notEqual(restored.revision, published.revision);
  assert.equal(store.text(PAGE), ORIGINAL);
  assert.equal(store.git(['rev-parse', `${restored.revision}^`]), published.revision);
  assert.equal((await store.history({ id: PAGE })).versions.length, 3);
  assert.equal((await store.syncStatus()).state, 'disabled');
  assert.equal(store.git(['remote']), '');
});

test('ref CAS defeats a writer that races after preparation; failed content is not history', async t => {
  let store;
  let competingRevision;
  const setup = await fixture(t, { beforeAdvance() {
    const current = store.head();
    competingRevision = store.commit(store.git(['rev-parse', `${current}^{tree}`]), current, 'Concurrent editor version');
    store.git(['update-ref', 'refs/heads/published', competingRevision, current]);
  } });
  store = setup.store;
  const saved = await draft(store, setup.revision, 'Rejected competing text');
  await rejectsCode(store.publish({ id: PAGE, expectedRevision: setup.revision, expectedDraftRevision: saved.draftRevision }), 'VERSION_CONFLICT');
  assert.equal(store.head(), competingRevision);
  assert.equal(store.text(PAGE), ORIGINAL);
  assert.equal((await store.draft(PAGE)).content, saved.content);
  assert.equal((await store.history({ id: PAGE })).versions.some(row => row.summary.includes('发布文字')), false);
});

test('restore rejects unpublished commits even when their object ID is known', async t => {
  const { store, revision } = await fixture(t);
  const detached = store.commit(store.git(['rev-parse', `${revision}^{tree}`]), revision, 'Unpublished branch');
  await rejectsCode(store.restore({ id: PAGE, targetRevision: detached, expectedRevision: revision }), 'UNKNOWN_VERSION');
  assert.equal(store.head(), revision);
});

// Exercise the HTTP adapter without opening a listener or a browser.
const ORIGIN = 'http://127.0.0.1:8787';
async function request(handler, { method = 'POST', url = '/api/action', headers = {}, body = '{}' } = {}) {
  const req = {
    method, url,
    headers: { host: '127.0.0.1:8787', origin: ORIGIN, 'content-type': 'application/json', ...headers },
    async *[Symbol.asyncIterator]() { yield Buffer.from(body); },
  };
  const response = {};
  await handler(req, {
    writeHead(status, responseHeaders) { response.status = status; response.headers = responseHeaders; },
    end(data) { response.body = String(data); },
  });
  return response;
}

const handlerFor = async (store, options = {}) => {
  const { createHandler } = await import('../server/http.mjs');
  return createHandler(store, { origin: ORIGIN, ...options });
};

test('sensitive HTTP reads require exact Origin and Host before accessing storage', async t => {
  const { store } = await fixture(t);
  const handler = await handlerFor(store);
  for (const action of ['read', 'preview', 'history', 'readVersion']) {
    for (const headers of [{ origin: undefined }, { origin: 'null' }, { origin: 'https://attacker.invalid' }, { host: 'attacker.invalid:8787' }]) {
      const response = await request(handler, { headers, body: JSON.stringify({ action, id: PAGE }) });
      assert.equal(response.status, 403);
      assert.equal(response.body.includes(ORIGINAL.trim()), false);
      assert.equal(response.headers['Cache-Control'], 'no-store');
    }
  }
});

test('HTTP action allowlist cannot invoke arbitrary storage or command methods', async t => {
  const { store, revision } = await fixture(t);
  const handler = await handlerFor(store);
  for (const action of ['git', 'commit', 'advance', 'initialize', 'constructor', '__proto__', 'text', 'push', 'build']) {
    const response = await request(handler, { body: JSON.stringify({ action, args: ['remote', 'add', 'evil', 'https://attacker.invalid'] }) });
    assert.equal(response.status, 400);
    assert.equal(JSON.parse(response.body).error.code, 'UNKNOWN_ACTION');
  }
  assert.equal(store.head(), revision);
  assert.equal(store.git(['remote']), '');
});

test('HTTP does not expose draft files, Git database, filesystem paths or query traversal', async t => {
  const { store } = await fixture(t);
  const handler = await handlerFor(store);
  for (const url of ['/private-drafts/secret.json', '/content.git/config', '/server/store.mjs', '/../../etc/passwd', '/%2e%2e/%2e%2e/etc/passwd', '/api/action?action=read', '/index.html/../server/store.mjs']) {
    assert.equal((await request(handler, { method: 'GET', url })).status, 404);
  }
});

test('HTTP rejects form submissions, malformed JSON and malformed action envelopes', async t => {
  const { store, revision } = await fixture(t);
  const handler = await handlerFor(store);
  assert.equal((await request(handler, { headers: { 'content-type': 'text/plain' } })).status, 415);
  for (const body of ['{', 'null', '[]', '"publish"', '{}']) {
    assert.equal((await request(handler, { body })).status, 400);
  }
  assert.equal(store.head(), revision);
});

test('history read endpoint refuses unreachable versions and emits no sensitive cache', async t => {
  const { store, revision } = await fixture(t);
  const detached = store.commit(store.git(['rev-parse', `${revision}^{tree}`]), revision, 'Unpublished branch');
  const handler = await handlerFor(store);
  const response = await request(handler, { body: JSON.stringify({ action: 'readVersion', id: PAGE, targetRevision: detached }) });
  assert.equal(response.status, 404);
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('server read-only rejects all mutations even with valid origin and tokens', async t => {
  const { store, revision } = await fixture(t);
  const saved = await draft(store, revision);
  const handler = await handlerFor(store, { readOnly: true });
  const pages = await request(handler, { method: 'GET', url: '/api/pages' });
  assert.equal(JSON.parse(pages.body).capabilities.readOnly, true);
  for (const action of ['saveDraft', 'publish', 'restore']) {
    const response = await request(handler, { body: JSON.stringify({ action, id: PAGE, content: 'changed', baseRevision: revision, expectedRevision: revision, expectedDraftRevision: saved.draftRevision, targetRevision: revision }) });
    assert.equal(response.status, 403);
  }
  assert.equal(store.head(), revision);
  assert.deepEqual(await store.draft(PAGE), saved);
});

async function protectedFixture(t) {
  const { defineTextBlock } = await import('../server/text-block.mjs');
  const source = await fs.readFile(new URL('../fixtures/upstream/obsidian.md', import.meta.url), 'utf8');
  const fragment = '它提供了优秀的 Markdown 编辑体验和知识管理功能。';
  const mapping = defineTextBlock({ source, fragment, title: 'Review fixture', baselineCommit: 'review-only' });
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'admin-security-review-block-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const store = new ContentStore(root);
  const { revision } = await store.initialize({ [PAGE]: source }, { [PAGE]: mapping });
  return { store, revision, source, fragment, mapping };
}

test('actual v7 protected block changes only selected bytes; restore appends commit', async t => {
  const { store, revision, source, fragment, mapping } = await protectedFixture(t);
  assert.equal((await store.read({ id: PAGE })).content, fragment);
  assert.equal(JSON.stringify(await store.list()).includes(mapping.block.prefix), false);
  const saved = await draft(store, revision, '独立审查文字。');
  const published = await store.publish({ id: PAGE, expectedRevision: revision, expectedDraftRevision: saved.draftRevision });
  assert.equal(store.text(PAGE), mapping.block.prefix + saved.content + mapping.block.suffix);
  const read = await store.read({ id: PAGE });
  assert.equal(read.draft.status, 'matches-published');
  assert.equal(read.draft.baseRevision, revision);
  assert.equal(read.draft.stale, true);
  const restored = await store.restore({ id: PAGE, targetRevision: revision, expectedRevision: published.revision });
  assert.equal(store.text(PAGE), source);
  assert.equal(store.git(['rev-parse', `${restored.revision}^`]), published.revision);
});

test('protected block refuses markup injection and newline structure escape', async t => {
  const { store, revision } = await protectedFixture(t);
  for (const text of ['<script>x</script>', '{{x}}', '[click](javascript:alert(1))', '\n---\ntitle: x', '`x`', 'a\u0000b', '&lt;script&gt;', '![](x)', 'a\rnew', '# heading', '*emphasis*']) {
    await assert.rejects(draft(store, revision, text));
    assert.equal(await store.draft(PAGE), null);
  }
  assert.equal(store.head(), revision);
});

test('protected prefix, suffix and offset drift fails closed', async t => {
  const { replaceTextBlock } = await import('../server/text-block.mjs');
  const { source, mapping } = await protectedFixture(t);
  for (const changed of ['prefix shift\n' + source, source + '\nnew footer', source.slice(1)]) {
    assert.throws(() => replaceTextBlock({ source: changed, block: mapping.block, text: 'replacement' }), /结构已变化/);
  }
});
