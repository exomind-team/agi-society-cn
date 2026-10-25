import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {ContentStore} from '../server/store.mjs';
import {verifyPinnedFixture} from '../server/seed-v7.mjs';
const id='content/wiki/demo.md';
async function fixture(t,options){const root=await fs.mkdtemp(path.join(os.tmpdir(),'agi-editor-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));const store=new ContentStore(root,options);await store.initialize({[id]:'# 原文\n\n保留原始文字。\n','content/wiki/other.md':'其他页面\n'});return store}
async function save(store,content){const current=await store.read({id});return store.saveDraft({id,content,baseRevision:current.revision,expectedDraftRevision:current.draft?.draftRevision??null})}
test('real Git: draft private, preview no commit, publish creates version, restore adds commit',async t=>{const s=await fixture(t);const initial=s.head();const draft=await save(s,'# 新文字\n\n新段落。\n');assert.equal(s.head(),initial);assert.equal((await s.preview({id})).content,draft.content);assert(!s.git(['ls-tree','-r','--name-only',initial]).includes('private'));assert.equal(s.text(id),'# 原文\n\n保留原始文字。\n');const pub=await s.publish({id,expectedRevision:initial,expectedDraftRevision:draft.draftRevision});assert.equal(pub.publishedToWebsite,false);assert.equal(pub.synced,false);assert.equal(s.text(id),draft.content);assert.equal(s.git(['rev-parse',`${pub.revision}^`]),initial);const restored=await s.restore({id,targetRevision:initial,expectedRevision:pub.revision});assert.equal(s.git(['rev-parse',`${restored.revision}^`]),pub.revision);assert.equal(s.text(id),'# 原文\n\n保留原始文字。\n');assert.equal((await s.history({id})).versions.length,3);assert.equal(s.text('content/wiki/other.md'),'其他页面\n');assert.equal((await s.syncStatus()).state,'disabled')});
test('stale draft rejected across separate instances without loss',async t=>{const s=await fixture(t);const other=new ContentStore(s.root);const revision=s.head();const first=await save(s,'第一版');await assert.rejects(other.saveDraft({id,content:'覆盖',baseRevision:revision,expectedDraftRevision:null}),{code:'DRAFT_CONFLICT'});assert.equal((await s.draft(id)).content,'第一版');await s.publish({id,expectedRevision:revision,expectedDraftRevision:first.draftRevision});await assert.rejects(other.saveDraft({id,content:'旧基础',baseRevision:revision,expectedDraftRevision:first.draftRevision}),{code:'VERSION_CONFLICT'})});
test('stale preview cannot publish newer draft',async t=>{const s=await fixture(t);const one=await save(s,'one');await save(s,'two');await assert.rejects(s.publish({id,expectedRevision:one.baseRevision,expectedDraftRevision:one.draftRevision}),{code:'DRAFT_CONFLICT'});assert.equal(s.head(),one.baseRevision)});
test('path, command and executable content rejected before write',async t=>{const s=await fixture(t);const revision=s.head();for(const bad of ['../../secrets','content/wiki/../../x.md','content/wiki/demo.md\0','content/wiki/x.md;echo','--help','content/wiki/unknown.md'])await assert.rejects(s.read({id:bad}));for(const content of ['<script>alert(1)</script>','{{ constructor }}','---\ntitle: x\n---','import x from "x"','export default {}'])await assert.rejects(save(s,content),{code:'UNSAFE_CONTENT'});assert.equal(s.head(),revision);assert.equal(await s.draft(id),null)});
test('failure before ref advance leaves visible version and draft intact; later retry succeeds',async t=>{const s=await fixture(t);const draft=await save(s,'new');s.beforeAdvance=()=>{throw new Error('simulated build/preparation failure')};await assert.rejects(s.publish({id,expectedRevision:draft.baseRevision,expectedDraftRevision:draft.draftRevision}),/simulated/);assert.equal(s.head(),draft.baseRevision);assert.equal((await s.draft(id)).content,'new');s.beforeAdvance=null;await s.publish({id,expectedRevision:draft.baseRevision,expectedDraftRevision:draft.draftRevision});assert.equal(s.text(id),'new')});
test('CAS rejects a separate writer advancing reference during preparation',async t=>{const s=await fixture(t);const draft=await save(s,'our new');let external;s.beforeAdvance=()=>{const tree=s.git(['rev-parse',`${draft.baseRevision}^{tree}`]);external=s.commit(tree,draft.baseRevision,'external commit');s.git(['update-ref','refs/heads/published',external,draft.baseRevision])};await assert.rejects(s.publish({id,expectedRevision:draft.baseRevision,expectedDraftRevision:draft.draftRevision}),{code:'VERSION_CONFLICT'});assert.equal(s.head(),external);assert.equal((await s.draft(id)).content,'our new')});
test('cross-instance in-flight lock rejects another write and releases after error',async t=>{const s=await fixture(t);const other=new ContentStore(s.root);await s.lock(async()=>{await assert.rejects(save(other,'blocked'),{code:'BUSY'})});await save(other,'allowed');assert.equal((await s.draft(id)).content,'allowed')});
test('historical read only accepts published ancestors and preserves exact trailing whitespace',async t=>{const s=await fixture(t);const initial=s.head();const old=s.text(id);const d=await save(s,'text\n\n');await s.publish({id,expectedRevision:initial,expectedDraftRevision:d.draftRevision});assert.equal(s.text(id),'text\n\n');assert.equal((await s.readVersion({id,targetRevision:initial})).content,old);await assert.rejects(s.readVersion({id,targetRevision:'--all'}),{code:'INVALID_VERSION'})});
test('initialization refuses destructive reinitialization',async t=>{const s=await fixture(t);const before=s.head();await assert.rejects(s.initialize({[id]:'replace'}),{code:'EXISTS'});assert.equal(s.head(),before)});

test('real v7 source: protected text replacement and restore preserve every outside byte',async t=>{
 const {defineTextBlock}=await import('../server/text-block.mjs');
 const bytes=await fs.readFile(new URL('../fixtures/upstream/obsidian.md',import.meta.url));
 const manifest=JSON.parse(await fs.readFile(new URL('../fixtures/upstream/manifest.json',import.meta.url),'utf8'));
 const source=verifyPinnedFixture(bytes,manifest.files[0].blob);
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'agi-v7-block-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const s=new ContentStore(root);const id=manifest.files[0].path;const fragment='它提供了优秀的 Markdown 编辑体验和知识管理功能。';
 const mapping=defineTextBlock({source,fragment,title:'Obsidian指南 · 正文说明',baselineCommit:manifest.commit});
 await s.initialize({[id]:source},{[id]:mapping});const initial=s.head();
 assert.equal((await s.read({id})).content,fragment);
 const replacement='它支持文字编辑、内容整理与知识关联。';
 const d=await s.saveDraft({id,content:replacement,baseRevision:initial,expectedDraftRevision:null});
 assert.equal(s.text(id),source);
 const pub=await s.publish({id,expectedRevision:initial,expectedDraftRevision:d.draftRevision});
 assert.equal(s.text(id),source.replace(fragment,replacement));
 assert.equal((await s.read({id})).draft.status,'matches-published');
 await s.restore({id,targetRevision:initial,expectedRevision:pub.revision});assert.equal(s.text(id),source);
 for(const bad of ['text\n<script>','{{1+1}}','[链接](javascript:alert(1))','&lt;script&gt;','*样式*'])await assert.rejects(s.saveDraft({id,content:bad,baseRevision:s.head(),expectedDraftRevision:d.draftRevision}),{code:'UNSAFE_CONTENT'});
 assert.equal(s.text(id),source);
});
