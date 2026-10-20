import assert from 'node:assert/strict'
import fs from 'node:fs'
import {execFileSync,spawnSync} from 'node:child_process'
import { wikiRelationsBaseline, wikiRelationsChanged, wikiRelationsAdded } from './fixtures/wiki-relations-scope.mjs'
const normalizeText=text=>text.replace(/\r\n/g,'\n')
const original=file=>normalizeText(execFileSync('git',['show',wikiRelationsBaseline+':'+file],{encoding:'utf8',maxBuffer:64*1024*1024}))
const read=file=>normalizeText(fs.readFileSync(file,'utf8'))
const source=file=>/^(content|data|\.vitepress|docs)\//.test(file)
const before=execFileSync('git',['ls-tree','-r','--name-only',wikiRelationsBaseline],{encoding:'utf8'}).trim().split('\n').filter(source)
let unchanged=0
for(const file of before){
 assert.ok(fs.existsSync(file),`Lost baseline file: ${file}`)
 if(!wikiRelationsChanged.includes(file)) {
  const diff=spawnSync('git',['diff','--quiet','--no-ext-diff',wikiRelationsBaseline,'--',file],{encoding:'utf8'})
  assert.equal(diff.status,0,'Unexpected wiki-iteration change: '+file+(diff.stderr||''))
  unchanged++
 }
}
const current=execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{encoding:'utf8'}).trim().split('\n').filter(source)
assert.deepEqual(current.filter(file=>!before.includes(file)).sort(),wikiRelationsAdded.toSorted())
const annual='content/conference/annual/2026.md'
assert.ok(read(annual).includes('从黑格尔、马克思到机器学习'),'Preserve the corrected 2026 historical-agenda title')
assert.ok(!read(annual).includes('从黑尔格、马克思到机器学习'),'Do not regress the corrected historical-agenda title')
assert.equal(read(annual),original(annual),'Preserve the accepted annual agenda from the stable baseline')
const group='content/conference/group/2023-2024.md'
assert.equal(read(group),original(group),'Preserve all 2023–24 records from the stable baseline')
const rows=text=>text.split('\n').filter(line=>line.startsWith('| [[')).sort()
const annualIndex='content/conference/annual/index.md'
assert.deepEqual(rows(read(annualIndex)),rows(original(annualIndex)))
const aca='content/research/aca.md'
assert.ok(read(aca).includes('tags: [机器教育, 具身认知]'),'Keep the reviewed ACA tags')
assert.ok(read(aca).includes('## 2025 组会：从颜色问题理解 ACA'),'Keep the reviewed ACA section')
assert.ok(read(aca).includes('暂不据此填写已核定的官方英文全称、官方实现、组织隶属或成熟度结论'),'Keep the explicit ACA evidence limits')
assert.equal(read(aca),original(aca),'Preserve the accepted ACA source and limits from the stable baseline')
const priorProfiles=JSON.parse(original('data/people-profiles.json')), nextProfiles=JSON.parse(read('data/people-profiles.json'))
const priorIds=new Set(priorProfiles.map(p=>p.id))
assert.deepEqual(nextProfiles.filter(p=>priorIds.has(p.id)),priorProfiles,'All profiles from the stable baseline remain unchanged')
assert.deepEqual(nextProfiles.filter(p=>!priorIds.has(p.id)).map(p=>p.id).sort(),['li-xiang','liu-kai','naziguli-slam'],'Only the reviewed Li Xiang, Nady and Liu profiles are added')
assert.equal(new Set(nextProfiles.map(p=>p.id)).size,nextProfiles.length)
await import('./profile-additions.test.mjs')
assert.equal(nextProfiles.find(p=>p.id==='wang-weijun').portrait.sha256,'168ed54774e49e245c4d3a882a508a19ac353adf780ab62f6d9802de90346497')
console.log('PASS wiki retention: '+unchanged+' stable-baseline source files unchanged; corrected 2026 agenda title, retained year-table rows and ACA evidence limits; historical profiles/IDs/relations/portraits preserved; exact Li Xiang/Nady/Liu addition scope.')
