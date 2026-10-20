import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { parse } from 'parse5'
const profiles=JSON.parse(fs.readFileSync('data/people-profiles.json','utf8'))
assert.deepEqual(profiles.map(p=>p.name),['王培','胡祥恩','徐英瑾','魏屹东','桑新民','王伟军','那孜古力·斯拉木'])
const attrs=n=>Object.fromEntries((n.attrs||[]).map(x=>[x.name,x.value]))
const all=(n,fn)=>[...(fn(n)?[n]:[]),...(n.childNodes||[]).flatMap(c=>all(c,fn))]
const cls=(n,name)=>(attrs(n).class||'').split(' ').includes(name)
const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('')
const home=parse(fs.readFileSync('dist/index.html','utf8')), detail=parse(fs.readFileSync('dist/about/people.html','utf8'))
const cards=all(home,n=>cls(n,'person-featured')), rows=all(detail,n=>cls(n,'full-person'))
assert.equal(cards.length,6);assert.equal(rows.length,profiles.length)
assert.equal(all(home,n=>cls(n,'person-monogram')).length,0)
assert.equal(all(home,n=>cls(n,'person-photo-unavailable')).length,0)
let facts=0,photos=0
const nady=profiles.find(p=>p.id==='naziguli-slam')
assert.deepEqual(nady.aliases,['那迪'])
assert.equal(nady.sources.filter(s=>s.kind==='user-provided').length,1)
assert.ok(!nady.sources.find(s=>s.kind==='user-provided').url)
assert.ok(nady.identityBoundary.includes('那迪'))
const nadyRow=rows.find(row=>text(row).includes('那孜古力·斯拉木'))
assert.ok(nadyRow)
assert.ok(text(nadyRow).includes('秘书组'))
assert.ok(!/D:\\|H:\\|身份证|电话|出生/.test(JSON.stringify(nady)))
assert.ok(fs.readFileSync('content/about/team.md','utf8').includes('[[../wiki/people/naziguli-slam|'))
for(const [i,p] of profiles.entries()){
 if(cards[i])assert.equal(text(cards[i]).split(p.name).length-1,1);else assert.equal(p.id,'naziguli-slam')
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
  assert.equal(p.name,'王伟军');assert.ok(p.identityBoundary);assert.equal(all(rows[i],n=>n.tagName==='img').length,0);if(cards[i])assert.equal(all(cards[i],n=>n.tagName==='img').length,0)
  assert.ok(!JSON.stringify(p).includes('psych.ccnu.edu.cn'))
 }
}
assert.equal(photos,profiles.filter(p=>p.portrait).length)
assert.ok(profiles.find(p=>p.name==='桑新民').affiliation.includes('荣休'))
assert.ok(profiles.find(p=>p.name==='王培').affiliation.includes('Associate Professor of Instruction'))
assert.ok(text(home).includes('照片版权归原权利人'))
assert.ok(text(detail).includes('不适用本站文字的 CC BY-SA 许可'))
const raw=fs.readFileSync('data/people-profiles.json','utf8')
assert.ok(!raw.includes('/workspace/'));assert.ok(!raw.includes('private'))
console.log('PASS people: '+cards.length+' homepage feature cards; '+profiles.length+' full profile details; '+photos+' source-backed portraits; '+facts+' individually sourced facts; unique card names, identity boundary and photo-rights checks.')
