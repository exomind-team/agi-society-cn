<script setup lang="ts">
import UiIcon from './UiIcon.vue'
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { withBase } from 'vitepress'
import { data } from './knowledge.data'
import KnowledgeBranch from './KnowledgeBranch.vue'
const map = ref<HTMLElement>()
const key = 'agi-knowledge-map-open-v1'
function save(event: Event) {
  if (!(event.target instanceof HTMLDetailsElement)) return
  try { sessionStorage.setItem(key, JSON.stringify([...map.value!.querySelectorAll('details[open]')].map(el => el.getAttribute('data-map-id')))) } catch {}
}
onMounted(() => {
  try {
    const ids = JSON.parse(sessionStorage.getItem(key) || '[]')
    if (Array.isArray(ids)) map.value?.querySelectorAll('details').forEach(el => { el.open = ids.includes(el.dataset.mapId) })
  } catch {}
  // Capture native toggle events, including keyboard and touch changes.
  map.value?.addEventListener('toggle', save, true)
})
onBeforeUnmount(() => map.value?.removeEventListener('toggle', save, true))
</script>
<template>
  <div class="knowledge-map" ref="map">
    <nav class="learning-starts" aria-label="选择学习起点">
      <a :href="withBase('/research/nars/theory/aikr')"><span class="learning-stage"><UiIcon name="book" />理解</span><strong>先读 NARS 的基本假设</strong><small>知识和资源有限，系统怎样推理？</small></a>
      <a :href="withBase('/learn/try')"><span class="learning-stage"><UiIcon name="experiment" />观察</span><strong>在浏览器里试一试</strong><small>输入判断，看推理和环境反馈</small></a>
      <a :href="withBase('/learn/projects')"><span class="learning-stage"><UiIcon name="code" />实现</span><strong>按要做的事找项目</strong><small>读内核源码，或把推理器接入环境</small></a>
    </nav>
    <div class="knowledge-index-heading"><h2 id="完整目录">完整目录</h2><span>按主题展开 · 概览在前</span></div>
    <div class="knowledge-groups">
      <details v-for="group in data" :key="group.id" :data-map-id="group.id" class="knowledge-group" :id="group.id">
        <summary><span><strong>{{ group.title }}</strong><small>{{ group.subtitle }}</small></span><span class="knowledge-count">{{ group.nodes.reduce((sum, node) => sum + node.count, 0) }} 篇</span></summary>
        <ul><KnowledgeBranch v-for="node in group.nodes" :key="node.href" :node="node" /></ul>
      </details>
    </div>
    <p class="knowledge-footnote">目录随本站 Markdown 页面生成。找具体术语可用顶部搜索；查项目版本和维护状态时，请同时看该页的来源与核验日期。</p>
  </div>
</template>
