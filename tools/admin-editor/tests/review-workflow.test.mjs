import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ContentStore } from '../server/store.mjs';

const id = 'content/wiki/review-demo.md';

async function fixture(t, reviewWorkflow = true) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'agi-review-demo-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const store = new ContentStore(root, { reviewWorkflow });
  await store.initialize({ [id]: '# Review demo\n\nOriginal text.\n' });
  return store;
}

async function save(store, content, expectedDraftRevision = null) {
  const current = await store.read({ id });
  return store.saveDraft({
    id,
    content,
    baseRevision: current.revision,
    expectedDraftRevision
  });
}

test('review workflow persists exact revision and gates local formal commit', async t => {
  const store = await fixture(t);
  const initial = store.head();
  const draft = await save(store, '# Review demo\n\nCandidate text.\n');
  assert.equal(draft.reviewStatus, 'draft');
  await assert.rejects(
    store.publish({ id, expectedRevision: initial, expectedDraftRevision: draft.draftRevision }),
    { code: 'REVIEW_REQUIRED' }
  );
  assert.equal(store.head(), initial);

  const submitted = await store.submitForReview({
    id,
    expectedRevision: initial,
    expectedDraftRevision: draft.draftRevision
  });
  assert.equal(submitted.reviewStatus, 'in-review');
  assert.equal(submitted.reviewRevision, draft.draftRevision);
  assert.equal(store.head(), initial);

  const reopened = new ContentStore(store.root, { reviewWorkflow: true });
  const afterRestart = await reopened.read({ id });
  assert.equal(afterRestart.draft.reviewStatus, 'in-review');
  assert.equal(afterRestart.draft.reviewRevision, draft.draftRevision);

  const approved = await reopened.decideReview({
    id,
    expectedDraftRevision: draft.draftRevision,
    decision: 'approve'
  });
  assert.equal(approved.reviewStatus, 'approved');
  assert.equal(approved.reviewEvents.at(-1).actor, '本机流程模拟（未认证）');
  assert.equal(reopened.head(), initial);

  const committed = await reopened.publish({
    id,
    expectedRevision: initial,
    expectedDraftRevision: draft.draftRevision
  });
  assert.equal(committed.publishedToWebsite, false);
  assert.equal(committed.synced, false);
  assert.equal(reopened.text(id), draft.content);
  const final = await reopened.read({ id });
  assert.equal(final.draft.status, 'matches-published');
  assert.equal(final.draft.reviewStatus, 'approved');
  assert.deepEqual(final.draft.reviewEvents.map(event => event.action), [
    'draft-saved', 'submitted', 'approved'
  ]);
});

test('returned revision requires a changed saved draft before resubmission', async t => {
  const store = await fixture(t);
  const initial = store.head();
  const draft = await save(store, 'Candidate one.\n');
  await store.submitForReview({ id, expectedRevision: initial, expectedDraftRevision: draft.draftRevision });
  await assert.rejects(store.decideReview({
    id,
    expectedDraftRevision: draft.draftRevision,
    decision: 'return'
  }), { code: 'REVIEW_REASON_REQUIRED' });

  const returned = await store.decideReview({
    id,
    expectedDraftRevision: draft.draftRevision,
    decision: 'return',
    reason: '请补充来源说明。'
  });
  assert.equal(returned.reviewStatus, 'returned');
  assert.equal(returned.reviewReason, '请补充来源说明。');
  await assert.rejects(store.submitForReview({
    id,
    expectedRevision: initial,
    expectedDraftRevision: draft.draftRevision
  }), { code: 'REVIEW_UNCHANGED' });

  const revised = await save(store, 'Candidate two with source.\n', draft.draftRevision);
  assert.equal(revised.reviewStatus, 'draft');
  assert.notEqual(revised.draftRevision, draft.draftRevision);
  const submitted = await store.submitForReview({
    id,
    expectedRevision: initial,
    expectedDraftRevision: revised.draftRevision
  });
  assert.equal(submitted.reviewStatus, 'in-review');
});

test('stale published revision cannot be approved in the review workflow', async t => {
  const store = await fixture(t);
  const initial = store.head();
  const draft = await save(store, 'Candidate based on old revision.\n');
  await store.submitForReview({ id, expectedRevision: initial, expectedDraftRevision: draft.draftRevision });

  await store.advance(id, 'An external, already-authorized writer advanced the content.\n', initial, 'external edit');

  await assert.rejects(store.decideReview({
    id,
    expectedDraftRevision: draft.draftRevision,
    decision: 'approve'
  }), { code: 'VERSION_CONFLICT' });
  assert.equal(store.text(id), 'An external, already-authorized writer advanced the content.\n');
  assert.equal((await store.draft(id)).reviewStatus, 'in-review');
});

test('review actions are unavailable in the standard single-user prototype', async t => {
  const store = await fixture(t, false);
  const current = await store.read({ id });
  const draft = await save(store, 'Local single-user text.\n');
  await assert.rejects(store.submitForReview({
    id,
    expectedRevision: current.revision,
    expectedDraftRevision: draft.draftRevision
  }), { code: 'REVIEW_DISABLED' });
  const published = await store.publish({
    id,
    expectedRevision: current.revision,
    expectedDraftRevision: draft.draftRevision
  });
  assert.equal(published.publishedToWebsite, false);
});
