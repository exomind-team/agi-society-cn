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
  '.vitepress/config.ts',
  '.vitepress/theme/components/ResearchHome.vue',
  '.vitepress/theme/components/people.data.ts',
  '.vitepress/theme/index.ts',
  '.vitepress/theme/styles/research-preview.css',
  'content/index.md',
].sort(), 'The CRLF-compatible exception covers exactly six reviewed source files')
assert.deepEqual(Object.keys(contract.newFiles), ['.vitepress/theme/components/HomeNewsTeaser.vue'], 'The homepage news teaser is the only new component in this candidate')
for(const [file,hash] of Object.entries(contract.newFiles)) assert.equal(sha(fs.readFileSync(file)),hash,'Unexpected new homepage file: '+file)
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
const homeSource = body(read('content/index.md'))
for (const phrase of ['从理论到实现','协会成员','更多协会成员','协会知识库','知识地图','补充与修正']) assert.ok(homeSource.includes(phrase), 'Homepage keeps the reviewed entry: '+phrase)
for (const phrase of ['从问题到实验','在交流中推进研究','核心成员','home-meetings','home-quick-nav']) assert.ok(!homeSource.includes(phrase), 'Homepage removes the duplicate section: '+phrase)
assert.ok(homeSource.includes('<HomeNewsTeaser variant="inline" />'))
const config = read('.vitepress/config.ts')
assert.ok(config.includes("{ text: '知识百科', link: '/wiki/' }"))
assert.ok(!config.includes("{ text: '学习与知识'"))
assert.ok(!config.includes("{ text: '研究与项目'"))
assert.ok(homeSource.includes('[社区演示](/community)'),'Community demo remains reachable from the homepage')
assert.ok(read('content/index.md').startsWith('---\nlayout: home\nsidebar: false\nmarkdownStyles: false\n'))
const component = parseSfc(read('.vitepress/theme/components/ResearchHome.vue')).descriptor
assert.equal((component.template.content.match(/<Content\b/g)||[]).length, 0, 'VitePress renders Content once; the home shell only renders slots')
assert.equal((read('content/index.md').match(/<ResearchHome>/g)||[]).length, 1)
assert.equal((component.template.content.match(/<slot \/>/g)||[]).length, 1)
assert.equal((component.template.content.match(/<slot name="footer" \/>/g)||[]).length, 1)
assert.equal((component.template.content.match(/<slot name="conference" \/>/g)||[]).length, 1)
assert.equal((component.template.content.match(/<main\b/g)||[]).length, 1)
assert.equal((component.template.content.match(/<footer\b/g)||[]).length, 1)
assert.ok(!component.template.content.includes('<ResearchHome'), 'Content must not render itself recursively')
assert.ok(component.template.content.includes('<HomeNewsTeaser variant="rail" />'))
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
assert.equal(all(main,n=>has(n,'section')).length,4)
assert.equal(all(home,n=>has(n,'research-rail')).length,1)
const flow=all(home,n=>n.tagName)
assert.ok(flow.indexOf(footers[0]) > flow.indexOf(all(main,n=>has(n,'home-knowledge'))[0]), 'Footer must follow every body section')
assert.ok(!all(footers[0],n=>n.tagName==='main').length)
assert.equal(all(home,n=>has(n,'person-featured')).length,0)
assert.equal(all(home,n=>has(n,'person-secretary')).length,0)
assert.equal(all(home,n=>has(n,'people-members')).length,0)
assert.equal(all(home,n=>has(n,'home-members')).length,1)
assert.equal(all(home,n=>n.tagName==='a'&&norm(n)==='更多协会成员 ↗').length,1)
assert.equal(all(home,n=>has(n,'home-quick-nav')).length,0)
assert.equal(all(home,n=>has(n,'home-meetings')).length,0)
assert.equal(all(home,n=>has(n,'home-news-teaser')).length,2)
assert.equal(all(home,n=>has(n,'home-news-teaser__list')).flatMap(n=>all(n,x=>x.tagName==='li')).length,6)
assert.equal(all(home,n=>has(n,'conference-shelf')).length,1)
for(const phrase of ['第三方照片除外','历史首页内容']) assert.ok(norm(footers[0]).includes(phrase))
const homeRoutes = new Set(all(home,n=>n.tagName==='a').map(n=>new URL(attrs(n).href,'https://site.invalid/').pathname.replace(/^\/agi-society-cn(?=\/|$)/,'')||'/'))
for(const href of ['/wiki/','/learn/map','/contact/team','/conference/annual/','/conference/group/','/news','/community']) {
  assert.ok(homeRoutes.has(href) || config.includes("link: '"+href+"'"), 'Homepage or navigation keeps '+href)
}
const rail = all(home,n=>has(n,'research-rail'))[0]
assert.ok(all(rail,n=>has(n,'home-news-teaser')).length)
assert.ok(all(rail,n=>has(n,'conference-shelf')).length)
let links=0
for(const node of all(home,n=>n.tagName==='a')) {
 const href=attrs(node).href
 assert.ok(href && !/^javascript:/i.test(href), 'No JS-only home navigation')
 if(!href.startsWith('/')||href.startsWith('//'))continue
 const [raw, fragment]=href.split('#');const normalizedPath=new URL(raw,'https://site.invalid/').pathname.replace(/^\/agi-society-cn(?=\/|$)/,'')||'/';const rel=decodeURIComponent(normalizedPath).replace(/^\//,'')
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
 const data=JSON.parse(raw[1])
 const homeRoutes=new Set(all(home,n=>n.tagName==='a').map(n=>new URL(attrs(n).href,'https://site.invalid/').pathname.replace(/^\/agi-society-cn(?=\/|$)/,'')||'/'))
 for(const route of ['/wiki/','/learn/map','/contact/team','/contact/contributing/formats','/conference/annual/','/conference/annual/2026','/conference/group/','/news','/community']) assert.ok(homeRoutes.has(route),'Homepage destination remains reachable: '+route)
 let docs=0
 for(const [route,page] of Object.entries(data.pages)){
  if(route==='/'||page.kind!=='wiki')continue
  const old=parse(page.html), body=all(old,n=>has(n,'vp-doc'))[0]
  if(!body)continue
  const filename=path.join('dist',page.source.replace(/^\//,''));if(!fs.existsSync(filename))continue
  const next=all(parse(read(filename)),n=>has(n,'vp-doc'))[0]
  assert.equal(norm(next),norm(body),'Rendered document text changed: '+route);docs++
 }
 console.log('PASS prior offline baseline: core home routes remain reachable; '+docs+' document bodies are unchanged.')
}
console.log(`PASS homepage layout: ${unchanged} non-home sources unchanged; six-file scope contract; one main, body and final footer; ${links} internal links/anchors; latest-news teasers and a single member link; default document layouts retained.`)
console.log('Evidence: source, CSS contracts and SSR HTML. No real browser/phone geometry, focus movement, screen reader or offline no-JS execution claim.')
