import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import matter from 'gray-matter'
import { parse } from 'parse5'
import MarkdownIt from 'markdown-it'
import { buildRelations, readPages, readPeople, resolveTarget, isDiscoverable, annotateConferenceRows } from '../.vitepress/relations/index.mjs'
import { annualOverview, groupOverview } from '../.vitepress/relations/conference.mjs'
const person = { id: 'test-person', name: '测试人物', aliases: [], href: '/wiki/people/test-person' }
const page = (file, content, frontmatter = {}) => ({ file, content, frontmatter, title: file })
const peoplePage = page('wiki/people/test-person.md', '# 人物', { personId: person.id })
const sample = [peoplePage, page('a.md', '[[wiki/people/test-person|人物]]\n\n测试人物'), page('b.md', '`[[a]]`\n\n```\n[[a]]\n```'), page('c.md', '[a](/a)'), page('raw.md', '测试人物 [[a]]', { discovery: 'unlisted', tags: ['共同'] }), page('paper.md', '摘要', { tags: ['共同'], relations: [{ person: person.id, role: 'author', source: 'https://example.org/paper', status: 'confirmed', confidence: 'pdf-title-page' }] })]
const graph = buildRelations({ pages: sample, people: [person] })
assert.equal(graph.edges.filter(e => e.from === '/b').length, 0, 'Code is not a link')
// Only rendered prose contributes evidence; arbitrary code delimiters and comments do not.
for (const content of [
 '`[[a]] 测试人物`', '`` [[a]] ` 测试人物 ``', '``` [[a]] `` 测试人物 ```',
 '```md\n[[a]] [a](/a) 测试人物\n```', '~~~md\n[[a]] [a](/a) 测试人物\n~~~',
 '<!-- [[a]] [a](/a) 测试人物 -->', '普通文字 <!-- [[a]] [a](/a) 测试人物 --> 结束',
 '<!--\n[[a]]\n[a](/a)\n测试人物\n-->',
]) {
 const excluded = buildRelations({ pages: [page('a.md', ''), page('excluded.md', content)], people: [person] })
 assert.equal(excluded.edges.length, 0, `Non-prose must not become a link or mention: ${content}`)
}
const mixed = buildRelations({ pages: [page('a.md', ''), page('mixed.md', '`` [[missing]] `` <!-- [hidden](/a) --> [[a]]')], people: [] })
assert.equal(mixed.edges.length, 1)
assert.equal(mixed.edges[0].rule, 'explicit-wikilink')
assert.ok(graph.edges.some(e => e.from === '/c' && e.to === '/a'))
assert.ok(graph.edges.some(e => e.from === '/paper' && e.to === person.href && e.role === 'author'))
assert.ok(!JSON.stringify(graph).includes('raw.md'))
assert.equal(graph.candidates.length, 0)
const ambiguous = buildRelations({ pages: [page('mention.md', '测试人物')], people: [person, { ...person, id: 'other' }] })
assert.equal(ambiguous.edges.length, 0, 'Ambiguous same names must not resolve')
const mention = buildRelations({ pages: [page('mention.md', '测试人物')], people: [person] }).edges[0]
assert.equal(mention.role, 'mention'); assert.equal(mention.status, 'candidate')
const agenda = page('conference/annual/2030.md', '| 报告人 | 报告标题 |\n|---|---|\n| 测试人物 | 测试报告 |\n| 他人 | 测试人物的观点 |')
const conference = buildRelations({ pages: [agenda], people: [person] })
assert.equal(conference.edges.filter(e => e.role === 'speaker').length, 1)
assert.equal(conference.edges[0].label, '测试报告')
const repeatedAgenda = page('conference/repeated.md', '| 报告人 | 报告标题 | 来源 |\n|---|---|---|\n| 测试人物 | 同名报告 | [one](https://a.org) |\n| 测试人物 | 同名报告 | [two](https://b.org) |')
const repeatedReports = buildRelations({ pages: [repeatedAgenda], people: [person] }).edges.filter(edge => edge.role === 'speaker')
assert.equal(repeatedReports.length, 2, 'Separate same-title report rows must not be deduplicated')
assert.deepEqual(repeatedReports.map(edge => edge.source), ['https://a.org', 'https://b.org'])
assert.equal(repeatedReports[1].href, repeatedReports[0].href + '-2')
assert.equal(new Set(repeatedReports.map(edge => edge.key)).size, 2, 'Rendered report list keys must remain unique')
const repeatedTokens = new MarkdownIt({ html: true }).parse(repeatedAgenda.content, {})
annotateConferenceRows(repeatedTokens)
assert.deepEqual(repeatedTokens.filter(token => token.type === 'tr_open' && token.attrGet('id')).map(token => token.attrGet('id')), repeatedReports.map(edge => edge.href.split('#')[1]))
assert.match(fs.readFileSync('.vitepress/theme/components/PageRelations.vue', 'utf8'), /:key="edge.key"/)
const duplicateLink = buildRelations({ pages: [page('a.md', ''), page('duplicate.md', '[[a]] [[a]] [a](/a)')], people: [] })
assert.equal(duplicateLink.edges.length, 1, 'Repeated page links still collapse to one backlink')
const tags = buildRelations({ pages: [page('a.md', '', { tags: ['同题'] }), page('b.md', '', { tags: ['同题'] })], people: [] })
assert.equal(tags.candidates[0].status, 'candidate'); assert.equal(tags.edges.length, 0)
assert.equal(resolveTarget({source:'c.md', target:'same', files:new Set(['a/same.md','b/same.md'])}), null)
assert.throws(() => buildRelations({ pages: [page('bad.md', '', {relations:[{person:'unknown', role:'author'}]})], people: [person] }), /Invalid relation/)
const newPaper = page('new-paper.md', '', { relations: [{person:person.id,role:'author',source:'https://example.org/new',status:'confirmed',confidence:'pdf-title-page'}] })
assert.ok(buildRelations({pages:[...sample,newPaper],people:[person]}).edges.some(e=>e.from==='/new-paper'&&e.to===person.href), 'New papers update reverse lists without another registry')
const root=fs.mkdtempSync(path.join(os.tmpdir(),'agi-years-'))
try {
 fs.mkdirSync(path.join(root,'conference/annual'),{recursive:true})
 fs.writeFileSync(path.join(root,'conference/annual/index.md'),'| [[2025\\|第十届]] | 2025 | 原地点 | 原备注 |')
 for(const year of ['2025','2026','2027'])fs.writeFileSync(path.join(root,`conference/annual/${year}.md`),`---\nsidebarTitle: ${year}\n---`)
 fs.mkdirSync(path.join(root,'conference/group'),{recursive:true})
 fs.writeFileSync(path.join(root,'conference/group/index.md'),'## 学年索引\n\n| [[2025-2026]] | 4+ |')
 for(const year of ['2025-2026','2026-2027'])fs.writeFileSync(path.join(root,`conference/group/${year}.md`),'# 组会')
 assert.ok(groupOverview(root).indexOf('2026-2027') < groupOverview(root).indexOf('2025-2026'))
 assert.ok(groupOverview(root).includes('4+'))
 const overview=annualOverview(root)
 assert.ok(overview.indexOf('2027')<overview.indexOf('2026')&&overview.indexOf('2026')<overview.indexOf('2025'))
 assert.ok(overview.includes('原地点'));assert.ok(overview.includes('待补充'))
} finally { fs.rmSync(root,{recursive:true,force:true}) }
const pages=readPages('content'), people=readPeople(), actual=buildRelations({pages,people})
const nadyIdentity=people.find(p=>p.id==='naziguli-slam')
assert.deepEqual(nadyIdentity.aliases,['那迪'])
const nadyReports=actual.edges.filter(e=>e.to==='/wiki/people/naziguli-slam'&&e.role==='speaker')
assert.ok(nadyReports.length>0)
assert.equal(new Set(nadyReports.map(e=>e.href)).size,nadyReports.length)
const raw=pages.filter(p=>!isDiscoverable(p.frontmatter))
assert.equal(raw.length,12)
assert.equal(actual.edges.filter(e=>e.role==='author').length,18)
assert.ok(actual.edges.some(e=>e.to==='/wiki/people/wang-baozhong'&&e.label.includes('从黑格尔、马克思到机器学习')))
for(const p of people)assert.ok(pages.some(page=>page.frontmatter.personId===p.id),p.id)
const attrs=n=>Object.fromEntries((n.attrs||[]).map(a=>[a.name,a.value]))
const all=(n,p)=>[...(p(n)?[n]:[]),...(n.childNodes||[]).flatMap(c=>all(c,p))]
const html=file=>parse(fs.readFileSync(file,'utf8'))
const map=html('dist/learn/map.html')
const search=fs.readdirSync('dist/assets/chunks').filter(f=>f.startsWith('@localSearchIndex')).map(f=>fs.readFileSync('dist/assets/chunks/'+f,'utf8')).join('')
for(const page of raw){
 assert.ok(!JSON.stringify(actual).includes(page.file));assert.ok(!search.includes(page.file.replace(/\.md$/,'')))
 assert.ok(!all(map,n=>n.tagName==='a').some(n=>attrs(n).href?.includes(page.file.replace(/\.md$/,''))))
 const doc=html('dist/'+page.file.replace(/\.md$/,'.html'))
 assert.ok(all(doc,n=>n.tagName==='meta'&&attrs(n).name==='robots'&&attrs(n).content==='noindex, nofollow').length)
 assert.ok(all(doc,n=>n.tagName==='pre'&&(attrs(n).class||'').includes('raw-transcript')).length)
 assert.equal(all(doc,n=>(attrs(n).class||'').includes('page-relations')).length,0)
}
for(const route of ['conference/index.html','conference/annual/index.html']){
 const doc=html('dist/'+route)
 const links=all(doc,n=>n.tagName==='a').map(n=>(attrs(n).href||'').replace(/^\/agi-society-cn(?=\/|$)/,''))
 assert.ok(links.includes('/conference/annual/2025')&&links.includes('/conference/annual/2026'))
}
for(const p of people) {
 const file = 'dist/wiki/people/'+p.id+'.html'
 assert.ok(fs.existsSync(file))
 const doc = html(file)
 for (const node of all(doc, node => attrs(node)['aria-labelledby'])) {
  for (const id of attrs(node)['aria-labelledby'].split(/\s+/)) assert.equal(all(doc, node => attrs(node).id === id).length, 1, `${file} has a missing or ambiguous accessible label: ${id}`)
 }
 for (const profile of all(doc, node => (attrs(node).class || '').split(' ').includes('full-person'))) assert.equal(attrs(profile)['aria-label'], p.name)
}
const peopleOverview = html('dist/about/people.html')
for (const profile of all(peopleOverview, node => (attrs(node).class || '').split(' ').includes('full-person'))) {
 const label = attrs(profile)['aria-labelledby']
 assert.ok(label)
 assert.equal(all(peopleOverview, node => attrs(node).id === label).length, 1, 'Overview keeps its visible heading as accessible label')
}
console.log(`PASS wiki relations: ${people.length} independent people, 18 evidence-backed paper authorships; backlink paths, code exclusion, duplicate-name ambiguity, agenda roles, candidate boundaries, new-paper propagation, automatic annual discovery, ${raw.length} raw pages excluded from graph/search/map with noindex; static SSR only.`)
const homeSource=fs.readFileSync('dist/index.html','utf8')
const siteMatch=homeSource.match(/window\.__VP_SITE_DATA__=JSON\.parse\(("(?:\\.|[^"\\])*")\)/)
const site=JSON.parse(JSON.parse(siteMatch[1]))
assert.ok(!JSON.stringify(site.themeConfig.sidebar).includes('/sources/transcripts/'),'No raw sources in sidebar or pager navigation')
for(const file of fs.readdirSync('dist',{recursive:true}).filter(file=>/sitemap.*\.xml$/.test(file))) assert.ok(!fs.readFileSync('dist/'+file,'utf8').includes('/sources/transcripts/'))
const mentor=actual.edges.filter(edge=>edge.role.endsWith('-advisor'))
assert.equal(mentor.length,0,'Withdrawn mentor relationships must not appear in public graph')
for(const role of ['doctoral-advisor','postdoctoral-advisor']) {
 for(const [status,confidence] of [['maintainer-provided','explicit-maintainer-statement'],['maintainer-provided','external-source'],['confirmed','explicit-maintainer-statement']]) {
  assert.throws(()=>buildRelations({pages:[page('mentor.md','',{relations:[{person:person.id,role,source:'https://example.org/bio',status,confidence}]})],people:[person]}),/Unverified mentor relation/)
 }
 const verified=buildRelations({pages:[page('mentor.md','',{relations:[{person:person.id,role,source:'https://example.org/bio',status:'confirmed',confidence:'institutional-biography'}]})],people:[person]})
 assert.equal(verified.edges.filter(e=>e.role===role).length,1,'Explicit verified evidence remains supported')
}
console.log('PASS raw sidebar/sitemap exclusion; withdrawn mentor claims absent and unverified mentor metadata rejected.')
for (const edge of actual.edges) for (const href of [edge.from, edge.to, edge.source, edge.href].filter(href=>typeof href==='string'&&href.startsWith('/'))) {
 const [route, fragment]=href.split('#')
 const file=['dist'+route+'.html','dist'+route.replace(/\/$/,'')+'/index.html'].find(file=>fs.existsSync(file))
 assert.ok(file, `Generated relation has missing route ${href}`)
 if(fragment)assert.ok(all(html(file),node=>attrs(node).id===decodeURIComponent(fragment)).length,`Generated relation has missing source anchor ${href}`)
}
console.log('PASS every generated relation route and evidence anchor resolves in the built site.')
