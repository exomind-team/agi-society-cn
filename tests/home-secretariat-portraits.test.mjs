import assert from 'node:assert/strict'
import fs from 'node:fs'
import { parse } from 'parse5'
const attrs = n => Object.fromEntries((n.attrs || []).map(a => [a.name,a.value]))
const all = (n, pred) => [...(pred(n) ? [n] : []), ...(n.childNodes || []).flatMap(c => all(c,pred))]
const home = parse(fs.readFileSync('dist/index.html','utf8'))
const peoplePage = parse(fs.readFileSync('dist/about/people.html','utf8'))
const profiles = JSON.parse(fs.readFileSync('data/people-profiles.json','utf8'))
const hasClass = (n,c) => (attrs(n).class || '').split(' ').includes(c)
const normalizeRoute = value => new URL(value,'https://site.invalid/').pathname.replace(/^\/agi-society-cn(?=\/|$)/,'') || '/'
assert.equal(all(home,n=>hasClass(n,'person-featured')).length,0,'The homepage links to the association roster instead of repeating the directory')
assert.equal(all(home,n=>hasClass(n,'person-secretary')).length,0)
assert.equal(all(home,n=>hasClass(n,'home-members')).length,1)
const rosterLink = all(home,n=>n.tagName==='a'&&n.childNodes?.some(c=>c.nodeName==='#text'&&c.value.includes('更多协会成员')))[0]
assert.ok(rosterLink)
assert.equal(normalizeRoute(attrs(rosterLink).href),'/contact/team')
const fullProfiles = all(peoplePage,n=>hasClass(n,'full-person'))
assert.equal(fullProfiles.length,profiles.length,'All person profiles remain available on the separate people page')
for (const id of ['liu-kai','li-xiang','naziguli-slam','huang-yinghui']) {
  const profile = profiles.find(person=>person.id===id)
  assert.ok(profile?.portrait?.sourceUrl&&profile.portrait.rights,id+': photo source and rights retained')
  const row = fullProfiles.find(person=>all(person,n=>n.tagName==='h2'&&attrs(n).id===id).length)
  assert.ok(row,id)
  const images=all(row,n=>n.tagName==='img')
  assert.equal(images.length,1,id+': one source-backed portrait on the people page')
  const detail=parse(fs.readFileSync('dist/wiki/people/'+id+'.html','utf8'))
  assert.ok(all(detail,n=>n.tagName==='img'&&attrs(n).src===attrs(images[0]).src).length,id+': same portrait asset on individual page')
}
console.log('PASS: homepage member display is a single roster link; all 4 secretary profiles and source-backed portraits remain on the people and individual pages.')
