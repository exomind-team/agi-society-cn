// Runs the actual SFC setup with Vue reactivity, mocked browser boundaries and
// explicit lifecycle hooks. This is NOT a DOM, browser, layout or AT test.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import { transformSync } from 'esbuild'
import * as vue from 'vue'
const require = createRequire(import.meta.url)
const root = new URL('../', import.meta.url)
const entries = JSON.parse(fs.readFileSync(new URL('data/research-preview.json', root)))
let checks = 0
function check(label, fn) { fn(); checks++; console.log(`PASS ${label}`) }
function harness(name, href = 'https://wiki.example/', saved, base = '/') {
  const source = fs.readFileSync(new URL(`.vitepress/theme/components/${name}.vue`, root), 'utf8')
  const { descriptor } = parse(source)
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: name, id: name }).errors, [])
  const script = compileScript(descriptor, { id: name })
  const { code } = transformSync(script.content, { loader: 'ts', format: 'cjs' })
  const mounted = [], unmounted = [], listeners = new Map(), storage = new Map()
  if (saved !== undefined) storage.set('agi-preview-return', saved)
  const location = new URL(href)
  const documentTargets = new Map()
  const history = { state: { scrollPosition: 125, marker: 'preserve' }, calls: 0,
    replaceState(state, _, url) { this.state = state; this.calls++; location.href = String(url) } }
  const sessionStorage = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) }
  const window = { addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: (key, fn) => { if (listeners.get(key) === fn) listeners.delete(key) } }
  const module = { exports: {} }
  new Function('require', 'module', 'exports', 'location', 'history', 'sessionStorage', 'window', 'document', code)(id => {
    if (id === 'vue') return { ...vue, onMounted: fn => mounted.push(fn), onUnmounted: fn => unmounted.push(fn) }
    if (id === 'vitepress') return { useRoute: () => vue.reactive({ path: location.pathname }), withBase: path => base + path.replace(/^\//, '') }
    if (id.endsWith('.json')) return entries
    if (id.endsWith('.jpg')) return '/poster.jpg'
    return require(id)
  }, module, module.exports, location, history, sessionStorage, window, { getElementById: id => documentTargets.get(id) })
  const state = module.exports.default.setup({}, { expose() {} })
  mounted.forEach(fn => fn())
  return { state, documentTargets, location, history, storage, sessionStorage, listeners, source, unmount: () => unmounted.forEach(fn => fn()) }
}
const h = harness('ResearchNews', 'https://wiki.example/news?keep=yes#research-index')
await vue.nextTick()
check('all curated entries initially shown', () => assert.equal(h.state.filtered.value.length, entries.length))
check('category filter and repeated selection are idempotent; history metadata retained', () => {
  h.state.choose('工程实现'); h.state.choose('工程实现')
  assert.deepEqual(h.state.filtered.value.map(e => e.id), entries.filter(e => e.category === '工程实现').map(e => e.id))
  assert.equal(h.location.searchParams.get('topic'), '工程实现')
  assert.equal(h.location.searchParams.get('keep'), 'yes')
  assert.equal(h.location.hash, '#research-index')
  assert.deepEqual(h.history.state, { scrollPosition: 125, marker: 'preserve' })
})
check('query is case-insensitive and trims search whitespace', () => {
  h.state.choose('全部'); h.state.query.value = '  nArS  '; h.state.sync()
  assert.deepEqual(h.state.filtered.value.map(e => e.id), entries.filter(e => `${e.title} ${e.summary} ${e.tags.join(' ')}`.toLowerCase().includes('nars')).map(e => e.id))
  assert.equal(h.location.searchParams.get('q'), '  nArS  ')
})
check('zero-result state', () => { h.state.query.value = 'NO_MATCH_xyz987'; h.state.sync(); assert.equal(h.state.filtered.value.length, 0) })
let focused = 0
h.state.searchInput.value = { focus() { focused++ } }
await h.state.reset()
check('clearing zero results restores data, removes only owned URL parameters and requests search focus', () => {
  assert.equal(h.state.filtered.value.length, entries.length); assert.equal(focused, 1)
  assert.equal(h.location.search, '?keep=yes')
})
check('mount restores combined category/query; invalid category falls back', () => {
  const valid = harness('ResearchNews', 'https://wiki.example/news?topic=会议报告&q=NARS').state
  assert.equal(valid.topic.value, '会议报告'); assert.equal(valid.query.value, 'NARS')
  assert.ok(valid.filtered.value.every(e => e.category === '会议报告' && `${e.title} ${e.summary} ${e.tags.join(' ')}`.includes('NARS')))
  assert.equal(harness('ResearchNews', 'https://wiki.example/news?topic=invalid').state.topic.value, '全部')
})
check('same-component popstate restores filters and clears absent/invalid values', () => {
  h.location.href = 'https://wiki.example/news?topic=研究资料&q=NARS'; h.listeners.get('popstate')()
  assert.equal(h.state.topic.value, '研究资料'); assert.equal(h.state.query.value, 'NARS')
  h.location.href = 'https://wiki.example/news?topic=invalid'; h.listeners.get('popstate')()
  assert.equal(h.state.topic.value, '全部'); assert.equal(h.state.query.value, '')
})
check('return address preserves the current combined filter', () => {
  h.state.choose('工程实现'); h.state.query.value = 'nars'; h.state.sync(); h.state.remember()
  const back = harness('PreviewContext', 'https://wiki.example/projects/', h.storage.get('agi-preview-return')).state.back.value
  const target = new URL(back, 'https://wiki.example')
  assert.equal(target.searchParams.get('topic'), '工程实现'); assert.equal(target.searchParams.get('q'), 'nars'); assert.equal(target.hash, '#research-index')
})
check('storage denied is nonfatal; listener removed on unmount', () => {
  h.sessionStorage.setItem = () => { throw new Error('denied') }; assert.doesNotThrow(h.state.remember)
  h.unmount(); assert.equal(h.listeners.size, 0)
})
check('return rejects external, protocol-relative, backslash-host and non-index paths', () => {
  for (const saved of ['https://outside.example/#research-index', '//outside.example/#research-index', '/\\outside.example/#research-index', '/research/?q=x#research-index', 'https://wiki.example.evil/#research-index']) {
    assert.equal(harness('PreviewContext', 'https://wiki.example/doc', saved).state.back.value, '/news#research-index', saved)
  }
})
check('return supports subpath base and missing saved-value fallback', () => {
  assert.equal(harness('PreviewContext', 'https://wiki.example/base/doc', '/base/news?q=NARS#research-index', '/base/').state.back.value, '/base/news?q=NARS#research-index')
  assert.equal(harness('PreviewContext').state.back.value, '/news#research-index')
})
check('template uses native controls/disclosure, names, status and safe source links', () => {
  assert.match(h.source, /<button[^>]*:aria-pressed=/)
  assert.match(h.source, /<label class="research-filter-search"><span class="sr-only">筛选本页资料<\/span><input ref="searchInput" v-model="query" type="search"/)
  assert.match(h.source, /role="status" aria-live="polite"/)
  assert.match(h.source, /<details class="research-evidence"><summary>/)
  assert.match(h.source, /target="_blank" rel="noopener noreferrer"/)
  assert.match(h.source, /（新窗口）/)
})
check('legacy home return migrates to news without losing filter parameters', () => {
  assert.equal(harness('PreviewContext', 'https://wiki.example/doc', '/?topic=研究资料&q=NARS#research-index').state.back.value, '/news?topic=%E7%A0%94%E7%A9%B6%E8%B5%84%E6%96%99&q=NARS#research-index')
})
check('news context returns home; reused context refreshes storage on document navigation', () => {
  const context = harness('PreviewContext', 'https://wiki.example/news/')
  assert.equal(context.state.back.value, '/')
  context.storage.set('agi-preview-return', '/news?q=NARS#research-index')
  context.state.route.path = '/research/'
  context.state.restore()
  assert.equal(context.state.back.value, '/news?q=NARS#research-index')
})
const restored = harness('ResearchNews', 'https://wiki.example/news?q=NARS#research-index')
const disclosure = { open: false }; let restoredFocus = 0
restored.storage.set('agi-preview-focus', 'news-related-test')
restored.documentTargets.set('news-related-test', { closest: selector => selector === 'details' ? disclosure : {}, focus: () => restoredFocus++ })
await vue.nextTick()
check('related-link return opens disclosure before requesting visible focus', () => { assert.equal(disclosure.open, true); assert.equal(restoredFocus, 1); assert.equal(restored.storage.has('agi-preview-focus'), false) })
console.log(`${checks} deterministic checks passed. Browser keyboard/touch, native disclosure behavior, focus landing, layout and history scroll remain NOT RUN.`)
