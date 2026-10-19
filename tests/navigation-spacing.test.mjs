import assert from 'node:assert/strict'
import fs from 'node:fs'
import postcss from 'postcss'

// Source-contract checks, not a substitute for browser viewport / visual tests.
const read = p => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const source = read('.vitepress/theme/styles/navigation.css')
const css = postcss.parse(source)
const rules = []
css.walkRules(rule => rules.push(rule))
function has(selector, property, value) {
  return rules.some(rule => (rule.selector === selector || rule.selector.split(',').map(s => s.trim()).includes(selector))
    && rule.nodes.some(node => node.prop === property && node.value === value))
}
assert(has('.VPNavBar .DocSearch-Button .DocSearch-Button-Keys', 'gap', '6px'))
assert(has('.VPNavBar .DocSearch-Button .DocSearch-Button-Keys', 'border', '1px solid var(--vp-c-divider)'))
assert(has('.VPNavBar .DocSearch-Button .DocSearch-Button-Key', 'border', '0'))
assert(has('.VPNavBar .DocSearch-Button .DocSearch-Button-Key + .DocSearch-Button-Key', 'border', '0'))
assert(has('.VPNavBar .DocSearch-Button', 'min-height', '44px'))
assert(has('.VPNavBar :is(a, button):focus-visible', 'outline', '2px solid var(--rp-accent)'))
assert(has('.VPNavBar.has-sidebar .container > .title', 'position', 'static'))
const tablet = css.nodes.find(node => node.type === 'atrule' && node.params === '(min-width: 768px) and (max-width: 1279px)')
assert(tablet, 'Tablet breakpoint exists')
assert.match(tablet.toString(), /\.VPNavBarHamburger\s*\{\s*display: flex/)
assert.match(tablet.toString(), /\.VPNavScreen\s*\{\s*display: block/)
assert.match(source, /grid-template-columns: auto 1fr/)
assert.match(read('.vitepress/theme/styles/custom.css'), /@import '\.\/navigation.css';/)
// Match the actual upstream keyboard markup; the modifier's :after is preserved.
const button = read('node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearchButton.vue')
assert.equal((button.match(/<kbd class="DocSearch-Button-Key"/g) || []).length, 2)
assert(!source.includes('first-child:after'), 'Keep platform-specific Ctrl / Command label')
assert(!source.includes('.vp-doc'), 'Do not remove meaningful document borders')
console.log('Navigation CSS contracts passed: joined shortcut, spacing, touch/focus, tablet menu and narrow title. Browser rendering remains unverified.')
