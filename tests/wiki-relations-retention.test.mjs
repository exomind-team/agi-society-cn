import assert from 'node:assert/strict'
import fs from 'node:fs'
import {execFileSync} from 'node:child_process'
import { wikiRelationsBaseline, wikiRelationsChanged, wikiRelationsAdded } from './fixtures/wiki-relations-scope.mjs'
const original=file=>execFileSync('git',['show',`${wikiRelationsBaseline}:${file}`],{encoding:'utf8',maxBuffer:64*1024*1024})
const read=file=>fs.readFileSync(file,'utf8')
const source=file=>/^(content|data|\.vitepress|docs)\//.test(file)
const before=execFileSync('git',['ls-tree','-r','--name-only',wikiRelationsBaseline],{encoding:'utf8'}).trim().split('\n').filter(source)
let unchanged=0
for(const file of before){
 assert.ok(fs.existsSync(file),`Lost baseline file: ${file}`)
 if(!wikiRelationsChanged.includes(file)) {
  assert.ok(execFileSync('git',['show',`${wikiRelationsBaseline}:${file}`],{maxBuffer:64*1024*1024}).equals(fs.readFileSync(file)),`Unexpected wiki-iteration change: ${file}`)
  unchanged++
 }
}
const current=execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{encoding:'utf8'}).trim().split('\n').filter(source)
assert.deepEqual(current.filter(file=>!before.includes(file)).sort(),wikiRelationsAdded.toSorted())
const annual='content/conference/annual/2026.md'
assert.equal(read(annual).replace('从黑格尔、马克思到机器学习','从黑尔格、马克思到机器学习'),original(annual),'Only the authorized typo changes in 2026 historical agenda')
const group='content/conference/group/2023-2024.md'
assert.equal(read(group).replaceAll('Tessergon','Tessorgon'),original(group).replaceAll('Tessergon','Tessorgon'),'Preserve all 2023–24 records apart from name correction')
const rows=text=>text.split('\n').filter(line=>line.startsWith('| [[')).sort()
const annualIndex='content/conference/annual/index.md'
assert.deepEqual(rows(read(annualIndex)),rows(original(annualIndex)))
const aca='content/research/aca.md'
const restored=read(aca).replace('tags: [机器教育, 具身认知]\n','').replace(/## 2025 组会：从颜色问题理解 ACA[\s\S]*?(?=## 与其他路线一起问什么)/,'').replace('上文保留报告中英文名称的归因性表述，暂不据此填写已核定的官方英文全称、官方实现、组织隶属或成熟度结论。','本页暂不填写未经确认的英文全称、官方实现、组织隶属或成熟度结论。')
assert.equal(restored,original(aca),'Preserve existing ACA source and limits outside explicit addition')
assert.equal(read('data/people-profiles.json'),original('data/people-profiles.json'),'All original person facts and photos remain unchanged')
console.log(`PASS wiki iteration retention: ${unchanged} prior files unchanged; exact 2026 title correction, retained year-table rows, bounded ACA addition, original six profile records untouched; explicit added-file scope.`)
