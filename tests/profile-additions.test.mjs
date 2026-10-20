import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import matter from 'gray-matter'
import {readPeople,readPages,buildRelations} from '../.vitepress/relations/index.mjs'
const contract=JSON.parse(fs.readFileSync('tests/fixtures/profile-additions-contract.json','utf8'))
const navigationPromotions=JSON.parse(fs.readFileSync('tests/fixtures/member-navigation-promotions.json','utf8'))
const profiles=JSON.parse(fs.readFileSync('data/people-profiles.json','utf8'))
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const people=readPeople(), byId=new Map(people.map(p=>[p.id,p]))
assert.equal(byId.size,people.length,'Never duplicate a migrated identity')
assert.deepEqual(people.filter(p=>p.id!=='li-xiang').map(p=>p.id).sort(),[...contract.historicalIdentities.map(p=>p.id),'naziguli-slam'].sort(),'Exactly one new identity; Liu Kai keeps the existing ID')
for(const prior of contract.historicalIdentities){const current=byId.get(prior.id);assert.ok(current,prior.id);assert.deepEqual({id:current.id,name:current.name,aliases:current.aliases},prior)}
assert.deepEqual(profiles.filter(p=>p.id!=='li-xiang').map(p=>p.id).sort(),[...Object.keys(contract.historicalProfiles),...Object.keys(contract.expectedAdditionProfiles)].sort())
for(const [id,sha] of Object.entries({...contract.historicalProfiles,...contract.expectedAdditionProfiles})) assert.equal(digest(profiles.find(p=>p.id===id)),sha,`Profile changed beyond reviewed scope: ${id}`)
assert.deepEqual(profiles.filter(p=>p.portrait&&p.id!=='li-xiang').map(p=>p.id).sort(),Object.keys(contract.expectedPortraits).sort(),'Exact independently frozen portrait-ID set')
for(const [id,expected] of Object.entries(contract.expectedPortraits)){
 const p=profiles.find(p=>p.id===id);assert.equal(p.portrait.file,expected.file);assert.equal(p.portrait.sha256,expected.sha256)
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync('content/about/image/people/'+expected.file)).digest('hex'),expected.sha256,`Portrait bytes changed: ${id}`)
}
const graph=buildRelations({people,pages:readPages('content')});const key=e=>JSON.stringify([e.from,e.to,e.role,e.rule,e.source,e.status,e.confidence]);const now=new Set(graph.edges.map(key))
let promotedRelations=0
for(const prior of contract.historicalRelations){
 const [from,to,role,rule]=JSON.parse(prior)
 const promotion=navigationPromotions.find(item=>item.from===from&&item.to===to)
 if(promotion&&role==='mention'&&rule==='unique-name-mention') promotedRelations++
 const expected=promotion&&role==='mention'&&rule==='unique-name-mention'?JSON.stringify([from,to,'link',promotion.rule,from,'confirmed','explicit']):prior
 assert.ok(now.has(expected),`Historical relation lost or rewritten: ${prior}`)
}
assert.deepEqual(byId.get('naziguli-slam').aliases,['那迪'])
assert.equal(matter(fs.readFileSync('content/wiki/people/naziguli-slam.md','utf8')).data.personId,'naziguli-slam')
assert.ok(graph.edges.some(e=>e.to==='/wiki/people/naziguli-slam'&&e.role==='speaker'&&e.rule==='agenda-speaker-column'))
const liu=profiles.find(p=>p.id==='liu-kai')
for(const id of ['liu-2018-machine-education','liu-2023-dual-paradigm','liu-2023-teaching-machines-effectiveness']){
 const title=matter(fs.readFileSync(`content/wiki/papers/${id}.md`,'utf8')).data.title
 assert.equal(liu.related.find(r=>r.href===`/wiki/papers/${id}`).label,`论文：${title}`)
}
console.log(`PASS profile additions: 15 historical identities, 6 full historical profiles, 628 historical relations (${promotedRelations} member-name edges resolve to explicit links), ${Object.keys(contract.expectedPortraits).length} fixed portrait hashes; two added full profiles and exactly one new person ID; three precise paper titles.`)

// The explicit new layer must validate every excluded Li Xiang record and all d594 state.
await import('./li-xiang-expansion.test.mjs')
