import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { parse } from 'parse5'
const profiles=JSON.parse(fs.readFileSync('data/people-profiles.json','utf8'))
assert.deepEqual(profiles.map(p=>p.name),['王培','胡祥恩','徐英瑾','魏屹东','桑新民','王伟军','那孜古力·斯拉木','刘凯','李祥','黄英辉','王涛'])
const attrs=n=>Object.fromEntries((n.attrs||[]).map(x=>[x.name,x.value]))
const all=(n,fn)=>[...(fn(n)?[n]:[]),...(n.childNodes||[]).flatMap(c=>all(c,fn))]
const cls=(n,name)=>(attrs(n).class||'').split(' ').includes(name)
const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join('')
const home=parse(fs.readFileSync('dist/index.html','utf8')), detail=parse(fs.readFileSync('dist/about/people.html','utf8'))
const team=parse(fs.readFileSync('dist/about/team.html','utf8')), contactTeam=parse(fs.readFileSync('dist/contact/team.html','utf8'))
const peopleIndex=parse(fs.readFileSync('dist/wiki/people/index.html','utf8'))
const cards=all(home,n=>cls(n,'person-featured')), secretariat=all(home,n=>cls(n,'person-secretary')), rows=all(detail,n=>cls(n,'full-person'))
const normalizeRoute=route=>route.replace(/^\/agi-society-cn(?=\/|$)/,'')||'/'
const hrefs=(doc,route='/')=>new Set(all(doc,n=>n.tagName==='a').map(n=>attrs(n).href).filter(Boolean).map(href=>normalizeRoute(new URL(href,'https://site.invalid'+route).pathname)))
assert.equal(cards.length,6);assert.equal(rows.length,profiles.length)
assert.equal(all(home,n=>cls(n,'person-monogram')).length,0)
assert.equal(all(home,n=>cls(n,'person-photo-unavailable')).length,0)
const indexLinks=hrefs(peopleIndex,'/wiki/people/')
for(const p of profiles) assert.ok(indexLinks.has('/wiki/people/'+p.id),`Independent people index entry: ${p.id}`)
assert.ok(indexLinks.has('/wiki/people/qi-haibin'),'Identity-only person appears in the people index: qi-haibin')
for(const id of ['wang-pei','hu-xiangen','xu-yingjin','wei-yidong','sang-xinmin','wang-weijun','liu-kai','li-xiang','naziguli-slam','jia-min','wu-yuxi','yang-yaya']) assert.ok(hrefs(team,'/about/team').has('/wiki/people/'+id),`Association member page direct profile link: ${id}`)
assert.ok(hrefs(team,'/about/team').has('/wiki/people/wang-tao'),'The member roster links Wang Tao to his independent page')
for(const id of ['wang-pei','liu-kai','xu-yingjin','naziguli-slam','wei-yidong','li-xiang']) assert.ok(hrefs(contactTeam,'/contact/team').has('/wiki/people/'+id),`Research team page direct profile link: ${id}`)
assert.ok(hrefs(home).has('/wiki/people/'),'Homepage navigation exposes the people index')
assert.ok(hrefs(home).has('/wiki/people/naziguli-slam'),'The 那迪 alias resolves to the existing profile ID')
for(const article of secretariat){
 const id=attrs(article)['data-person-id']
 if(!id)continue
 const nameLink=all(article,n=>n.tagName==='a'&&normalizeRoute(attrs(n).href||'')==='/wiki/people/'+id&&text(n).trim()&&!['人物独页与关联','查看成员介绍'].includes(text(n).trim()))
 assert.ok(nameLink.length,`Homepage secretariat name links to its person page: ${id}`)
}
const teamSource=fs.readFileSync('content/about/team.md','utf8')
for(const anchor of ['[[#王培]]','[[#徐英瑾]]','[[#魏屹东]]','[[#刘凯]]','[[#李祥]]','[[#那孜古力·斯拉木(那迪)|那迪]]']) assert.ok(teamSource.includes(anchor),`Preserve legacy member anchor: ${anchor}`)
let facts=0,photos=0
const nady=profiles.find(p=>p.id==='naziguli-slam')
const liu=profiles.find(p=>p.id==='liu-kai')
const wang=profiles.find(p=>p.id==='wang-tao')
for(const id of ['wang-pei','hu-xiangen','xu-yingjin','wei-yidong','wang-weijun','huang-yinghui','liu-kai','li-xiang','wang-tao']){
 const profile=profiles.find(p=>p.id===id)
 assert.ok(profile.sources.some(source=>source.url?.includes('kns.cnki.net/kcms2/author/detail')),`CNKI author-page source retained: ${id}`)
}
assert.ok(wang)
assert.match(wang.affiliation,/湖北经济学院信息工程学院/)
assert.ok(wang.related.some(item=>item.href==='https://link.springer.com/chapter/10.1007/978-981-96-0354-1_27'))
const wangPublications=wang.sections.find(section=>section.title==='代表论文与知网作者页成果').items
assert.equal(wangPublications.length,15)
for(const title of ['“智适应”理论与实践——第三届人工智能和自适应教育国际大会综述','软件漏洞静态检测模型及检测框架','软件工程人才培养模式的改革探索','使用序列模式精简基挖掘序列模式','移动 Ad Hoc 网络 OLSR 路由协议中虫洞问题的研究','压缩频繁序列模式集','挖掘频繁子树精简基（英文）','挖掘序列模式和结构化模式的精简集','一种基于频繁子树的数据库索引方法','一种主动实时数据库语言——ARTDBL','一种更新频繁项目集的快速算法','一种挖掘 free 项目集的快速算法','在有噪音的环境中挖掘序列模式精简基','一种用于快速关联规则挖掘的分段信息表生成算法']) assert.ok(wangPublications.some(item=>item.text.includes(title)),`Wang Tao CNKI author-page title retained: ${title}`)
assert.match(wang.sources.find(source=>source.id==='3').url,/^https:\/\/kns\.cnki\.net\/kcms2\/author\/detail/)
for(const id of Array.from({length:14},(_,i)=>String(i+4))) assert.match(wang.sources.find(source=>source.id===id).url,/^https:\/\/kns\.cnki\.net\/kcms2\/article\/abstract/)
const wangRow=rows.find(row=>all(row,n=>n.tagName==='h2'&&attrs(n).id==='wang-tao').length)
assert.ok(wangRow)
assert.ok(text(wangRow).includes('10.1007/978-981-96-0354-1_27'))
assert.ok(all(wangRow,n=>n.tagName==='a'&&attrs(n).href==='https://ie.hbue.edu.cn/12/f3/c413a135923/page.htm').length)
assert.ok(all(wangRow,n=>n.tagName==='a'&&attrs(n).href==='https://link.springer.com/chapter/10.1007/978-981-96-0354-1_27').length)
const liuBeibeiSource=fs.readFileSync('content/wiki/people/liu-beibei.md','utf8')
const jiaMinSource=fs.readFileSync('content/wiki/people/jia-min.md','utf8')
const qiSource=fs.readFileSync('content/wiki/people/qi-haibin.md','utf8')
const cnkiIdentityPages=['wu-yuxi','sun-changxin','yang-yaya','wang-baozhong','long-zhou','ma-yuhui'].map(id=>fs.readFileSync(`content/wiki/people/${id}.md`,'utf8'))
assert.match(liuBeibeiSource,/kns\.cnki\.net\/kcms2\/author\/detail/)
assert.match(jiaMinSource,/渤海大学/);assert.match(jiaMinSource,/贵州京师城投/)
assert.doesNotMatch(jiaMinSource,/候选|待核|同名/)
assert.match(qiSource,/华中师范大学/);assert.match(qiSource,/华中科技大学/)
assert.doesNotMatch(qiSource,/候选|待核|同名/)
for(const id of ['jia-min','qi-haibin']) assert.ok(!text(parse(fs.readFileSync(`dist/wiki/people/${id}.html`,'utf8'))).includes('不自动合并同名学者或社交账号'))
for(const page of cnkiIdentityPages) assert.match(page,/kns\.cnki\.net\/kcms2\/author\/detail/)
assert.ok(!profiles.some(p=>p.id==='wang-ao-nan'),'Do not create a person profile solely from a CNKI same-name page')
assert.match(nady.affiliation,/讲师、硕士生导师/)
assert.doesNotMatch(nady.affiliation,/工学博士/,'A completed doctoral degree is not a present-tense title')
assert.match(nady.sections.find(section=>section.title==='教育经历').items.map(item=>item.text).join(' '),/天津大学.*博士/,'Keep the sourced doctoral degree in education history')
assert.ok(profiles.find(p=>p.id==='xu-yingjin').affiliation.includes('博士生导师'),'Preserve the formal doctoral-advisor title')
assert.ok(profiles.find(p=>p.id==='wei-yidong').affiliation.includes('博士生导师'),'Preserve the formal doctoral-advisor title')
const associationTeamSource=fs.readFileSync('content/about/team.md','utf8')
const researchTeamSource=fs.readFileSync('content/contact/team.md','utf8')
const archivedTeamSource=fs.readFileSync('content/about/home-archive.md','utf8')
assert.doesNotMatch(associationTeamSource,/^> (?:哲学)?博士[，、]/m,'Do not present a completed degree as a current title')
assert.doesNotMatch(associationTeamSource,/指导老师|博士师从/,'Use professional titles and clear historical-degree wording')
assert.doesNotMatch(researchTeamSource,/西北民族大学博士|博士师从/,'Do not use a completed degree as a current title')
assert.match(associationTeamSource,/曾在侯世达（Douglas Hofstadter）指导下攻读博士学位/)
assert.match(researchTeamSource,/曾在\[\[\/wiki\/people\/wang-pei\|王培\]\]教授指导下攻读博士学位/)
assert.doesNotMatch(archivedTeamSource,/\*\*(?:刘凯|那迪|李祥)\*\* · 博士/,'Archived profile cards must not use a completed doctorate as the present-day title')
assert.deepEqual(nady.aliases,['那迪'])
assert.equal(nady.sources.filter(s=>s.kind==='user-provided').length,1)
assert.ok(!nady.sources.find(s=>s.kind==='user-provided').url)
assert.ok(nady.identityBoundary.includes('那迪'))
assert.equal(liu.portrait.file,'liu-kai-personal-introduction-pptx.jpeg')
assert.equal(liu.portrait.sourceUrl,'#liu-kai-source-1')
assert.match(liu.portrait.rights,/用户于 2026-10-20 明确批准/)
assert.match(liu.limitations,/用户已批准使用PPTX内嵌头像/)
assert.match(liu.limitations,/材料未注明摄影者/)
const liuRow=rows.find(row=>all(row,n=>n.tagName==='h2'&&attrs(n).id==='liu-kai').length)
assert.ok(liuRow)
assert.ok(all(liuRow,n=>n.tagName==='a'&&attrs(n).href==='#liu-kai-source-1').length,'Portrait source link targets the disclosed PPTX source')
const nadyRow=rows.find(row=>text(row).includes('那孜古力·斯拉木'))
assert.ok(nadyRow)
assert.ok(text(nadyRow).includes('秘书组'))
assert.ok(!/D:\\|H:\\|身份证|电话|出生/.test(JSON.stringify(nady)))
assert.ok(fs.readFileSync('content/about/team.md','utf8').includes('[[../wiki/people/naziguli-slam|'))
for(const [i,p] of profiles.entries()){
 if(cards[i])assert.equal(text(cards[i]).split(p.name).length-1,1);else assert.ok(['naziguli-slam','liu-kai','li-xiang','huang-yinghui','wang-tao'].includes(p.id))
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
await import('./profile-additions.test.mjs')
assert.equal(photos,11,'Nine preserved portraits plus the independently checked Huang Yinghui and Wang Tao additions')
assert.ok(profiles.find(p=>p.name==='桑新民').affiliation.includes('荣休'))
assert.ok(profiles.find(p=>p.name==='王培').affiliation.includes('Associate Professor of Instruction'))
assert.ok(text(home).includes('照片版权归原权利人'))
assert.ok(text(detail).includes('不适用本站文字的 CC BY-SA 许可'))
const raw=fs.readFileSync('data/people-profiles.json','utf8')
assert.ok(!raw.includes('/workspace/'));assert.ok(!raw.includes('private'))
console.log('PASS people: '+cards.length+' homepage feature cards; '+profiles.length+' full profile details; '+photos+' source-backed portraits; '+facts+' individually sourced facts; unique card names, identity boundary and photo-rights checks.')
