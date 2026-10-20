import assert from 'node:assert/strict'
import fs from 'node:fs'
import { parse } from 'parse5'
const attrs = n => Object.fromEntries((n.attrs || []).map(a => [a.name,a.value]))
const all = (n, pred) => [...(pred(n) ? [n] : []), ...(n.childNodes || []).flatMap(c => all(c,pred))]
const home = parse(fs.readFileSync('dist/index.html','utf8'))
const profiles = JSON.parse(fs.readFileSync('data/people-profiles.json','utf8'))
const hasClass = (n,c) => (attrs(n).class || '').split(' ').includes(c)
const secretaries = all(home,n => hasClass(n,'person-secretary'))
assert.equal(secretaries.length,4,'Do not change the source secretariat roster')
for (const id of ['liu-kai','li-xiang','naziguli-slam','huang-yinghui']) {
  const card = secretaries.find(n => attrs(n)['data-person-id'] === id)
  assert.ok(card, id)
  const images = all(card,n => n.tagName === 'img')
  assert.equal(images.length,1,`${id}: one real portrait`)
  const src = attrs(images[0]).src
  const page = parse(fs.readFileSync(`dist/wiki/people/${id}.html`,'utf8'))
  assert.ok(all(page,n => n.tagName === 'img' && attrs(n).src === src).length,`${id}: same asset on individual page`)
  const imageLink = all(card,n => hasClass(n,'secretary-portrait'))[0]
  assert.equal(attrs(imageLink).href,`/wiki/people/${id}`)
  assert.ok(attrs(imageLink)['aria-label'].includes('来源'))
  const profile = profiles.find(p => p.id === id)
  assert.ok(profile.portrait.sourceUrl && profile.portrait.rights)
}
assert.equal(all(home,n=>hasClass(n,'secretary-portrait')).length,4,'All four secretary portraits require independently verified identity and source')
console.log('PASS: 4 secretariat members retained; 4 shared homepage/individual-page portraits and direct links verified')
for(const id of ['wang-pei','hu-xiangen']) {
 const card=all(home,n=>hasClass(n,'person-featured')).find(n=>all(n,c=>c.tagName==='a'&&attrs(c).href===`/wiki/people/${id}`).length)
 assert.ok(card,`Founder homepage card: ${id}`)
 const photo=all(card,n=>n.tagName==='img');assert.equal(photo.length,1)
 const page=parse(fs.readFileSync(`dist/wiki/people/${id}.html`,'utf8'))
 assert.ok(all(page,n=>n.tagName==='img'&&attrs(n).src===attrs(photo[0]).src).length,`Founder shared portrait: ${id}`)
 assert.equal(attrs(all(card,n=>hasClass(n,'person-portrait'))[0]).href,`/wiki/people/${id}`)
}
const component=fs.readFileSync('.vitepress/theme/components/PeopleDirectory.vue','utf8')
assert.match(component,/overflow-wrap:anywhere/)
assert.match(component,/@media\(max-width:360px\)/)
assert.match(component,/flex-basis:64px/)
console.log('PASS founder shared-photo/direct-link checks and static narrow-screen wrap contract (not a browser layout test)')
