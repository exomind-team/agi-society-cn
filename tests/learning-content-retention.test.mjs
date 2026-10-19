import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {execFileSync} from 'node:child_process'
import {parse} from 'parse5'
const baseline='f79d9c46654a2e566f26edd556d474c76bdbd6a6'
const allowed=new Set(['content/index.md','content/research/nars/theory/learning_resources.md','content/wiki/index.md','content/contact/index.md','content/about/team.md','content/conference/index.md','content/projects/nars_impl/introduction.md','content/projects/nars_derivatives/index.md','content/contact/documents_and_qq_group.md','content/about/index.md','content/projects/nars_impl/index.md','content/contact/contributing/formats.md'])
const files=execFileSync('git',['ls-tree','-r','--name-only',baseline,'content'],{encoding:'utf8'}).trim().split('\n')
const changed=[]
for(const file of files){
 assert.ok(fs.existsSync(file),`Deleted historical file: ${file}`)
 const before=execFileSync('git',['show',`${baseline}:${file}`],{maxBuffer:64*1024*1024})
 if(!before.equals(fs.readFileSync(file))){assert.ok(allowed.has(file),`Unexpected content change: ${file}`); changed.push(file)}
 if(file.endsWith('.md')) assert.ok(fs.existsSync('dist/'+file.slice(8).replace(/\.md$/,'.html')),`Lost old URL: ${file}`)
}
const oldHome=execFileSync('git',['show',baseline+':content/index.md'],{encoding:'utf8'}).split('---').slice(2).join('---')
assert.ok(fs.readFileSync('content/about/home-archive.md','utf8').endsWith(oldHome),'Historic homepage body must be exact')
const attrs=n=>Object.fromEntries((n.attrs||[]).map(x=>[x.name,x.value]))
const all=(n,fn)=>[...(fn(n)?[n]:[]),...(n.childNodes||[]).flatMap(c=>all(c,fn))]
const map=parse(fs.readFileSync('dist/learn/map.html','utf8'))
const tree=all(map,n=>(attrs(n).class||'').split(' ').includes('knowledge-groups'))[0]
assert.ok(tree)
const hrefs=new Set(all(tree,n=>n.tagName==='a').map(n=>attrs(n).href))
const allMarkdown=fs.readdirSync('content',{recursive:true}).filter(f=>f.endsWith('.md')).map(f=>'content/'+f)
const mapFiles=allMarkdown
for(const file of mapFiles){const url=file==='content/index.md' ? '/' : '/'+file.slice(8).replace(/\.md$/,'').replace(/\/index$/,'/');assert.ok(hrefs.has(url),`Missing map page: ${file}`)}
let checked=0
for(const filename of ['index.html','learn/map.html','learn/try.html','learn/projects.html','contact/index.html']){
 const doc=parse(fs.readFileSync('dist/'+filename,'utf8'))
 for(const a of all(doc,n=>n.tagName==='a')){
  const href=attrs(a).href
  if(!href?.startsWith('/')||href.startsWith('//'))continue
  const [raw,hash]=href.split('#');const p=decodeURIComponent(raw.split('?')[0]).slice(1)
  const target=[p,p+'.html',p.replace(/\/$/,'')+'/index.html'].find(x=>fs.existsSync('dist/'+x)&&fs.statSync('dist/'+x).isFile())
  assert.ok(target,`${filename} missing ${href}`)
  if(hash){const ids=new Set(all(parse(fs.readFileSync('dist/'+target,'utf8')),n=>attrs(n).id).map(n=>attrs(n).id));assert.ok(ids.has(decodeURIComponent(hash)),`${filename} missing anchor ${href}`)}
  checked++
 }
}
assert.ok(!fs.readFileSync('content/wiki/index.md','utf8').includes('尚未开源'))
assert.ok(!fs.readFileSync('content/research/nars/theory/learning_resources.md','utf8').includes('gti/chapter1'))
const home=fs.readFileSync('dist/index.html','utf8')
for(const name of ['王培','刘凯','徐英瑾','魏屹东','李祥','那迪','黄英辉','王涛'])assert.ok(home.includes(name),`Missing team member ${name}`)
console.log(`PASS: ${files.length} historical content files preserved; ${changed.length} allowed edits; all old Markdown URLs built; exact old homepage archive; ${mapFiles.length} existing pages in complete map; ${checked} internal links/anchors; all eight noted team names; stale TS status and wrong implementation link removed.`)
