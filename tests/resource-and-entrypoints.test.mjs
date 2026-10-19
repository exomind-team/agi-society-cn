import assert from 'node:assert/strict'
import fs from 'node:fs'
import {parse} from 'parse5'
const attrs=n=>Object.fromEntries((n.attrs||[]).map(x=>[x.name,x.value]))
const all=(n,fn)=>[...(fn(n)?[n]:[]),...(n.childNodes||[]).flatMap(c=>all(c,fn))]
const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('')
const cls=(n,c)=>(attrs(n).class||'').split(' ').includes(c)
const guide=JSON.parse(fs.readFileSync('data/agi-resource-guide.json'))
assert.equal(guide.sources.length,24)
const page=parse(fs.readFileSync('dist/contact/documents_and_qq_group.html','utf8'))
for(const source of guide.sources){
 const entry=all(page,n=>attrs(n).id===`resource-${source.id.toLowerCase()}`)[0]
 assert.ok(entry,source.id)
 for(const field of ['author','checked_at','status','evidence','audience','outcome','limitations']) assert.ok(text(entry).includes(source[field]),`${source.id}: lost ${field}`)
 if(source.url)assert.ok(all(entry,n=>n.tagName==='a'&&attrs(n).href===source.url).length,`${source.id} lost URL`)
}
assert.ok(all(page,n=>attrs(n).id==='关于资料和q群').length)
const conf=parse(fs.readFileSync('dist/conference/index.html','utf8'))
const years=all(conf,n=>cls(n,'conference-overview'))
assert.equal(years.length,2)
assert.equal(all(years[0],n=>n.tagName==='a').length,11)
assert.equal(all(years[1],n=>n.tagName==='a'&&attrs(n).href?.startsWith('/conference/group/')).length,10)
const map=parse(fs.readFileSync('dist/learn/map.html','utf8'))
const impl=all(map,n=>n.tagName==='details'&&attrs(n)['data-map-id']==='/projects/nars_impl/')[0]
assert.equal(all(impl,n=>n.tagName==='a')[1].attrs.find(a=>a.name==='href').value,'/projects/nars_impl/introduction')
const derivative=fs.readFileSync('content/projects/nars_derivatives/index.md','utf8')
assert.ok(derivative.includes('移除部分控制功能'))
const app=derivative.split('#### A3. 框架 / 可视化 / 应用')[1].split('### B.')[0]
for(const name of ['OpenNARS-for-Research','opennars_v3.1.2','opennars-demavenized'])assert.ok(!app.includes(name))
console.log('PASS resource/entrypoints: original resource URL and heading anchor; all 24 records retain exact source/date/status/evidence/boundaries; direct 11 annual + 10 group routes; implementation introduction first; Java variants separated with control-feature limitation.')
const contact=fs.readFileSync('content/contact/index.md','utf8')
assert.match(contact,/comments: false/)
const contactHtml=parse(fs.readFileSync('dist/contact/index.html','utf8'))
for(const mail of ['pei.wang@temple.edu','yjxu@fudan.edu.cn'])assert.ok(all(contactHtml,n=>n.tagName==='a' && attrs(n).href==='mailto:'+mail).length)
assert.ok(fs.readFileSync('content/projects/nars_impl/index.md','utf8').includes('content-order: order'))
const tryPage=fs.readFileSync('content/learn/try.md','utf8')
for(const proof of ['releases/tag/v3.0.4','LanguageGUI','SimNAR','InheritanceGraph','GPL v3','尚未运行验收','de616fb31301d6d5f5550a41c35a034cb1f29ba6228880d073f202f19956ace7'])assert.ok(tryPage.includes(proof),`Missing Java evidence ${proof}`)
const learning=fs.readFileSync('content/learn/map.md','utf8')
for(const link of ['https://www.opennars.org/','https://groups.google.com/g/open-nars','/wiki/','/contact/contributing/formats'])assert.ok(learning.includes(link))
console.log('PASS public contacts, comments disabled, sidebar order, versioned Java package/module/license evidence, and direct external project entry.')
const homeComponent=fs.readFileSync('.vitepress/theme/components/ResearchHome.vue','utf8')
assert.ok(!homeComponent.includes('<span>查看原始海报与议程</span>'))
assert.ok(homeComponent.includes('aria-label="查看 2026 年会原始海报与议程"'))
assert.ok(fs.readFileSync('.vitepress/theme/styles/research-preview.css','utf8').includes('.feature-poster:focus-visible'))
const discussion=fs.readFileSync('.vitepress/theme/components/PreviewDiscussion.vue','utf8')
assert.equal((discussion.match(/frontmatter.comments !== false/g)||[]).length,2)
