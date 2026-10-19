import assert from 'node:assert/strict'
import fs from 'node:fs'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
for (const file of ['.vitepress/theme/components/ProjectRoles.vue', '.vitepress/theme/components/KnowledgeMap.vue', '.vitepress/theme/components/UiIcon.vue']) {
  const { descriptor, errors } = parse(fs.readFileSync(file, 'utf8'))
  assert.deepEqual(errors, [])
  compileScript(descriptor, { id: 'learning-visual-check' })
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: file, id: 'learning-visual-check' }).errors, [])
}
const roles = fs.readFileSync('.vitepress/theme/components/ProjectRoles.vue', 'utf8')
for (const route of roles.matchAll(/withBase\('([^']+)'\)/g)) assert(fs.existsSync('content' + route[1] + '.md'), route[1])
assert(roles.includes('aria-label="实验环境向推理内核提供感知输入'))
assert(roles.includes('Core 与 Demo 分属不同仓库'))
const map = fs.readFileSync('.vitepress/theme/components/KnowledgeMap.vue', 'utf8')
assert.equal((map.match(/class="learning-stage"/g) || []).length, 3)
assert.equal((map.match(/<UiIcon name=/g) || []).length, 3)
assert(!map.includes('<svg'), 'Map uses shared icons')
assert(!roles.includes('<svg'), 'Project relationship uses shared icons')
assert.equal((roles.match(/<UiIcon name=/g) || []).length, 4)
const icon = fs.readFileSync('.vitepress/theme/components/UiIcon.vue', 'utf8')
assert(icon.includes(':aria-hidden="label ? undefined : true"'))
const registry = fs.readFileSync('.vitepress/theme/components/ui-icons.ts', 'utf8')
for (const name of ['book', 'experiment', 'code', 'environment', 'processor', 'inputArrow', 'outputArrow']) assert(registry.includes(name + ':'))
console.log('PASS: learning visual Vue compilation, source routes, relationship description and three SVG entry markers. Browser rendering not assessed.')
