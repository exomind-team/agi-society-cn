import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {ContentStore} from '../server/store.mjs';
const require=createRequire(import.meta.url);
const {Session}=require('../web/core.js');

test('UI Session interoperates with actual Git store including retained draft and restore',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'agi-ui-real-'));
  t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const store=new ContentStore(root),id='content/wiki/test.md';
  await store.initialize({[id]:'原始文字。\n'});
  const adapter={action:(action,args)=>store[action](args)};
  const s=new Session(adapter);
  await s.load(id);
  const original=s.page.revision;
  s.text='更新文字。\n';
  await s.save();
  assert.equal(store.head(),original);
  assert.equal(store.text(id),'原始文字。\n');
  const outcome=await s.commitAndReload(()=>s.publish());
  assert.equal(outcome.refreshError,null);
  assert.equal(outcome.result.publishedToWebsite,false);
  assert.equal(s.page.draft.status,'matches-published');
  assert.equal(s.page.content,'更新文字。\n');
  await s.commitAndReload(()=>adapter.action('restore',{id,targetRevision:original,expectedRevision:s.page.revision}));
  assert.equal(s.page.content,'原始文字。\n');
  assert.equal(s.page.draft.stale,true);
  assert.equal(s.text,'更新文字。\n');
  // Explicitly rebase the retained draft through the latest canonical revision.
  await s.save();
  assert.equal(s.page.draft.baseRevision,s.page.revision);
});
