import { beforeMentorWithdrawal, isWithdrawnRelation } from './fixtures/withdrawn-mentor-contract.mjs'
import { withoutCnkiAuthorPage } from './fixtures/cnki-author-page-contract.mjs'
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
const identityOnlyAdditions=['qi-haibin']
const newlyProfiledIdentity='wang-tao'
const boundary=JSON.parse(fs.readFileSync('scripts/offline/release-boundary.json','utf8'))
assert.equal(byId.size,people.length,'Never duplicate a migrated identity')
assert.deepEqual(people.filter(p=>!['li-xiang','huang-yinghui',...identityOnlyAdditions].includes(p.id)).map(p=>p.id).sort(),[...contract.historicalIdentities.map(p=>p.id),'naziguli-slam',newlyProfiledIdentity].sort(),'Preserve historical identities; Liu Kai keeps the existing ID; Wang Tao remains one unique identity as a full profile')
assert.deepEqual(people.filter(p=>identityOnlyAdditions.includes(p.id)).map(p=>p.id).sort(),identityOnlyAdditions.toSorted(),'Only the requested identity-only people page is added')
assert.deepEqual(identityOnlyAdditions.map(id=>({id:byId.get(id).id,name:byId.get(id).name,aliases:byId.get(id).aliases})),[
 {id:'qi-haibin',name:'齐海滨',aliases:[]}
])
for(const id of identityOnlyAdditions){
 const page=matter(fs.readFileSync(`content/wiki/people/${id}.md`,'utf8'))
 assert.equal(page.data.personId,id,`Identity page route binds to the exact ID: ${id}`)
 assert.ok(page.content.includes('<PersonProfile />'))
 assert.ok(boundary.routes.includes(`/wiki/people/${id}`),`Public release boundary includes ${id}`)
}
const newEdges=buildRelations({people,pages:readPages('content')}).edges
assert.ok(newEdges.some(edge=>edge.to==='/wiki/people/wang-tao'&&edge.role==='speaker'),'Wang Tao is linked to agenda speaker records')
assert.ok(newEdges.some(edge=>edge.to==='/wiki/people/qi-haibin'&&edge.role==='speaker'&&edge.from==='/conference/group/2018-2019'),'Qi Haibin is linked to the sourced 2018–2019 report')
assert.ok(fs.readFileSync('content/about/team.md','utf8').includes('[[../wiki/people/wang-tao|王涛]]'),'The member roster links Wang Tao to his page')
for(const prior of contract.historicalIdentities){const current=byId.get(prior.id);assert.ok(current,prior.id);assert.deepEqual({id:current.id,name:current.name,aliases:current.aliases},prior)}
assert.deepEqual(profiles.filter(p=>!['li-xiang','huang-yinghui'].includes(p.id)).map(p=>p.id).sort(),[...Object.keys(contract.historicalProfiles),...Object.keys(contract.expectedAdditionProfiles)].sort())
for(const [id,sha] of Object.entries({...contract.historicalProfiles,...contract.expectedAdditionProfiles})) assert.equal(digest(beforeMentorWithdrawal(id==='wang-tao'?profiles.find(p=>p.id===id):withoutCnkiAuthorPage(profiles.find(p=>p.id===id)))),sha,`Profile changed beyond reviewed scope: ${id}`)
assert.deepEqual(profiles.filter(p=>p.portrait&&!['li-xiang','huang-yinghui'].includes(p.id)).map(p=>p.id).sort(),Object.keys(contract.expectedPortraits).sort(),'Exact independently frozen portrait-ID set')
for(const [id,expected] of Object.entries(contract.expectedPortraits)){
 const p=profiles.find(p=>p.id===id);assert.equal(p.portrait.file,expected.file);assert.equal(p.portrait.sha256,expected.sha256)
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync('content/about/image/people/'+expected.file)).digest('hex'),expected.sha256,`Portrait bytes changed: ${id}`)
}
const graph=buildRelations({people,pages:readPages('content')});const key=e=>JSON.stringify([e.from,e.to,e.role,e.rule,e.source,e.status,e.confidence]);const now=new Set(graph.edges.map(key))
let promotedRelations=0
for(const prior of contract.historicalRelations){
 if(isWithdrawnRelation(prior,now)) continue
 const [from,to,role,rule]=JSON.parse(prior)
 const promotion=navigationPromotions.find(item=>item.from===from&&item.to===to)
 if(promotion&&role==='mention'&&rule==='unique-name-mention') promotedRelations++
 const promoted=promotion&&((role==='mention'&&rule==='unique-name-mention')||(role==='link'&&rule==='explicit-markdown-link'))
 const expected=promoted?JSON.stringify([from,to,'link',promotion.rule,from,'confirmed','explicit']):prior
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
console.log(`PASS profile additions: 15 historical identities, 6 full historical profiles, 628 historical relations (${promotedRelations} member-name edges resolve to explicit links), ${Object.keys(contract.expectedPortraits).length} fixed portrait hashes; three full-profile additions and one separately bounded identity-only page; three precise paper titles.`)

// The explicit new layer must validate every excluded Li Xiang record and all d594 state.
await import('./li-xiang-expansion.test.mjs')

await import('./huang-yinghui-addition.test.mjs')
