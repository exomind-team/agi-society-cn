import assert from 'node:assert/strict'
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import { parse as parseSfc } from '@vue/compiler-sfc'
import { parse as parseTemplate } from '@vue/compiler-dom'
import { baselineTree, editorialPages, editorialComponents, editorialData } from './fixtures/editorial-revision-scope.mjs'
import { pathwaysLinkAdditions, pathwaysHeadingAdditions, withoutPathwaysEntries } from './fixtures/agi-pathways-scope.mjs'

// Only the explicitly added links/headings/cards are normalized below. The newer
// fixed-base guard also proves that all pre-expansion source passages survive.
execFileSync(process.execPath, ['tests/agi-pathways-retention.test.mjs', '--source-only'], { stdio: 'inherit' })

import { wikiRelationsChanged } from './fixtures/wiki-relations-scope.mjs'
const original = file => execFileSync('git', ['show', `${baselineTree}:${file}`], { maxBuffer: 64 * 1024 * 1024 })
const read = file => fs.readFileSync(file, 'utf8')
const scope = new Set([...editorialPages, ...editorialComponents, ...editorialData, ...wikiRelationsChanged])
const files = execFileSync('git', ['ls-tree', '-r', '--name-only', baselineTree], { encoding: 'utf8' }).trim().split('\n')
  .filter(file => /^(content|data|\.vitepress|docs)\//.test(file))
let untouched = 0
for (const file of files) {
  assert.ok(fs.existsSync(file), `Missing source: ${file}`)
  if (!scope.has(file)) {
    assert.ok(original(file).equals(fs.readFileSync(file)), `Outside editorial scope: ${file}`)
    untouched++
  }
}

const matches = (text, pattern) => [...text.matchAll(pattern)].map(match => match[0])
const targets = text => [
  ...[...text.matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)].map(match => match[1]),
  ...[...text.matchAll(/\[\[([^\]|]+)(?:\\?\|[^\]]*)?\]\]/g)].map(match => match[1].replace(/\\$/, '')),
].sort()
const newAgiSources = ['https://cis.temple.edu/~pwang/AGI-Intro.html', 'https://cis.temple.edu/tagit/publications/PAGI-TR-9.pdf']
for (const file of editorialPages) {
  const before = original(file).toString(), after = read(file)
  assert.equal(after.match(/^\ufeff?---\n[\s\S]*?\n---/)?.[0], before.match(/^\ufeff?---\n[\s\S]*?\n---/)?.[0], `Frontmatter changed: ${file}`)
  const headings = matches(after, /^#{1,6} .+$/gm).filter(heading => !(pathwaysHeadingAdditions[file] || []).includes(heading)).map(heading => file === 'content/research/index.md' && heading === '### 进一步阅读' ? '### 参考书籍' : heading)
  assert.deepEqual(headings, matches(before, /^#{1,6} .+$/gm), `Heading/anchor changed: ${file}`)
  if (file === 'content/research/index.md') assert.ok(after.includes('<span id="参考书籍"></span>'), 'Retain the old reading-section anchor')
  assert.deepEqual(matches(after, /^```[^\n]*\n[\s\S]*?^```/gm), matches(before, /^```[^\n]*\n[\s\S]*?^```/gm), `Code sample changed: ${file}`)
  assert.deepEqual(matches(after, /!\[[^\]]*\]\([^)]*\)/g), matches(before, /!\[[^\]]*\]\([^)]*\)/g), `Image changed: ${file}`)
  const additions = file === 'content/about/agi.md' ? newAgiSources : file === 'content/research/index.md' ? ['research/nars/theory/nac/index'] : []
  const expected = [...targets(before), ...additions, ...(pathwaysLinkAdditions[file] || [])].sort()
  assert.deepEqual(targets(after), expected, `Link target changed: ${file}`)
}

// Prose can change; script, styles, elements, attributes and directives cannot.
function structure(node) {
  if (node.type === 2) return null
  if (node.type === 3) return { type: node.type, content: node.content }
  if (node.type === 5) return { type: node.type, content: node.content.content }
  return {
    type: node.type,
    tag: node.tag,
    props: node.props?.map(prop => prop.loc.source),
    children: node.children?.map(structure).filter(Boolean),
  }
}
for (const file of editorialComponents) {
  const before = parseSfc(original(file).toString()).descriptor, after = parseSfc(read(file)).descriptor
  assert.equal(after.script?.content, before.script?.content)
  assert.equal(after.scriptSetup?.content, before.scriptSetup?.content)
  assert.deepEqual(after.styles.map(style => style.content), before.styles.map(style => style.content))
  assert.deepEqual(structure(parseTemplate(file === '.vitepress/theme/components/ResearchHome.vue' ? withoutPathwaysEntries(after.template.content) : after.template.content)), structure(parseTemplate(before.template.content)), `UI structure changed: ${file}`)
}
const entries = JSON.parse(read(editorialData[0])), oldEntries = JSON.parse(original(editorialData[0]))
const withoutSummary = values => values.map(({ summary, ...rest }) => rest)
assert.deepEqual(withoutSummary(entries), withoutSummary(oldEntries), 'News provenance or facts changed')

function preserve(file, from, to) {
  const slice = text => {
    const start = text.indexOf(from)
    assert.ok(start >= 0, `Missing boundary ${from}: ${file}`)
    const end = to ? text.indexOf(to, start + from.length) : text.length
    assert.ok(end > start, `Missing boundary ${to}: ${file}`)
    return text.slice(start, end)
  }
  assert.equal(slice(read(file)), slice(original(file).toString()), `Protected passage changed: ${file} (${from})`)
}
preserve('content/contact/documents_and_qq_group.md', '## 按用途选资料', '## 把线索变成可引用的资料')
preserve('content/contact/documents_and_qq_group.md', '这里也值得停一下：', '### 再让一个小问题进入系统')
for (const prefix of ['NARS 并不是', '例如，在王培']) {
  const file = 'content/contact/documents_and_qq_group.md'
  const paragraph = text => text.split('\n').find(line => line.startsWith(prefix))
  assert.ok(paragraph(original(file).toString()))
  assert.equal(paragraph(read(file)), paragraph(original(file).toString()), `Technical explanation changed: ${prefix}`)
}
preserve('content/projects/nars_impl/introduction.md', '## 各版本总览')
preserve('content/learn/projects.md', '## 先认清项目的来源与位置', '选定')
preserve('content/learn/projects.md', '### 找 Java 相关仓库时，先辨认用途')
preserve('content/learn/try.md', '## 想在本机运行 Java 版？')
preserve('content/research/nars/theory/learning_resources.md', '> [!warning]+ 王培老师的备注', '在内容上大致分为：')
preserve('content/about/agi.md', 'AGI研究追求')

console.log(`PASS editorial revision: ${editorialPages.length + editorialComponents.length + editorialData.length} editorial target files with explicit wiki-iteration exceptions; ${untouched} other source/config/data/asset files byte-identical to ${baselineTree}; all old anchors, frontmatter, code, images and link targets retained; original two AGI sources and one NAC link plus separately checked cross-route entry additions.`)
console.log('PASS original component structure/scripts/styles retained after the two explicitly checked new home links; news provenance; 24 resource records; historical quotations; OpenNARS lineage, Java package evidence and project policy passages.')
