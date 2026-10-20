import { beforeHomeLayout } from './fixtures/home-layout-scope.mjs'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { parse as parseSfc } from '@vue/compiler-sfc'
import { parse } from 'parse5'
import { pathwaysBaselineTree, pathwaysChanged, pathwaysAdded, withoutPathwaysEntries } from './fixtures/agi-pathways-scope.mjs'

import { wikiRelationsChanged, wikiRelationsAdded } from './fixtures/wiki-integrated-scope.mjs'
const read = file => beforeHomeLayout(file, fs.readFileSync(file, 'utf8'))
const original = file => execFileSync('git', ['show', `${pathwaysBaselineTree}:${file}`], { maxBuffer: 64 * 1024 * 1024 })
const inSource = file => /^(content|data|\.vitepress|docs)\//.test(file)
const originalFiles = execFileSync('git', ['ls-tree', '-r', '--name-only', pathwaysBaselineTree], { encoding: 'utf8' }).trim().split('\n').filter(inSource)
const scope = new Set([...pathwaysChanged, ...wikiRelationsChanged])
let unchanged = 0
for (const file of originalFiles) {
  assert.ok(fs.existsSync(file), `Deleted current-base source: ${file}`)
  if (!scope.has(file)) {
    assert.ok(original(file).equals(beforeHomeLayout(file, fs.readFileSync(file))), `Unexpected cross-route source change: ${file}`)
    unchanged++
  }
}
const sourceFiles = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' }).trim().split('\n').filter(inSource)
assert.deepEqual(sourceFiles.filter(file => !originalFiles.includes(file)).sort(), [...pathwaysAdded, ...wikiRelationsAdded].sort(), 'Only explicitly approved cross-route and wiki-relationship sources may be added')

