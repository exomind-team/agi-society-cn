import assert from 'node:assert/strict'
import {createDraft,readDrafts,DRAFT_KEY,COMMUNITY_SNAPSHOT} from '../.vitepress/community/controller.mjs'
assert.throws(()=>createDraft({title:'',body:'x',category:'研究讨论'}))
assert.throws(()=>createDraft({title:'x',body:'x',category:'未知'}))
const reference={route:'/wiki/people/liu-kai',title:'刘凯',anchor:'community-p-1',quote:'测试引用',snapshot:COMMUNITY_SNAPSHOT}
const draft=createDraft({title:'  范围核验 ',body:'有来源的疑问',category:'Wiki改进',reference,id:'test'})
assert.equal(draft.title,'范围核验');assert.equal(draft.status,'local-only-not-published');assert.deepEqual(draft.reference,reference)
assert.deepEqual(readDrafts({getItem:()=>'{broken'}),[])
assert.deepEqual(readDrafts({getItem:()=>{throw Error('disabled')}}),[])
assert.deepEqual(readDrafts({getItem:()=>JSON.stringify([{...draft,reference:{route:'//evil.example'}}])}),[])
assert.equal(readDrafts({getItem:key=>{assert.equal(key,DRAFT_KEY);return JSON.stringify([draft])}}).length,1)
console.log('PASS community draft schema, reference preservation, malformed/disabled storage, unsafe route exclusion, local-only status')
