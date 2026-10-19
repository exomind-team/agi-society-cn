<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import entries from '../../../data/research-preview.json'

const topic = ref('全部')
const query = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const categories = ['全部', '会议报告', '研究资料', '工程实现']
const filtered = computed(() => entries.filter(entry =>
  (topic.value === '全部' || entry.category === topic.value) &&
  `${entry.title} ${entry.summary} ${entry.tags.join(' ')}`.toLowerCase().includes(query.value.trim().toLowerCase())))
function sync() {
  const url = new URL(location.href)
  topic.value === '全部' ? url.searchParams.delete('topic') : url.searchParams.set('topic', topic.value)
  query.value ? url.searchParams.set('q', query.value) : url.searchParams.delete('q')
  history.replaceState(history.state, '', url)
}
function choose(value: string) { topic.value = value; sync() }
async function reset() {
  topic.value = '全部'; query.value = ''; sync()
  await nextTick()
  searchInput.value?.focus()
}
function remember(event?: MouseEvent) {
  try {
    sessionStorage.setItem('agi-preview-return', location.pathname + location.search + '#research-index')
    const anchor = (event?.currentTarget as HTMLElement | undefined)
    if (anchor?.id) sessionStorage.setItem('agi-preview-focus', anchor.id)
  } catch {}
}
function restore() {
  const params = new URLSearchParams(location.search)
  const selected = params.get('topic')
  topic.value = selected && categories.includes(selected) ? selected : '全部'
  query.value = params.get('q') || ''
}
onMounted(() => {
  restore()
  if (location.hash === '#research-index') nextTick(() => {
    let id = ''
    try { id = sessionStorage.getItem('agi-preview-focus') || ''; sessionStorage.removeItem('agi-preview-focus') } catch {}
    const target = id && document.getElementById(id)
    if (target && target.closest('#research-index')) {
      const disclosure = target.closest('details')
      if (disclosure) disclosure.open = true
      target.focus()
    }
    else searchInput.value?.focus({ preventScroll: true })
  })
  window.addEventListener('popstate', restore)
})
onUnmounted(() => window.removeEventListener('popstate', restore))
</script>

<template>
  <div class="research-home research-news">
        <section id="research-index" class="research-index" aria-labelledby="index-title">
          <div class="research-section-head"><div><h2 id="index-title">新闻动态</h2><p>会议与研究资料导读。日期沿用原始来源；人工整理，未接入自动新闻采集。</p></div><a :href="withBase('/research/')">全部研究</a></div>
          <div class="research-controls">
            <div class="research-filters" role="group" aria-label="按资料类型筛选"><button v-for="category in categories" :key="category" :aria-pressed="topic === category" @click="choose(category)">{{ category }}</button></div>
            <label class="research-filter-search"><span class="sr-only">筛选本页资料</span><input ref="searchInput" v-model="query" type="search" placeholder="筛选本页资料" @input="sync" /></label>
          </div>
          <p class="research-count" role="status" aria-live="polite">{{ filtered.length }} 条精选资料<span v-if="topic !== '全部'"> · {{ topic }}</span></p>
          <div v-if="!filtered.length" class="research-empty"><h3>没有匹配的资料</h3><p>试试「NARS」「认知」或清除条件。查找全部正文，请使用顶部全站搜索。</p><button @click="reset">清除筛选</button></div>
          <article v-for="entry in filtered" :key="entry.id" class="research-entry">
            <div class="entry-marker" :data-kind="entry.category" aria-hidden="true"><svg viewBox="0 0 24 24"><path v-if="entry.category === '会议报告'" d="M4 4h16v11H4zM8 20l4-5 4 5M8 8h8M8 11h5"/><path v-else-if="entry.category === '工程实现'" d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/><path v-else d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15"/></svg></div>
            <div class="entry-body"><p class="research-meta"><span>{{ entry.category }}</span><span>{{ entry.dateLabel }}</span></p>
              <h3><a :id="`news-${entry.id}`" :href="withBase(entry.path)" @click="remember">{{ entry.title }}</a></h3><p>{{ entry.summary }}</p>
              <div class="research-tags"><span v-for="tag in entry.tags" :key="tag">{{ tag }}</span></div>
              <details class="research-evidence"><summary>来源与阅读路径 <span>{{ entry.sources.length }} 项依据</span></summary><div class="evidence-body"><p class="evidence-boundary">{{ entry.boundary }}</p><ul><li v-for="source in entry.sources" :key="source.url"><a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.label }} <span aria-hidden="true">↗</span><span class="sr-only">（新窗口）</span></a></li></ul><nav aria-label="相关知识"><a v-for="(related, index) in entry.related" :key="related.path" :id="`news-${entry.id}-related-${index}`" :href="withBase(related.path)" @click="remember">{{ related.label }}</a></nav></div></details>
            </div>
          </article>
        </section>
  </div>
</template>
