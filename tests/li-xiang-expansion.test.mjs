import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import matter from 'gray-matter'
import {readPeople,readPages,buildRelations} from '../.vitepress/relations/index.mjs'
const frozen=JSON.parse(fs.readFileSync('tests/fixtures/li-xiang-contract.json','utf8'))
const navigationPromotions=JSON.parse(fs.readFileSync('tests/fixtures/member-navigation-promotions.json','utf8'))
const profiles=JSON.parse(fs.readFileSync('data/people-profiles.json','utf8'))
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex')
assert.deepEqual(profiles.map(p=>p.id).sort(),[...Object.keys(frozen.profiles),'li-xiang'].sort())
for(const [id,sha] of Object.entries(frozen.profiles)) assert.equal(hash(profiles.find(p=>p.id===id)),sha,`Preserve complete d594 profile: ${id}`)
const li=profiles.find(p=>p.id==='li-xiang');assert.equal(hash(li),frozen.liXiangProfileSha256)
assert.equal(li.name,'李祥');assert.deepEqual(li.aliases,[])
assert.equal(li.portrait.sourceUrl,'https://jckxyjy.lnut.edu.cn/info/14480/184821.htm')
assert.equal(li.portrait.sha256,frozen.liXiangPhotoSha256)
assert.equal(matter(fs.readFileSync('content/wiki/people/li-xiang.md','utf8')).data.personId,'li-xiang')
const expectedPhotos={...frozen.portraits,'li-xiang':{file:'li-xiang.jpg',sha256:frozen.liXiangPhotoSha256}}
assert.deepEqual(profiles.filter(p=>p.portrait).map(p=>p.id).sort(),Object.keys(expectedPhotos).sort())
for(const [id,photo] of Object.entries(expectedPhotos)){
 const p=profiles.find(p=>p.id===id);assert.equal(p.portrait.file,photo.file);assert.equal(p.portrait.sha256,photo.sha256)
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync('content/about/image/people/'+photo.file)).digest('hex'),photo.sha256,`Exact portrait bytes: ${id}`)
}
const people=readPeople();assert.equal(new Set(people.map(p=>p.id)).size,people.length)
assert.deepEqual(people.map(p=>p.id).sort(),[...frozen.identities.map(p=>p.id),'li-xiang'].sort())
for(const old of frozen.identities){const p=people.find(p=>p.id===old.id);assert.deepEqual({id:p.id,name:p.name,aliases:p.aliases},old)}
const graph=buildRelations({people,pages:readPages('content')});const key=e=>JSON.stringify([e.from,e.to,e.role,e.rule,e.source,e.status,e.confidence]);const current=new Set(graph.edges.map(key))
for(const old of frozen.relations){
 const [from,to,role,rule]=JSON.parse(old)
 const promotion=navigationPromotions.find(item=>item.from===from&&item.to===to)
 const expected=promotion&&role==='mention'&&rule==='unique-name-mention'?JSON.stringify([from,to,'link',promotion.rule,from,'confirmed','explicit']):old
 assert.ok(current.has(expected),`Preserve every d594 relation or its explicit-navigation promotion: ${old}`)
}
assert.equal(graph.edges.filter(e=>e.to==='/wiki/people/li-xiang'&&e.role==='speaker'&&e.rule==='agenda-speaker-column').length,14)
const boundary=JSON.parse(fs.readFileSync('scripts/offline/release-boundary.json'))
assert.deepEqual(boundary.routes,[...frozen.boundary.routes,'/wiki/people/li-xiang','/wiki/people/naziguli-slam'].sort())
assert.deepEqual(boundary.sourceFiles,[...frozen.boundary.sourceFiles,'/source/content/about/image/people/li-xiang.jpg','/source/content/about/image/people/liu-kai-personal-introduction-pptx.jpeg','/source/content/about/image/people/naziguli-slam-xbmu.jpg'].sort())
assert.deepEqual(boundary.unlisted,frozen.boundary.unlisted)
assert.equal(boundary.notice,frozen.boundary.notice)
for(const file of ['dist/index.html','dist/about/team.html']) assert.ok(fs.readFileSync(file,'utf8').includes('/wiki/people/li-xiang'),`Visible entry: ${file}`)
assert.ok(fs.readFileSync('dist/wiki/people/li-xiang.html','utf8').includes('照片来源'))
console.log('PASS Li Xiang layer: preserve all d594 8 profiles/16 identities/662 relations/7 historical portrait hashes; verify Liu Kai and Li Xiang portrait additions, one new identity/page and 14 agenda backlinks; 5 precise release-boundary additions; 12 unlisted unchanged.')
