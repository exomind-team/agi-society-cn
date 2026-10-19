<script setup lang="ts">
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
      <a :href="withBase('/research/nars/theory/aikr')"><span>01 · 理解</span><strong>从 NARS 的基本问题开始</strong><small>知识和资源有限，系统怎样推理？</small></a>
      <a :href="withBase('/learn/try')"><span>02 · 观察</span><strong>亲手做一个实验</strong><small>先看感知、操作与反馈，再读原理</small></a>
      <a :href="withBase('/learn/projects')"><span>03 · 实现</span><strong>找到适合的项目</strong><small>选推理器、接入工具或阅读源码</small></a>
    </nav>
    <div class="knowledge-index-heading"><h2 id="完整目录">完整目录</h2><span>按主题展开 · 概览在前</span></div>
    <div class="knowledge-groups">
      <details v-for="group in data" :key="group.id" :data-map-id="group.id" class="knowledge-group" :id="group.id">
        <summary><span><strong>{{ group.title }}</strong><small>{{ group.subtitle }}</small></span><span class="knowledge-count">{{ group.nodes.reduce((sum, node) => sum + node.count, 0) }} 篇</span></summary>
        <ul><KnowledgeBranch v-for="node in group.nodes" :key="node.href" :node="node" /></ul>
      </details>
    </div>
    <p class="knowledge-footnote">目录直接来自本站 Markdown。查找具体术语，可用顶部搜索；版本与维护状态以各项目页注明的来源和核验日期为准。</p>
  </div>
</template>
