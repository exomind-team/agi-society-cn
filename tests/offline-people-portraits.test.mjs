import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import {parse} from 'parse5'
const html=fs.readFileSync('delivery/offline/AGI-Wiki-完整离线预览.html','utf8')
const data=JSON.parse(html.match(/<script id="offline-data" type="application\/json">([\s\S]*?)<\/script>/)[1])
const profiles=JSON.parse(fs.readFileSync('data/people-profiles.json'))
const attrs=n=>Object.fromEntries((n.attrs||[]).map(a=>[a.name,a.value]))
const all=(n,p)=>[...(p(n)?[n]:[]),...(n.childNodes||[]).flatMap(c=>all(c,p))]
assert.deepEqual(data.audit.missingAssets,[],'Offline bundle must not omit any portrait or other referenced asset')
assert.deepEqual(data.audit.missingPages,[])
assert.equal(profiles.length,10)
for(const profile of profiles) {
 const {id}=profile,hash=profile.portrait.sha256
 const asset=data.assets[hash];assert.ok(asset,`${id}: portrait embedded`)
 assert.equal(crypto.createHash('sha256').update(Buffer.from(asset.b64,'base64')).digest('hex'),hash)
 assert.match(asset.mime,/^image\/(jpeg|png)$/)
 assert.equal(data.assetPaths['/source/content/about/image/people/'+profile.portrait.file],hash,'Source attachment and displayed image must be identical')
 for(const route of ['/','/about/people','/wiki/people/'+id]) {
  const page=parse(data.pages[route].html)
  assert.ok(all(page,n=>n.tagName==='img'&&attrs(n)['data-offline-src']===hash).length,`${id}: shared portrait resolves offline at ${route}`)
 }
}
console.log('PASS All 10 portraits at homepage/overview/person pages embedded by exact hash; zero missing offline assets/pages, including .jpeg')
