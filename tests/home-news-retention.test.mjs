import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'parse5'
const baseline = process.env.BASELINE_DIST
const deployed = process.env.DEPLOYED_DIST || baseline
assert.ok(baseline, 'Set BASELINE_DIST to the original a92951d built dist')
const root = path.resolve(import.meta.dirname, '..')
const manifest = JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/preview-content-baseline.json')))
const attrs = n => Object.fromEntries((n.attrs||[]).map(a=>[a.name,a.value]))
const hasClass = (n, c) => (attrs(n).class||'').split(' ').includes(c)
function all(n, fn, output=[]) { if(fn(n)) output.push(n); for(const c of n.childNodes||[]) all(c,fn,output); return output }
function text(n) { return n.nodeName === '#text' ? n.value : (n.childNodes||[]).map(text).join('') }
const norm = n => text(n).replace(/\s+/g,' ').trim()
const read = p => parse(fs.readFileSync(p,'utf8'))
let unchanged=0
for(const file of manifest.files.filter(f=>f.path.startsWith('content/')&&f.path.endsWith('.md')&&f.path!=='content/index.md')) {
 const relative=file.path.slice(8).replace(/\.md$/,'.html')
 const before=all(read(path.join(baseline,relative)),n=>hasClass(n,'vp-doc')).map(norm)
 const after=all(read(path.join(root,'dist',relative)),n=>hasClass(n,'vp-doc')).map(norm)
 assert.deepEqual(after,before,`Original document text changed: ${relative}`)
 const links = doc => all(doc,n=>hasClass(n,'vp-doc')).flatMap(n=>all(n,c=>c.tagName==='a').map(c=>({text:norm(c),href:attrs(c).href})))
 assert.deepEqual(links(read(path.join(root,'dist',relative))),links(read(path.join(deployed,relative))),`Original document link targets changed: ${relative}`)
 unchanged++
}
const oldHome=read(path.join(baseline,'index.html')), home=read(path.join(root,'dist/index.html'))
const oldSections=all(oldHome,n=>hasClass(n,'section')),sections=all(home,n=>hasClass(n,'section'))
assert.equal(sections.length,oldSections.length)
let retained=0
oldSections.forEach((section,i)=>{
 if(all(section,n=>hasClass(n,'team-grid')).length){
  const bios=all(section,n=>hasClass(n,'team-member')).map(norm)
  const rendered=all(home,n=>hasClass(n,'person-original-bio')).map(norm)
  assert.equal(rendered.length,6)
  for(const bio of bios) assert.ok(rendered.includes(bio),`Missing original bio: ${bio}`)
 }else{assert.equal(norm(sections[i]),norm(section),`Original homepage section ${i} changed`);retained++}
})
for(const section of oldSections) for(const link of all(section,n=>n.tagName==='a')) assert.ok(all(home,n=>n.tagName==='a'&&attrs(n).href===attrs(link).href).length,`Original homepage link missing: ${attrs(link).href}`)
const featured=all(home,n=>hasClass(n,'person-featured'))
assert.equal(featured.length,6)
assert.deepEqual(featured.map(n=>all(n,x=>hasClass(x,'person-meta')).map(norm)[0].split(' ')[0]),['创办人学术主页（新窗口）','创办人学术主页（新窗口）','专家组学术主页（新窗口）','专家组学术主页（新窗口）','专家组学术主页（新窗口）','专家组成员资料'])
assert.equal(all(home,n=>hasClass(n,'person-secretary')).length,4)
assert.equal(all(home,n=>hasClass(n,'people-members')).flatMap(n=>all(n,c=>c.tagName==='li')).length,25)
assert.equal(all(home,n=>hasClass(n,'research-entry')).length,0)
const news=read(path.join(root,'dist/news.html'))
assert.equal(all(news,n=>hasClass(n,'research-entry')).length,5)
console.log(`PASS ${unchanged} non-home original pages retain exact rendered body text and deployed link targets; ${retained} unchanged home sections; six exact biographies relocated once; original home links retained; 6 featured + 4 secretary + 25 member records; news route has full five-entry feed, home has none.`)