const researchFile = 'content/research/index.md'
const oldIntro = '这里整理协会的研究资料。想了解 NARS 从什么问题出发，可以先读基本预设；需要进一步核对论述，再查理论正文与参考书籍。'
const newIntro = '本站承担 NARS 国内社区的知识整理与交流，也为 ACA 等研究力量建立独立入口。各条路线保留自身的问题、理论与实践材料，再围绕共同问题展开对话。\n\n想了解 NARS 从什么问题出发，可以先读基本预设；需要进一步核对论述，再查理论正文与参考书籍。'
const researchBefore = original(researchFile).toString()
assert.ok(researchBefore.includes(oldIntro))
assert.ok(read(researchFile).startsWith(researchBefore.replace(oldIntro, newIntro)), 'The complete prior NARS overview, links and legacy anchor must remain')
assert.deepEqual([...read(researchFile).slice(researchBefore.replace(oldIntro, newIntro).length).matchAll(/^## .+$/gm)].map(match => match[0]), ['## ACA · 人工认知生命', '## 更多 AGI 路线'])

const mapFile = 'content/learn/map.md'
const mapAdditions = '\n- [AGI 路线导读：从 Ben Goertzel 读起](/research/agi-pathways)\n- [ACA · 人工认知生命：项目与年会报告](/research/aca)'
const mapExplanation = 'NARS 是已有资料较完整的起点；想了解其他 AGI 路线，可接着看下方导读与 ACA 专题。'
assert.ok(read(mapFile).includes(mapAdditions)); assert.ok(read(mapFile).includes(mapExplanation))
assert.equal(read(mapFile).replace(mapAdditions, '').replace(mapExplanation, ''), original(mapFile).toString(), 'Map change must be limited to one explanation and two links')

const homeFile = '.vitepress/theme/components/ResearchHome.vue'
const before = parseSfc(original(homeFile).toString()).descriptor, after = parseSfc(read(homeFile)).descriptor
assert.equal(after.scriptSetup?.content, before.scriptSetup?.content)
assert.deepEqual(after.styles.map(style => style.content), before.styles.map(style => style.content))
assert.equal(withoutPathwaysEntries(after.template.content), before.template.content, 'Every existing home template byte must survive the two new anchors')
assert.deepEqual([...after.template.content.matchAll(/data-research-entry="([^"]+)" :href="withBase\('([^']+)'\)"/g)].map(match => [match[1], match[2]]), [['cross-route', '/research/agi-pathways'], ['aca', '/research/aca']])

const guide = read(pathwaysAdded[0]), aca = read(pathwaysAdded[1])
assert.equal([...guide.matchAll(/^### \d\./gm)].length, 6)
for (const url of ['https://reference-global.com/article/10.2478/jagi-2014-0001', 'https://arxiv.org/abs/2103.15100', 'https://arxiv.org/abs/2310.18318', 'https://github.com/trueagi-io/hyperon-experimental', 'https://link.springer.com/chapter/10.2991/978-94-91216-62-6_1', 'https://agi-conf.org/2008/']) assert.ok(guide.includes(url), `Missing primary-source entry: ${url}`)
for (const text of ['外部研究阅读', '2026-10-20', '实现讨论的记录', '不表示它们是本协会的成员项目', '未观看视频', '没有安装或运行代码']) assert.ok(guide.includes(text), `Missing reading boundary: ${text}`)
for (const text of ['2026-10-20', '2025 年会官方记录', '协会公开源文件', '未成功读取这些视频页面', '视频内容和播放状态未核验', '不因同场出现就全部归为 ACA 项目成果']) assert.ok(aca.includes(text), `Missing ACA evidence boundary: ${text}`)
assert.ok(!aca.includes('/projects/nars_derivatives/'), 'ACA is not classified as a NARS derivative')
assert.ok(aca.includes('https://github.com/exomind-team/agi-society-cn/blob/60f852704f678ff03b3faa381ede75a2dbc16c0c/content/conference/annual/2026.md'), 'Pin ACA conference evidence')
assert.ok(guide.includes('https://github.com/trueagi-io/hyperon-experimental/blob/2f2b23401aea8c4301dd149771635ffc9583571e/README.md#L3-L8'), 'Pin the dated pre-alpha self-description')
for (const file of pathwaysAdded) assert.equal(sourceFiles.filter(candidate => path.basename(candidate) === path.basename(file)).length, 1, `New wiki basenames must remain unique: ${file}`)
console.log(`PASS cross-route source scope: ${unchanged} existing source/config/data/asset files byte-identical to ${pathwaysBaselineTree}; three prior entry edits and two cross-route pages plus explicit wiki-iteration scope; full prior NARS text, map and home structure retained.`)
if (process.argv.includes('--source-only')) process.exit(0)

const attrs = node => Object.fromEntries((node.attrs || []).map(attr => [attr.name, attr.value]))
const all = (node, predicate) => [...(predicate(node) ? [node] : []), ...(node.childNodes || []).flatMap(child => all(child, predicate))]
const hasClass = (node, name) => (attrs(node).class || '').split(' ').includes(name)
function checkLink(href) {
  const [raw, fragment] = href.split('#')
  const relative = decodeURIComponent(raw.split('?')[0]).replace(/^\//, '')
  const target = [relative, `${relative}.html`, `${relative.replace(/\/$/, '')}/index.html`].map(file => path.join('dist', file)).find(file => fs.existsSync(file) && fs.statSync(file).isFile())
  assert.ok(target, `Missing new-entry route: ${href}`)
  if (fragment) assert.ok(all(parse(read(target)), node => attrs(node).id === decodeURIComponent(fragment)).length, `Missing new-entry anchor: ${href}`)
}
let links = 0
for (const file of [...pathwaysAdded, researchFile]) {
  const document = parse(read(`dist/${file.slice(8).replace(/\.md$/, '.html')}`))
  const body = all(document, node => hasClass(node, 'vp-doc'))[0]
  assert.ok(body, `Missing rendered body: ${file}`)
  const ids = all(body, node => attrs(node).id).map(node => attrs(node).id)
  assert.equal(new Set(ids).size, ids.length, `Duplicate body anchors: ${file}`)
  for (const anchor of all(body, node => node.tagName === 'a')) {
    const href = attrs(anchor).href
    if (href?.startsWith('/') && !href.startsWith('//')) { checkLink(href); links++ }
  }
}
const home = parse(read('dist/index.html')), map = parse(read('dist/learn/map.html'))
for (const route of ['/research/agi-pathways', '/research/aca']) {
  assert.equal(all(home, node => node.tagName === 'a' && attrs(node)['data-research-entry'] && attrs(node).href === route).length, 1)
  const tree = all(map, node => hasClass(node, 'knowledge-groups'))[0]
  assert.ok(all(tree, node => node.tagName === 'a' && attrs(node).href === route).length, `Missing new route in full map: ${route}`)
}
assert.equal(all(map, node => hasClass(node, 'learning-stage')).length, 3, 'Keep the three existing start cards')
console.log(`PASS rendered cross-route pages, ${links} new-page internal links/anchors, two homepage entry links and automatic full-map inclusion. Static HTML checks only; no real-browser claim.`)
