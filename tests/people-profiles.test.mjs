import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { parse } from 'parse5'
const profiles=JSON.parse(fs.readFileSync('data/people-profiles.json','utf8'))
assert.deepEqual(profiles.map(p=>p.name),['王培','胡祥恩','徐英瑾','魏屹东','桑新民','王伟军'])
const attrs=n=>Object.fromEntries((n.attrs||[]).map(x=>[x.name,x.value]))
const all=(n,fn)=>[...(fn(n)?[n]:[]),...(n.childNodes||[]).flatMap(c=>all(c,fn))]
const cls=(n,name)=>(attrs(n).class||'').split(' ').includes(name)
const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('')
const home=parse(fs.readFileSync('dist/index.html','utf8')), detail=parse(fs.readFileSync('dist/about/people.html','utf8'))
const cards=all(home,n=>cls(n,'person-featured')), rows=all(detail,n=>cls(n,'full-person'))
assert.equal(cards.length,6);assert.equal(rows.length,6)
assert.equal(all(home,n=>cls(n,'person-monogram')).length,0)
assert.equal(all(home,n=>cls(n,'person-photo-unavailable')).length,0)
let facts=0,photos=0
for(const [i,p] of profiles.entries()){
 assert.equal(text(cards[i]).split(p.name).length-1,1,`Repeated visible name: ${p.name}`)
 assert.ok(text(rows[i]).includes(p.summary));assert.ok(text(cards[i]).includes(p.summary))
 const ids=new Set(p.sources.map(s=>s.id))
 assert.equal(ids.size,p.sources.length)
 for(const section of p.sections) for(const item of section.items){
  assert.ok(item.text&&item.sources.length)
  for(const id of item.sources){assert.ok(ids.has(id));assert.ok(all(rows[i],n=>attrs(n).id===`${p.id}-source-${id}`).length===1)}
  facts++
 }
 for(const s of p.sources){assert.ok(s.url.startsWith('https://')||s.url.startsWith('/'));assert.match(s.observedOn,/^2026-10-19$/)}
 if(p.portrait){
  photos++
  const asset=fs.readFileSync('content/about/image/people/'+p.portrait.file)
  assert.equal(crypto.createHash('sha256').update(asset).digest('hex'),p.portrait.sha256)
  assert.equal(all(cards[i],n=>n.tagName==='img').length,1)
  assert.ok(p.portrait.rights)
 }else{
  assert.equal(p.name,'王伟军');assert.ok(p.identityBoundary);assert.equal(all(cards[i],n=>n.tagName==='img').length,0)
  assert.ok(!JSON.stringify(p).includes('psych.ccnu.edu.cn'))
 }
}
assert.equal(photos,5)
assert.ok(profiles.find(p=>p.name==='桑新民').affiliation.includes('荣休'))
assert.ok(profiles.find(p=>p.name==='王培').affiliation.includes('Associate Professor of Instruction'))
assert.ok(text(home).includes('照片版权归原权利人'))
assert.ok(text(detail).includes('不适用本站文字的 CC BY-SA 许可'))
const raw=fs.readFileSync('data/people-profiles.json','utf8')
assert.ok(!raw.includes('/workspace/'));assert.ok(!raw.includes('private'))
console.log(`PASS people: 6 same-source cards/details; ${photos} exact-source real photo assets; ${facts} individually sourced facts; no repeated card names, dummy portraits or unconfirmed identity merges; chronology and photo-rights boundaries.`)
