import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {verifyPinnedFixture} from '../server/seed-v7.mjs';
import {ContentStore} from '../server/store.mjs';

const manifestBytes = await fs.readFile(new URL('../fixtures/upstream/manifest.json', import.meta.url));
const provenance = JSON.parse(manifestBytes.toString('utf8'));
const expected = provenance.files[0].blob;
const checkout = await fs.readFile(new URL('../fixtures/upstream/obsidian.md', import.meta.url));
// The test itself works from either supported checkout style.
const original = verifyPinnedFixture(checkout, expected);
const lf = Buffer.from(original);
const crlf = Buffer.from(original.replace(/\n/g, '\r\n'));
const blob = bytes => createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');

test('pinned fixture: exact LF bytes pass without input mutation', () => {
  const before = Buffer.from(lf);
  assert.equal(blob(lf), expected);
  assert.equal(verifyPinnedFixture(lf, expected), original);
  assert.deepEqual(lf, before);
});

test('pinned fixture: uniform CRLF restores only the exact pinned LF bytes', () => {
  const before = Buffer.from(crlf);
  assert.notEqual(blob(crlf), expected);
  assert.equal(verifyPinnedFixture(crlf, expected), original);
  assert.equal(blob(Buffer.from(verifyPinnedFixture(crlf, expected))), expected);
  assert.deepEqual(crlf, before);
});

test('pinned fixture: exact raw hash is checked before any normalization', () => {
  // A different pinned source could itself intentionally contain CRLF.
  assert.equal(verifyPinnedFixture(crlf, blob(crlf)), crlf.toString('utf8'));
});

const rejected = {
  'mixed LF and CRLF': Buffer.from(original.replace('\n', '\r\n')),
  'bare CR': Buffer.from(original.replace('\n', '\r')),
  'CRLF plus changed body': Buffer.from(crlf.toString('utf8').replace('优秀', '不同')),
  'CRLF plus trailing space': Buffer.concat([crlf, Buffer.from(' ')]),
  'CRLF plus BOM': Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), crlf]),
  'CRLF minus final newline': crlf.subarray(0, crlf.length - 2),
  'CRLF plus invalid UTF-8': Buffer.concat([crlf, Buffer.from([0xff])]),
  'changed LF body': Buffer.from(original.replace('优秀', '不同'))
};
for (const [name, input] of Object.entries(rejected)) {
  test('pinned fixture rejects ' + name + ' without input mutation', () => {
    const before = Buffer.from(input);
    assert.throws(() => verifyPinnedFixture(input, expected), /Pinned upstream fixture changed/);
    assert.deepEqual(input, before);
  });
}

async function isolatedSeed(t, fixtureBytes) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'agi-fixture-portability-'));
  t.after(() => fs.rm(root, {recursive:true, force:true}));
  await fs.mkdir(path.join(root, 'server'));
  await fs.mkdir(path.join(root, 'fixtures/upstream'), {recursive:true});
  for (const name of ['seed-v7.mjs', 'text-block.mjs']) {
    await fs.copyFile(new URL('../server/' + name, import.meta.url), path.join(root, 'server', name));
  }
  const fixturePath = path.join(root, 'fixtures/upstream/obsidian.md');
  await fs.writeFile(fixturePath, fixtureBytes);
  await fs.writeFile(path.join(root, 'fixtures/upstream/manifest.json'), manifestBytes);
  const {seedV7} = await import(pathToFileURL(path.join(root, 'server/seed-v7.mjs')).href);
  return {root, fixturePath, seedV7};
}

test('CRLF seed: canonical metadata, protected edit and history restore stay byte-exact', async t => {
  const {root, fixturePath, seedV7} = await isolatedSeed(t, crlf);
  const store = new ContentStore(path.join(root, 'data'));
  await seedV7(store);
  const id = provenance.files[0].path;
  const head = store.head();
  assert.equal(store.git(['rev-parse', `${head}:${id}`]), expected);
  assert.equal(store.text(id), original);
  const mapping = await store.allowed(id);
  assert.equal(mapping.block.baselineCommit, provenance.commit);
  assert.equal(mapping.block.originalSourceSha256, createHash('sha256').update(lf).digest('hex'));
  const fragment = '它提供了优秀的 Markdown 编辑体验和知识管理功能。';
  const offset = original.indexOf(fragment);
  assert.equal(mapping.block.prefix, original.slice(0, offset));
  assert.equal(mapping.block.suffix, original.slice(offset + fragment.length));
  assert.equal((await store.read({id})).content, fragment);
  const replacement = '它支持文字编辑、内容整理与知识关联。';
  const draft = await store.saveDraft({id, content:replacement, baseRevision:head, expectedDraftRevision:null});
  assert.equal(store.text(id), original);
  const published = await store.publish({id, expectedRevision:head, expectedDraftRevision:draft.draftRevision});
  assert.equal(store.text(id), original.replace(fragment, replacement));
  assert.equal(published.publishedToWebsite, false);
  assert.equal(published.synced, false);
  const restored = await store.restore({id, targetRevision:head, expectedRevision:published.revision});
  assert.equal(store.git(['rev-parse', `${restored.revision}^`]), published.revision);
  assert.equal(store.text(id), original);
  assert.deepEqual(await fs.readFile(fixturePath), crlf);
});

test('invalid CRLF seed rejects before store initialization and keeps file unchanged', async t => {
  const input = rejected['CRLF plus changed body'];
  const {fixturePath, seedV7} = await isolatedSeed(t, input);
  let calls = 0;
  await assert.rejects(seedV7({initialize() { calls++; }}), /Pinned upstream fixture changed/);
  assert.equal(calls, 0);
  assert.deepEqual(await fs.readFile(fixturePath), input);
});
