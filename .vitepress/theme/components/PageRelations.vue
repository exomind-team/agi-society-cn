<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data } from './relations.data'
const { page, frontmatter } = useData()
const href = computed(() => '/' + page.value.relativePath.replace(/\.md$/, '').replace(/(^|\/)index$/, '$1'))
const inbound = computed(() => data.edges.filter(edge => edge.to === href.value && edge.role !== 'mention'))
const suggestions = computed(() => data.candidates.filter(edge => edge.from === href.value || edge.to === href.value))
const titleFor = (href: string) => data.nodes.find(node => node.href === href)?.title || href
const labels: Record<string, string> = { author: '论文署名', speaker: '会议报告', subject: '条目主题', link: '引用此页', 'doctoral-advisor': '博士导师记录', 'postdoctoral-advisor': '博士后导师记录' }
const groups = computed(() => Object.entries(labels).map(([role, label]) => ({ role, label, edges: inbound.value.filter(edge => edge.role === role) })).filter(group => group.edges.length))
const sourceHref = (source: string) => source.startsWith('/') ? withBase(source) : source
</script>
<template>
  <aside v-if="frontmatter.discovery !== 'unlisted' && (inbound.length || suggestions.length)" class="page-relations" aria-label="页面关联">
    <h2>关联与反向链接</h2>
    <p class="relation-scope">关联由本站页面链接、论文署名和会议议程生成。</p>
    <details v-for="group in groups" :key="group.role" class="relation-confirmed" :open="group.edges.length <= 8"><summary>{{ group.label }} · {{ group.edges.length }}</summary>
    <ul class="relation-list">
      <li v-for="edge in group.edges" :key="edge.key"><a :href="withBase(edge.href || edge.from)">{{ edge.label }}</a><details><summary>依据</summary><p>{{ titleFor(edge.from) }} · {{ edge.status === 'maintainer-provided' ? '维护者提供，未作公开独立核验' : '据来源记录' }}<br><a :href="sourceHref(edge.source)">查看来源</a> · {{ edge.rule }} · {{ edge.confidence }}</p></details></li>
    </ul>
    </details>
    <details v-if="suggestions.length" class="relation-candidates"><summary>延伸阅读候选 · {{ suggestions.length }}</summary><p>由共同人工标签提出的阅读线索，未经关系确认，不代表理论等同或人物关系。</p><ul><li v-for="edge in suggestions" :key="edge.from + edge.to"><a :href="withBase(edge.from === href ? edge.to : edge.from)">{{ titleFor(edge.from === href ? edge.to : edge.from) }}</a><small> · {{ edge.label }} · {{ edge.rule }} / {{ edge.status }} / {{ edge.confidence }}</small></li></ul></details>
  </aside>
</template>
