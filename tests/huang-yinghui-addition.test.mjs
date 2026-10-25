import { beforeMentorWithdrawal, isWithdrawnRelation } from './fixtures/withdrawn-mentor-contract.mjs'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import {readPeople,readPages,buildRelations} from '../.vitepress/relations/index.mjs'
const old=JSON.parse(fs.readFileSync('tests/fixtures/huang-yinghui-baseline.json'))
const profiles=JSON.parse(fs.readFileSync('data/people-profiles.json'))
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex')
assert.deepEqual(profiles.map(p=>p.id).sort(),[...Object.keys(old.profiles),'huang-yinghui'].sort())
for(const [id,sha] of Object.entries(old.profiles)) assert.equal(hash(beforeMentorWithdrawal(profiles.find(p=>p.id===id))),sha,`Preserve complete v6 profile: ${id}`)
const people=readPeople();assert.deepEqual(people.filter(p=>!['wang-tao','qi-haibin'].includes(p.id)).map(p=>p.id).sort(),[...old.people.map(p=>p.id),'huang-yinghui'].sort())
for(const prior of old.people){const p=people.find(p=>p.id===prior.id);assert.deepEqual({id:p.id,name:p.name,aliases:p.aliases},prior)}
const edges=buildRelations({people,pages:readPages('content')}).edges
const key=e=>JSON.stringify([e.from,e.to,e.role,e.rule,e.source,e.status,e.confidence]);const now=new Set(edges.map(key))
for(const e of old.relations) if(!isWithdrawnRelation(key(e),now)) assert.ok(now.has(key(e)),`Preserve v6 relation: ${key(e)}`)
const p=profiles.find(p=>p.id==='huang-yinghui');assert.equal(p.name,'黄英辉');assert.deepEqual(p.aliases,[])
assert.equal(p.portrait.sourceUrl,'https://psych.ccnu.edu.cn/info/1059/6871.htm')
assert.equal(p.portrait.sha256,'19449e697ed1c7f20093cf003d6ba3569cf69afda154800142a13789f0cb250e')
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('content/about/image/people/'+p.portrait.file)).digest('hex'),p.portrait.sha256)
assert.match(p.portrait.rights,/不主张已获额外授权/)
assert.match(p.limitations,/公开不等于开放授权/)
const boundary=JSON.parse(fs.readFileSync('scripts/offline/release-boundary.json'))
assert.deepEqual(boundary.routes,[...old.boundary.routes,'/wiki/people/huang-yinghui','/wiki/people/wang-tao','/wiki/people/qi-haibin'].sort())
assert.deepEqual(boundary.sourceFiles,[...old.boundary.sourceFiles,'/source/content/about/image/people/huang-yinghui-ccnu.png'].sort())
assert.deepEqual(boundary.unlisted,old.boundary.unlisted);assert.equal(boundary.notice,old.boundary.notice)
assert.match(fs.readFileSync('dist/wiki/people/huang-yinghui.html','utf8'),/照片来源/)
console.log('PASS Huang addition: all 9 v6 profiles (one precise withdrawal), 17 IDs and non-withdrawn historical relations retained; one independently sourced portrait/profile, exactly two release-boundary additions')
