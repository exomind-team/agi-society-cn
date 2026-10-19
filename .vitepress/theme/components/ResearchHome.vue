<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import entries from '../../../data/research-preview.json'
import poster from '../../../content/conference/image/2026/2026年会.jpg'

const topic = ref('全部')
const query = ref('')
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
function reset() { topic.value = '全部'; query.value = ''; sync() }
function remember() {
  try { sessionStorage.setItem('agi-preview-return', location.pathname + location.search + '#research-index') } catch {}
}
onMounted(() => {
  const params = new URLSearchParams(location.search)
  const selected = params.get('topic')
  if (selected && categories.includes(selected)) topic.value = selected
  query.value = params.get('q') || ''
})
</script>

<template>
  <div class="research-home" @click="remember">
    <header class="research-masthead">
      <div><p class="research-brand">AGI Wiki <span>研究与知识</span></p><h1>从研究现场，进入知识。</h1></div>
      <p class="research-intro">中国通用人工智能协会<br>会议记录、理论原文与开源实践</p>
    </header>
    <div class="research-layout">
      <div class="research-main">
        <section class="research-feature" aria-labelledby="feature-title">
          <div class="feature-copy">
            <p class="research-meta"><span class="research-kind">年会档案</span><time datetime="2026-07-18">2026 年 7 月 18–19 日</time></p>
            <h2 id="feature-title">机器如何获得含义，<br>又如何走向认知生命？</h2>
            <p>从王培的「符号如何获得含义」到人工认知生命项目进展，沿第十一届年会的报告与录像，追踪通用人工智能的不同研究路径。</p>
            <a class="research-primary" :href="withBase('/conference/annual/2026')" @click="remember">阅读 2026 年会档案 <span aria-hidden="true">↗</span></a>
            <p class="research-note">武汉理工大学南湖校区 · 已举办<br>部分分论坛录像暂缺，完整议程与缺项说明保留在档案中。</p>
          </div>
          <a class="feature-poster" :href="withBase('/conference/annual/2026#年会海报')" aria-label="查看 2026 年会原始海报与议程" @click="remember"><img :src="poster" alt="第十一届中国通用人工智能年会原始海报" width="1086" height="1448" /><span>查看原始海报与议程</span></a>
        </section>

        <section id="research-index" class="research-index" aria-labelledby="index-title">
          <div class="research-section-head"><div><h2 id="index-title">研究动态与资料</h2><p>精选馆藏导读；日期沿用来源，不代表实时更新。</p></div><a :href="withBase('/research/')">全部研究</a></div>
          <div class="research-controls">
            <div class="research-filters" role="group" aria-label="按资料类型筛选"><button v-for="category in categories" :key="category" :aria-pressed="topic === category" @click="choose(category)">{{ category }}</button></div>
            <label class="research-filter-search"><span class="sr-only">筛选本页资料</span><input v-model="query" type="search" placeholder="筛选本页资料" @input="sync" /></label>
          </div>
          <p class="research-count" role="status" aria-live="polite">{{ filtered.length }} 条精选资料<span v-if="topic !== '全部'"> · {{ topic }}</span></p>
          <div v-if="!filtered.length" class="research-empty"><h3>没有匹配的资料</h3><p>试试「NARS」「认知」或清除条件。查找全部正文，请使用顶部全站搜索。</p><button @click="reset">清除筛选</button></div>
          <article v-for="entry in filtered" :key="entry.id" class="research-entry">
            <div class="entry-marker" :data-kind="entry.category" aria-hidden="true"><svg viewBox="0 0 24 24"><path v-if="entry.category === '会议报告'" d="M4 4h16v11H4zM8 20l4-5 4 5M8 8h8M8 11h5"/><path v-else-if="entry.category === '工程实现'" d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/><path v-else d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15"/></svg></div>
            <div class="entry-body"><p class="research-meta"><span>{{ entry.category }}</span><span>{{ entry.dateLabel }}</span></p>
              <h3><a :href="withBase(entry.path)" @click="remember">{{ entry.title }}</a></h3><p>{{ entry.summary }}</p>
              <div class="research-tags"><span v-for="tag in entry.tags" :key="tag">{{ tag }}</span></div>
              <details class="research-evidence"><summary>来源与阅读路径 <span>{{ entry.sources.length }} 项依据</span></summary><div class="evidence-body"><p class="evidence-boundary">{{ entry.boundary }}</p><ul><li v-for="source in entry.sources" :key="source.url"><a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.label }} <span aria-hidden="true">↗</span><span class="sr-only">（新窗口）</span></a></li></ul><nav aria-label="相关知识"><a v-for="related in entry.related" :key="related.path" :href="withBase(related.path)" @click="remember">{{ related.label }}</a></nav></div></details>
            </div>
          </article>
        </section>
      </div>
      <aside class="research-rail" aria-label="知识与会议导航">
        <section><h2>进入知识</h2><a class="knowledge-path" :href="withBase('/research/nars/theory/aikr')"><span>理论起点</span><strong>有限知识与资源下的智能</strong><small>从 AIKR 理解 NARS 的基本预设</small></a><a class="knowledge-path" :href="withBase('/research/nars/theory/')"><span>系统阅读</span><strong>NARS 理论</strong><small>概念、逻辑与认知架构</small></a><a class="knowledge-path" :href="withBase('/projects/nars_impl/')"><span>工程实践</span><strong>NARS 实现索引</strong><small>语言、版本与原始代码仓库</small></a></section>
        <section class="conference-shelf"><h2>会议书架</h2><p class="shelf-years">2016 <span aria-hidden="true">—</span> 2026</p><p>十一届年会的议程、报告与录像，按年份查阅。</p><a :href="withBase('/conference/annual/')">历届年会</a><a :href="withBase('/conference/group/')">学术组会</a></section>
        <section><h2>不同的思想路径</h2><p>从认知架构到跨学科理论，保留原作者的概念与论述。</p><a :href="withBase('/wiki/thought_library/')">打开思想书库</a></section>
        <section class="research-contribute"><h2>让知识继续生长</h2><p>发现缺失的出处或有新的研究材料？欢迎补充原文与来源。</p><a :href="withBase('/contact/contributing/formats')">查看贡献指南</a></section>
      </aside>
    </div>
    <footer class="research-bottom"><span>开放阅读 · 内容采用 CC BY-SA 4.0</span><a :href="withBase('/about/')">关于协会</a><a :href="withBase('/contact/')">联系与参与</a></footer>
  </div>
</template>
