import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { parse } from 'parse5'
const profiles=JSON.parse(fs.readFileSync('data/people-profiles.json','utf8'))
assert.deepEqual(profiles.map(p=>p.name),['王培','胡祥恩','徐英瑾','魏屹东','桑新民','王伟军','那孜古力·斯拉木','刘凯','李祥'])
const attrs=n=>Object.fromEntries((n.attrs||[]).map(x=>[x.name,x.value]))
const all=(n,fn)=>[...(fn(n)?[n]:[]),...(n.childNodes||[]).flatMap(c=>all(c,fn))]
const cls=(n,name)=>(attrs(n).class||'').split(' ').includes(name)
const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('')
const home=parse(fs.readFileSync('dist/index.html','utf8')), detail=parse(fs.readFileSync('dist/about/people.html','utf8'))
const team=parse(fs.readFileSync('dist/about/team.html','utf8')), contactTeam=parse(fs.readFileSync('dist/contact/team.html','utf8'))
const peopleIndex=parse(fs.readFileSync('dist/wiki/people/index.html','utf8'))
const cards=all(home,n=>cls(n,'person-featured')), rows=all(detail,n=>cls(n,'full-person'))
const hrefs=(doc,route='/')=>new Set(all(doc,n=>n.tagName==='a').map(n=>attrs(n).href).filter(Boolean).map(href=>new URL(href,'https://site.invalid'+route).pathname))
assert.equal(cards.length,6);assert.equal(rows.length,profiles.length)
assert.equal(all(home,n=>cls(n,'person-monogram')).length,0)
assert.equal(all(home,n=>cls(n,'person-photo-unavailable')).length,0)
const indexLinks=hrefs(peopleIndex,'/wiki/people/')
for(const p of profiles) assert.ok(indexLinks.has('/wiki/people/'+p.id),`Independent people index entry: ${p.id}`)
for(const id of ['wang-pei','hu-xiangen','xu-yingjin','wei-yidong','sang-xinmin','wang-weijun','liu-kai','li-xiang','naziguli-slam','jia-min','wu-yuxi','yang-yaya']) assert.ok(hrefs(team,'/about/team').has('/wiki/people/'+id),`Association member page direct profile link: ${id}`)
for(const id of ['wang-pei','liu-kai','xu-yingjin','naziguli-slam','wei-yidong','li-xiang']) assert.ok(hrefs(contactTeam,'/contact/team').has('/wiki/people/'+id),`Research team page direct profile link: ${id}`)
assert.ok(hrefs(home).has('/wiki/people/'),'Homepage navigation exposes the people index')
assert.ok(hrefs(home).has('/wiki/people/naziguli-slam'),'The 那迪 alias resolves to the existing profile ID')
const teamSource=fs.readFileSync('content/about/team.md','utf8')
for(const anchor of ['[[#王培]]','[[#徐英瑾]]','[[#魏屹东]]','[[#刘凯]]','[[#李祥]]','[[#那孜古力·斯拉木(那迪)|那迪]]']) assert.ok(teamSource.includes(anchor),`Preserve legacy member anchor: ${anchor}`)
let facts=0,photos=0
const nady=profiles.find(p=>p.id==='naziguli-slam')
const liu=profiles.find(p=>p.id==='liu-kai')
assert.deepEqual(nady.aliases,['那迪'])
assert.equal(nady.sources.filter(s=>s.kind==='user-provided').length,1)
assert.ok(!nady.sources.find(s=>s.kind==='user-provided').url)
assert.ok(nady.identityBoundary.includes('那迪'))
assert.ok(!liu.portrait,'Do not reuse the unverified embedded PPT photo')
assert.match(liu.limitations,/未找到可核验的本人提供或高校官方照片来源/)
const nadyRow=rows.find(row=>text(row).includes('那孜古力·斯拉木'))
assert.ok(nadyRow)
assert.ok(text(nadyRow).includes('秘书组'))
assert.ok(!/D:\\|H:\\|身份证|电话|出生/.test(JSON.stringify(nady)))
assert.ok(fs.readFileSync('content/about/team.md','utf8').includes('[[../wiki/people/naziguli-slam|'))
for(const [i,p] of profiles.entries()){
 if(cards[i])assert.equal(text(cards[i]).split(p.name).length-1,1);else assert.ok(['naziguli-slam','liu-kai','li-xiang'].includes(p.id))
 assert.ok(text(rows[i]).includes(p.summary));if(cards[i])assert.ok(text(cards[i]).includes(p.summary))
 const ids=new Set(p.sources.map(s=>s.id))
 assert.equal(ids.size,p.sources.length)
 for(const section of p.sections) for(const item of section.items){
  assert.ok(item.text&&item.sources.length)
  for(const id of item.sources){assert.ok(ids.has(id));assert.ok(all(rows[i],n=>attrs(n).id===`${p.id}-source-${id}`).length===1)}
  facts++
 }
 for(const s of p.sources){if(s.url)assert.ok(s.url.startsWith('https://')||s.url.startsWith('/'));else assert.equal(s.kind,'user-provided');assert.match(s.observedOn,/^\d{4}-\d{2}-\d{2}$/)}
 if(p.name==='王伟军'){assert.ok(p.identityBoundary);assert.ok(!JSON.stringify(p).includes('psych.ccnu.edu.cn'))}
 if(p.portrait){
  photos++
  const asset=fs.readFileSync('content/about/image/people/'+p.portrait.file)
  assert.equal(crypto.createHash('sha256').update(asset).digest('hex'),p.portrait.sha256)
  assert.equal(all(rows[i],n=>n.tagName==='img').length,1)
  if(cards[i])assert.equal(all(cards[i],n=>n.tagName==='img').length,1)
  assert.ok(p.portrait.rights)
 }else{
  assert.ok(['王伟军','刘凯'].includes(p.name));assert.ok(p.identityBoundary);assert.equal(all(rows[i],n=>n.tagName==='img').length,0);if(cards[i])assert.equal(all(cards[i],n=>n.tagName==='img').length,0)
  assert.ok(!JSON.stringify(p).includes('psych.ccnu.edu.cn'))
 }
}
await import('./profile-additions.test.mjs')
assert.equal(photos,8,'Seven preserved portraits plus the reviewed Li Xiang portrait')
assert.ok(profiles.find(p=>p.name==='桑新民').affiliation.includes('荣休'))
assert.ok(profiles.find(p=>p.name==='王培').affiliation.includes('Associate Professor of Instruction'))
assert.ok(text(home).includes('照片版权归原权利人'))
assert.ok(text(detail).includes('不适用本站文字的 CC BY-SA 许可'))
const raw=fs.readFileSync('data/people-profiles.json','utf8')
assert.ok(!raw.includes('/workspace/'));assert.ok(!raw.includes('private'))
console.log('PASS people: '+cards.length+' homepage feature cards; '+profiles.length+' full profile details; '+photos+' source-backed portraits; '+facts+' individually sourced facts; unique card names, identity boundary and photo-rights checks.')
