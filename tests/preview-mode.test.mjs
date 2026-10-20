// A build/SSR contract test, not a browser or network-execution test.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { isDiscoverable } from '../.vitepress/relations/index.mjs'
import { parse, compileTemplate } from '@vue/compiler-sfc'
import { parse as parseHtml } from 'parse5'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'

const read = file => fs.readFileSync(file, 'utf8')
const attrs = node => Object.fromEntries((node.attrs || []).map(attr => [attr.name, attr.value]))
const all = (node, predicate) => [...(predicate(node) ? [node] : []), ...(node.childNodes || []).flatMap(child => all(child, predicate))]
const expectedEdit = 'https://github.com/exomind-team/agi-society-cn/edit/dot/dev-agi-society-cn-20261019/content/:path'
let pages = 0, standalone = 0, editLinks = 0
for (const file of fs.readdirSync('dist', { recursive: true }).filter(file => file.endsWith('.html'))) {
  const html = read(path.join('dist', file)), document = parseHtml(html)
  const match = html.match(/window\.__VP_SITE_DATA__=JSON\.parse\(("(?:\\.|[^"\\])*")\)/)
  for (const node of all(document, node => node.tagName === 'script')) assert.ok(!attrs(node).src?.includes('giscus.app'), `Live Giscus script: ${file}`)
  assert.equal(all(document, node => ['giscus-widget', 'giscus-wrapper'].includes(node.tagName) || (attrs(node).class || '').split(' ').includes('giscus-wrapper')).length, 0, `Rendered Giscus instance: ${file}`)
  if (!match) { standalone++; continue }
  const site = JSON.parse(JSON.parse(match[1]))
  assert.equal(site.base, '/', `Wrong deployment base: ${file}`)
  assert.equal(site.themeConfig.previewEnvironment, true, `Preview flag missing: ${file}`)
  assert.equal(site.themeConfig.editLink.pattern, expectedEdit, `Wrong edit branch: ${file}`)
  for (const node of all(document, node => node.tagName === 'a' && attrs(node).href?.includes('/agi-society-cn/edit/'))) {
    assert.ok(attrs(node).href.startsWith(expectedEdit.replace(':path', '')), `Rendered edit link leaves feature branch: ${file}`)
    editLinks++
  }
  for (const node of all(document, node => node.tagName === 'a' && attrs(node).href?.startsWith('/agi-society-cn/'))) assert.fail(`Wrong root-relative site path: ${file}: ${attrs(node).href}`)
  pages++
}
const markdown = fs.readdirSync('content', { recursive: true }).filter(file => file.endsWith('.md')).length
assert.equal(pages, markdown + 1, 'Every Markdown page plus 404 must carry the preview configuration')
const unlisted = fs.readdirSync('content', { recursive: true }).filter(file => file.endsWith('.md') && !isDiscoverable(matter(read(path.join('content', file))).data)).length
assert.ok(editLinks >= markdown - unlisted - 2)
console.log(`PASS ${pages} VitePress HTML files: preview=true, base=/, feature-branch edit configuration; ${editLinks} rendered feature-branch edit links; ${standalone} standalone HTML; no live/rendered Giscus instance.`)

const { descriptor } = parse(read('.vitepress/theme/components/PreviewDiscussion.vue'))
const compiled = compileTemplate({ source: descriptor.template.content, filename: 'PreviewDiscussion.vue', id: 'preview-mode-contract', compilerOptions: { mode: 'function' } })
assert.deepEqual(compiled.errors, [])
const render = new Function('Vue', compiled.code)(Vue)
async function renderDiscussion(previewEnvironment, comments) {
  const app = Vue.createSSRApp({
    components: { GiscusComments: { render: () => Vue.h('div', { 'data-live-giscus-test': '' }, 'giscus') } },
    setup: () => ({ theme: { previewEnvironment }, frontmatter: { comments } }),
    render,
  })
  return renderToString(app)
}
const preview = await renderDiscussion(true, undefined)
assert.ok(preview.includes('preview-discussion-note'))
assert.ok(!preview.includes('data-live-giscus-test'))
const ordinary = await renderDiscussion(false, undefined)
assert.ok(ordinary.includes('data-live-giscus-test'))
for (const flag of [true, false]) {
  const hidden = await renderDiscussion(flag, false)
  assert.ok(!hidden.includes('data-live-giscus-test') && !hidden.includes('preview-discussion-note'))
}
console.log('PASS actual PreviewDiscussion SSR branch: preview mode does not instantiate Giscus; ordinary-mode and comments-disabled controls pass. Dormant Giscus bundle code is not removed. No browser/network execution was attempted.')
