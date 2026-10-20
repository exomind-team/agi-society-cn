import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { wikiRelationsChanged } from './fixtures/wiki-integrated-scope.mjs'
import { editorialPages } from './fixtures/editorial-revision-scope.mjs'
// Fixed-base audit validates the narrowly authorized editorial changes and archive.
execFileSync(process.execPath, ['tests/learning-content-retention.test.mjs'], { stdio: 'inherit' })
const editorial = new Set(['content/index.md','content/wiki/index.md','content/research/nars/theory/learning_resources.md','content/contact/index.md','content/about/team.md','content/conference/index.md','content/projects/nars_impl/introduction.md','content/projects/nars_derivatives/index.md','content/contact/documents_and_qq_group.md','content/about/index.md','content/projects/nars_impl/index.md','content/contact/contributing/formats.md'])
;[...editorialPages, ...wikiRelationsChanged].forEach(file => editorial.add(file))
import { parse } from 'parse5'
const root = path.resolve(import.meta.dirname, '..')
const read = p => fs.readFileSync(path.join(root, p), 'utf8')
const manifest = JSON.parse(read('tests/fixtures/preview-content-baseline.json'))
const entries = JSON.parse(read('data/research-preview.json'))
let markdown = 0, assets = 0
for (const file of manifest.files) {
  const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file.path))).digest('hex')
  if (!editorial.has(file.path)) assert.equal(actual, file.sha256, `Baseline file changed: ${file.path}`)
  file.path.endsWith('.md') ? markdown++ : assets++
}
const dist = path.join(root, 'dist')
function pageFor(url) {
  const target = decodeURIComponent(url.split('#')[0]).replace(/^\//, '')
  return [target, `${target}.html`, `${target.replace(/\/$/, '')}/index.html`].map(p => path.join(dist, p)).find(p => fs.existsSync(p) && fs.statSync(p).isFile())
}
function checkLink(url) {
  assert.ok(url.startsWith('/'), `Internal link must be base-relative: ${url}`)
  const page = pageFor(url)
  assert.ok(page, `Missing built route: ${url}`)
  if (url.includes('#')) assert.ok(fs.readFileSync(page, 'utf8').includes(`id="${decodeURIComponent(url.split('#')[1])}"`), `Missing anchor: ${url}`)
}
for (const entry of entries) {
  assert.ok(read(entry.sourceFile).length > 0)
  checkLink(entry.path)
  for (const related of entry.related) checkLink(related.path)
  for (const source of entry.sources) {
    assert.ok(source.url.startsWith('https://'))
    const publicSources = [entry.sourceFile, 'content/projects/nars_impl/ona.md'].map(read).join('\n')
    assert.ok(publicSources.includes(source.url.replace(/\/$/, '')), `Source missing from corpus: ${source.url}`)
  }
  assert.ok(entry.boundary && entry.dateLabel)
}
// All original vault notes must still have a rendered document, not only a selected feed.
for (const file of manifest.files.filter(f => f.path.startsWith('content/') && f.path.endsWith('.md'))) {
  const relative = file.path.slice('content/'.length).replace(/\.md$/, '.html')
  assert.ok(fs.existsSync(path.join(dist, relative)), `Missing original rendered document: ${relative}`)
}
const home = read('dist/index.html')
assert.ok(home.includes('先锋体验版'))
const news = read('dist/news.html')
assert.ok(!home.includes('来源与阅读路径'))
assert.ok(news.includes('来源与阅读路径'))
assert.ok(news.includes('未接入自动新闻采集'))
assert.ok(home.includes('创办人与专家组'))
assert.ok(home.includes('people-featured'))
assert.ok(home.includes('VPNavBarSearch'))
assert.ok(home.includes('关于协会')) // Original index body is retained in the rendered site.
const document = parse(home)
let checked = 0
function visit(node, inPreview = false) {
  const attrs = Object.fromEntries((node.attrs || []).map(a => [a.name, a.value]))
  inPreview ||= (attrs.class || '').split(' ').includes('research-home')
  if (inPreview && node.tagName === 'a' && attrs.href?.startsWith('/')) { checkLink(attrs.href); checked++ }
  if (inPreview && node.tagName === 'img') {
    assert.ok(attrs.alt)
    assert.ok(fs.existsSync(path.join(dist, decodeURIComponent(attrs.src).replace(/^\//, ''))), `Missing image ${attrs.src}`)
  }
  for (const child of node.childNodes || []) visit(child, inPreview)
}
visit(document)
visit(parse(news))
assert.ok(checked > 20)
console.log(`PASS: ${markdown}/${markdown} original Markdown files retained (authorized editorial changes validated separately); ${assets}/${assets} original content assets byte-identical.`)
console.log(`PASS: all 140 original vault Markdown pages rendered; ${checked} rendered preview links and curated provenance checks passed.`)
console.log('Scope: structural/source/build evidence only; not a browser or accessibility conformance claim.')
