import assert from 'node:assert/strict'
import fs from 'node:fs'
import {execFileSync} from 'node:child_process'
import {readPeople,readPages,buildRelations} from '../.vitepress/relations/index.mjs'
import {withdrawnRelations,beforeMentorWithdrawal} from './fixtures/withdrawn-mentor-contract.mjs'
import {withoutCnkiAuthorPage} from './fixtures/cnki-author-page-contract.mjs'
const navigationPromotions=JSON.parse(fs.readFileSync('tests/fixtures/member-navigation-promotions.json','utf8'))
const base='6b3263bf2647321ece20a5e60562eb0c887f085e'
const prior=file=>execFileSync('git',['show',base+':'+file],{encoding:'utf8',maxBuffer:32*1024*1024})
const liu='content/wiki/people/liu-kai.md',wang='content/wiki/people/wang-weijun.md'
const expectedLiu=prior(liu).replace(/relations:\n[\s\S]*?(?=---)/,'').replace(/\n\n## 师承与身份线索[\s\S]*$/,'\n').replace('\n\n本页记录从事机器教育研究的刘凯；不涉及其他同名研究者。\n\n','\n\n').replace('## 论文所列单位\n\n以下为发表时的署名单位，不自动代表现职。','## 论文署名单位')
assert.equal(fs.readFileSync(liu,'utf8'),expectedLiu,'Only withdraw mentor claims/metadata and unverified account research notes; retain verified Liu text')
assert.equal(fs.readFileSync(wang,'utf8'),prior(wang).split('\n').filter(line=>!line.startsWith('- **师承记录**')).join('\n').replace('维护者确认华中师范大学身份；采用','采用'),'Only remove Wang reverse mentor statement and redundant maintainer attribution')
const profiles=JSON.parse(fs.readFileSync('data/people-profiles.json'))
const toMentorBaseline=profile=>{
 const value=beforeMentorWithdrawal(withoutCnkiAuthorPage(profile))
 if(value.id==='naziguli-slam'){
  value.affiliation=value.affiliation.replace(' · 讲师、硕士生导师',' · 讲师、工学博士、硕士生导师')
  value.sections=value.sections.map(section=>({...section,items:section.items.map(item=>({...item,text:item.text.replace('讲师、硕士生导师；工作单位为','讲师、工学博士、硕士生导师；工作单位为')}))}))
 }
 if(value.id==='liu-kai') value.identityBoundary='本页延续协会既有刘凯人物标识与论文归属记录，不据同名账号合并身份。职称、学历和经历的来源及核验限制见下方资料说明。'
 return value
}
assert.deepEqual(profiles.filter(p=>!['huang-yinghui','wang-tao'].includes(p.id)).map(toMentorBaseline),JSON.parse(prior('data/people-profiles.json')),'All pre-existing biography/PPTX/CV facts and portraits remain unchanged apart from the exact limitations correction and CNKI author-page additions')
const old=JSON.parse(fs.readFileSync('tests/fixtures/huang-yinghui-baseline.json'))
const key=e=>JSON.stringify([e.from,e.to,e.role,e.rule,e.source,e.status,e.confidence])
const graph=buildRelations({people:readPeople(),pages:readPages('content')})
const current=new Set(graph.edges.map(key))
const isPromoted=k=>{const [from,to,role,rule]=JSON.parse(k);const promotion=navigationPromotions.find(item=>item.from===from&&item.to===to);const promoted=promotion&&((role==='mention'&&rule==='unique-name-mention')||(role==='link'&&rule==='explicit-markdown-link'));return Boolean(promoted&&current.has(JSON.stringify([from,to,'link',promotion.rule,from,'confirmed','explicit'])))}
const removed=new Set(old.relations.map(key).filter(k=>!current.has(k)&&!isPromoted(k)))
assert.deepEqual(removed,withdrawnRelations,'Exactly two claims and their three prose links removed; no broad historical exemptions')
const rawFiles=execFileSync('git',['ls-tree','-r','--name-only',base,'--','content/sources/transcripts'],{encoding:'utf8'}).trim().split('\n')
for(const file of rawFiles) assert.equal(fs.readFileSync(file,'utf8'),prior(file),'Original transcript unchanged: '+file)
const forbidden=/explicit-maintainer-statement|师承与身份线索|导师关系另以维护者提供标注|王伟军为刘凯博士导师|胡祥恩为其博士后导师/
function check(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const file=dir+'/'+ent.name;if(ent.isDirectory())check(file);else if(/\.(html|js|json|md)$/.test(file))assert.ok(!forbidden.test(fs.readFileSync(file,'utf8')),'Withdrawn mentor record leaked: '+file)}}
check('dist')
if(fs.existsSync('delivery/offline/AGI-Wiki-完整离线预览.html'))assert.ok(!forbidden.test(fs.readFileSync('delivery/offline/AGI-Wiki-完整离线预览.html','utf8')),'No withdrawn claim in offline artifact')
console.log(`PASS exact mentor withdrawal: 2 claims + 3 unsupported links; ${navigationPromotions.length} published name-navigation promotions retained; all other profiles and ${rawFiles.length} transcript files unchanged; no stale published assets`)
