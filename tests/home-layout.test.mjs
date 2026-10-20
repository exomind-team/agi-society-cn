// Source + built HTML contract, not real-browser geometry or interaction evidence.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { parse } from 'parse5'
import postcss from 'postcss'
import { parse as parseSfc, compileTemplate } from '@vue/compiler-sfc'
import contract from './fixtures/home-layout-contract.json' with { type: 'json' }
import { beforeHomeLayout } from './fixtures/home-layout-scope.mjs'
const lf = value => value.replace(/\r\n/g, '\n')
const read = file => contract.files[file] ? lf(fs.readFileSync(file, 'utf8')) : fs.readFileSync(file, 'utf8')
const sha = value => crypto.createHash('sha256').update(value).digest('hex')
const original = file => execFileSync('git', ['show', `${contract.baseline}:${file}`], { maxBuffer:64*1024*1024 })
assert.deepEqual(Object.keys(contract.files).sort(), [
  '.vitepress/theme/components/ResearchHome.vue',
  '.vitepress/theme/index.ts',
  '.vitepress/theme/styles/research-preview.css',
  'content/index.md',
].sort(), 'The CRLF-compatible exception covers exactly four reviewed text files')
let newlineSamples = 0, rejectedSamples = 0
for (const [file, hashes] of Object.entries(contract.files)) {
  const baseline = original(file), current = fs.readFileSync(file)
  assert.equal(sha(Buffer.from(lf(baseline.toString('latin1')), 'latin1')), hashes.before)
  // Hash UTF-8 file bytes, with CRLF as the sole byte-level normalization.
  assert.equal(sha(Buffer.from(lf(current.toString('latin1')), 'latin1')), hashes.after)
  for (const newline of ['\n', '\r\n']) {
    const beforeSample = Buffer.from(lf(baseline.toString('latin1')).replace(/\n/g, newline), 'latin1')
    assert.equal(sha(Buffer.from(lf(beforeSample.toString('latin1')), 'latin1')), hashes.before)
    const sample = Buffer.from(lf(current.toString('latin1')).replace(/\n/g, newline), 'latin1')
    assert.ok(baseline.equals(beforeHomeLayout(file, sample)), `Return original baseline bytes: ${file}`)
    assert.equal(beforeHomeLayout(file, sample.toString()), baseline.toString())
    newlineSamples += 2
    for (const altered of [
      Buffer.from(sample.toString('utf8').replace(/[A-Za-z]/, char => char === 'X' ? 'Y' : 'X')),
      Buffer.concat([sample, Buffer.from(' ')]),
      Buffer.concat([sample, Buffer.from('\r')]),
    ]) {
      assert.throws(() => beforeHomeLayout(file, altered), /Unknown homepage-layout modification/)
      assert.throws(() => beforeHomeLayout(file, altered.toString()), /Unknown homepage-layout modification/)
      rejectedSamples += 2
    }
  }
}
const outsideSample = Buffer.from('unchanged\r\ntext \r')
assert.strictEqual(beforeHomeLayout('content/not-a-home-exception.md', outsideSample), outsideSample, 'Unknown paths remain untouched')
assert.equal(beforeHomeLayout('content/not-a-home-exception.md', outsideSample.toString()), outsideSample.toString())
console.log(`PASS homepage newline contract: ${newlineSamples} LF/CRLF buffer/string cases; ${rejectedSamples} character/space/bare-CR tampering cases rejected; unknown paths untouched.`)
const files = execFileSync('git', ['ls-tree','-r','--name-only','-z', contract.baseline], {encoding:'utf8'}).split('\0').filter(Boolean)
  .filter(file => /^(content|data|\.vitepress|docs)\//.test(file))
let unchanged=0
for (const file of files.filter(file=>!contract.files[file])) {
  assert.ok(fs.existsSync(file), `Deleted source: ${file}`)
  assert.ok(original(file).equals(fs.readFileSync(file)), `Non-home source changed: ${file}`)
  unchanged++
}
const body = source => lf(source).replace(/^---\n[\s\S]*?\n---\n/, '').replace(/<\/?ResearchHome>\n?/g, '').replace(/<template #footer>\n?|<\/template>\n?/g, '').trim()
assert.equal(body(read('content/index.md')).replace(/\n{3,}/g,'\n\n'), body(original('content/index.md').toString()).replace(/\n{3,}/g,'\n\n'), 'All homepage body text, Markdown links and order survive')
assert.ok(read('content/index.md').startsWith('---\nlayout: home\nsidebar: false\nmarkdownStyles: false\n'))
const component = parseSfc(read('.vitepress/theme/components/ResearchHome.vue')).descriptor
assert.equal((component.template.content.match(/<Content\b/g)||[]).length, 0, 'VitePress renders Content once; the home shell only renders slots')
assert.equal((read('content/index.md').match(/<ResearchHome>/g)||[]).length, 1)
assert.equal((component.template.content.match(/<slot \/>/g)||[]).length, 1)
assert.equal((component.template.content.match(/<slot name="footer" \/>/g)||[]).length, 1)
assert.equal((component.template.content.match(/<main\b/g)||[]).length, 1)
assert.equal((component.template.content.match(/<footer\b/g)||[]).length, 1)
assert.ok(!component.template.content.includes('<ResearchHome'), 'Content must not render itself recursively')
assert.ok(!read('.vitepress/theme/index.ts').includes("'home-hero-before'"))
assert.ok(read('.vitepress/theme/index.ts').includes('extends: DefaultTheme'))
assert.ok(read('.vitepress/theme/index.ts').includes("'doc-before': () => [h(PreviewContext), h(ConferenceCoverage)]"))
assert.deepEqual(compileTemplate({source:component.template.content,filename:'ResearchHome.vue',id:'home-layout-test'}).errors, [])
const css=read('.vitepress/theme/styles/research-preview.css'), oldCss=lf(original('.vitepress/theme/styles/research-preview.css').toString())
assert.ok(css.startsWith(oldCss), 'All pre-existing document rules remain byte-identical')
postcss.parse(css.slice(oldCss.length)).walkRules(rule => { for (const selector of rule.selectors) assert.ok(selector.trim().startsWith('.association-home'), `Unscoped new rule: ${selector}`) })
assert.ok(css.includes('@media(max-width:800px)'))
assert.ok(css.includes('.research-layout{grid-template-columns:1fr}'))
assert.ok(css.includes(':focus-visible'))
const attrs=n=>Object.fromEntries((n.attrs||[]).map(a=>[a.name,a.value]))
const all=(n,p)=>[...(p(n)?[n]:[]),...(n.childNodes||[]).flatMap(c=>all(c,p))]
const has=(n,c)=>(attrs(n).class||'').split(' ').includes(c)
const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('')
const norm=n=>text(n).replace(/\s+/g,' ').trim()
const home=parse(read('dist/index.html'))
const mains=all(home,n=>n.tagName==='main'), footers=all(home,n=>n.tagName==='footer')
assert.equal(mains.length,1); assert.equal(footers.length,1)
const main=mains[0], fullBody=all(main,n=>has(n,'home-body'))
assert.equal(fullBody.length,1); assert.equal(all(main,n=>has(n,'association-intro')).length,1)
assert.equal(all(main,n=>has(n,'section')).length,5)
assert.equal(all(home,n=>has(n,'research-rail')).length,1)
const flow=all(home,n=>n.tagName)
assert.ok(flow.indexOf(footers[0]) > flow.indexOf(all(main,n=>has(n,'home-participate'))[0]), 'Footer must follow every body section')
assert.ok(!all(footers[0],n=>n.tagName==='main').length)
assert.equal(all(home,n=>has(n,'person-featured')).length,6)
assert.equal(all(home,n=>has(n,'person-secretary')).length,4)
assert.equal(all(home,n=>has(n,'people-members')).flatMap(n=>all(n,x=>x.tagName==='li')).length,25)
assert.ok(all(home,n=>n.tagName==='details'&&has(n,'people-members')).some(n=>all(n,c=>c.tagName==='summary').length===1),'Native disclosure remains keyboard/no-JS operable')
for(const phrase of ['第三方照片除外','历史首页内容','旧维基入口','关于协会','全部团队成员与学术主页','联系与参与']) assert.ok(norm(footers[0]).includes(phrase))
for(const href of ['/research/agi-pathways','/research/aca','/research/nars/theory/aikr']) assert.ok(all(home,n=>n.tagName==='a'&&attrs(n).href===href).length)
let links=0
for(const node of all(home,n=>n.tagName==='a')) {
 const href=attrs(node).href
 assert.ok(href && !/^javascript:/i.test(href), 'No JS-only home navigation')
 if(!href.startsWith('/')||href.startsWith('//'))continue
 const [raw, fragment]=href.split('#');const rel=decodeURIComponent(raw.split('?')[0]).slice(1)
 const target=[rel,rel+'.html',rel.replace(/\/$/,'')+'/index.html'].map(f=>path.join('dist',f)).find(f=>fs.existsSync(f)&&fs.statSync(f).isFile())
 assert.ok(target,`Missing home link ${href}`)
 if(fragment)assert.ok(all(parse(read(target)),n=>attrs(n).id===decodeURIComponent(fragment)).length,`Missing anchor ${href}`)
 links++
}
for(const route of ['research/nars/theory/aikr.html','wiki/people/li-xiang.html','community.html']) {
 const doc=parse(read('dist/'+route)); assert.ok(all(doc,n=>has(n,'VPDoc')).length, `Default doc layout lost: ${route}`)
 assert.ok(!all(doc,n=>has(n,'association-home')).length, `Homepage shell leaked: ${route}`)
}
if(process.env.BASELINE_OFFLINE){
 const source=read(process.env.BASELINE_OFFLINE)
 const raw=source.match(/<script id="offline-data" type="application\/json">([\s\S]*?)<\/script>/)
 assert.ok(raw,'Expected prior offline-data payload')
 const data=JSON.parse(raw[1]), oldHome=parse(data.pages['/'].html)
 const sections=n=>all(n,c=>has(c,'section')).map(c=>({text:norm(c),links:all(c,a=>a.tagName==='a').map(a=>({text:norm(a),href:attrs(a).href}))}))
 assert.deepEqual(sections(home),sections(oldHome),'Current rendered body sections, people and links must match released v4')
 const rail=n=>norm(all(n,c=>has(c,'research-rail'))[0])
 assert.equal(rail(home),rail(oldHome),'All existing navigation-rail content remains')
 let docs=0
 for(const [route,page] of Object.entries(data.pages)){
  if(route==='/'||page.kind!=='wiki')continue
  const old=parse(page.html), body=all(old,n=>has(n,'vp-doc'))[0]
  if(!body)continue
  const filename=path.join('dist',page.source.replace(/^\//,''));if(!fs.existsSync(filename))continue
  const next=all(parse(read(filename)),n=>has(n,'vp-doc'))[0]
  assert.equal(norm(next),norm(body),`Rendered document text changed: ${route}`);docs++
 }
 console.log(`PASS prior-v4 rendered comparison: 5 homepage sections, all people/links and rail text retained; ${docs} document bodies unchanged.`)
}
console.log(`PASS homepage layout: ${unchanged} non-home sources unchanged; exact 4-file exception; one main, body and final footer; ${links} internal links/anchors; 6+4+25 people; default document layout retained.`)
console.log('Evidence: source, CSS contracts and SSR HTML. No real browser/phone geometry, focus movement, screen reader or offline no-JS execution claim.')
