import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
execFileSync(process.execPath, ['tests/learning-content-retention.test.mjs'], { stdio: 'inherit' })
const editorial = new Set(['content/index.md','content/wiki/index.md','content/research/nars/theory/learning_resources.md','content/contact/index.md','content/about/team.md','content/conference/index.md','content/projects/nars_impl/introduction.md','content/projects/nars_derivatives/index.md','content/contact/documents_and_qq_group.md','content/about/index.md','content/projects/nars_impl/index.md','content/contact/contributing/formats.md'])
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
for(const file of manifest.files.filter(f=>f.path.startsWith('content/')&&f.path.endsWith('.md')&&!editorial.has(f.path))) {
 const relative=file.path.slice(8).replace(/\.md$/,'.html')
 const before=all(read(path.join(baseline,relative)),n=>hasClass(n,'vp-doc')).map(norm)
 const after=all(read(path.join(root,'dist',relative)),n=>hasClass(n,'vp-doc')).map(norm)
 assert.deepEqual(after,before,`Original document text changed: ${relative}`)
 const links = doc => all(doc,n=>hasClass(n,'vp-doc')).flatMap(n=>all(n,c=>c.tagName==='a').map(c=>({text:norm(c),href:attrs(c).href})))
 assert.deepEqual(links(read(path.join(root,'dist',relative))),links(read(path.join(deployed,relative))),`Original document link targets changed: ${relative}`)
 unchanged++
}
const oldHome=read(path.join(baseline,'index.html')), home=read(path.join(root,'dist/index.html'))
const archived=read(path.join(root,'dist/about/home-archive.html'))
const oldSections=all(oldHome,n=>hasClass(n,'section')),sections=all(archived,n=>hasClass(n,'section'))
assert.equal(sections.length,oldSections.length)
let retained=0
oldSections.forEach((section,i)=>{
 if(all(section,n=>hasClass(n,'team-grid')).length){
  const bios=all(section,n=>hasClass(n,'team-member')).map(norm)
  const rendered=all(archived,n=>hasClass(n,'team-member')).map(norm)
  assert.equal(rendered.length,6)
  for(const bio of bios) assert.ok(rendered.includes(bio),`Missing original bio: ${bio}`)
 }else{assert.equal(norm(sections[i]),norm(section),`Original homepage section ${i} changed`);retained++}
})
for(const section of oldSections) for(const link of all(section,n=>n.tagName==='a')) assert.ok(all(archived,n=>n.tagName==='a'&&(attrs(link).href?.startsWith('#') ? attrs(n).href===attrs(link).href : new URL(attrs(n).href || '', 'https://wiki.example/about/home-archive').href===new URL(attrs(link).href || '', 'https://wiki.example/').href)).length,`Original homepage link missing: ${attrs(link).href}`)
const featured=all(home,n=>hasClass(n,'person-featured'))
assert.equal(featured.length,6)
assert.deepEqual(featured.map(n=>all(n,x=>hasClass(x,'person-meta')).map(norm)[0].split(' ')[0]),['创办人','创办人','专家组','专家组','专家组','专家组'])
assert.equal(all(home,n=>hasClass(n,'person-secretary')).length,4)
assert.equal(all(home,n=>hasClass(n,'people-members')).flatMap(n=>all(n,c=>c.tagName==='li')).length,25)
assert.equal(all(home,n=>hasClass(n,'research-entry')).length,0)
const news=read(path.join(root,'dist/news.html'))
assert.equal(all(news,n=>hasClass(n,'research-entry')).length,5)
console.log(`PASS ${unchanged} non-home original pages retain exact rendered body text and deployed link targets; ${retained} exact archived home sections; six exact historical biographies archived; six updated profile cards; original home links archived; 6 featured + 4 secretary + 25 member records; news route has full five-entry feed, home has none.`)
