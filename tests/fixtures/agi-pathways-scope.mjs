// Fixed source tree after the v1.2 prose revision and before cross-route additions.
// Do not replace the older editorial baseline: both layers must continue to pass.
export const pathwaysBaselineTree = 'ff686896ce6e00c472c7adf77cbd69bb66012bb2'
export const pathwaysChanged = [
  '.vitepress/theme/components/ResearchHome.vue',
  'content/learn/map.md',
  'content/research/index.md',
]
export const pathwaysAdded = ['content/research/agi-pathways.md', 'content/research/aca.md']
export const pathwaysLinkAdditions = {
  'content/research/index.md': ['/research/aca', '/research/agi-pathways'],
  'content/learn/map.md': ['/research/agi-pathways', '/research/aca'],
}
export const pathwaysHeadingAdditions = {
  'content/research/index.md': ['## ACA · 人工认知生命', '## 更多 AGI 路线'],
}
export function withoutPathwaysEntries(template) {
  return template.replace(/<a class="knowledge-path" data-research-entry="(?:cross-route|aca)" :href="withBase\('\/research\/(?:agi-pathways|aca)'\)">[\s\S]*?<\/a>/g, '')
}
