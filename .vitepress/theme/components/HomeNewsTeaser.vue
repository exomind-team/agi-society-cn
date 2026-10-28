<script setup lang="ts">
import { withBase } from 'vitepress'
import entries from '../../../data/research-preview.json'

const props = defineProps<{ variant: 'rail' | 'inline' }>()
const latest = entries.slice(0, 3)
</script>

<template>
  <section
    :class="'home-news-teaser home-news-teaser--' + props.variant"
    :aria-labelledby="'home-news-title-' + props.variant"
  >
    <header class="home-news-teaser__head">
      <div>
        <p class="home-news-teaser__kicker">会议 · 研究 · 工程</p>
        <h2 :id="'home-news-title-' + props.variant">最新动态</h2>
      </div>
      <a class="home-news-teaser__all" :href="withBase('/news')">全部动态 <span aria-hidden="true">↗</span></a>
    </header>
    <ol class="home-news-teaser__list">
      <li v-for="entry in latest" :key="entry.id">
        <p>{{ entry.category }} <span aria-hidden="true">·</span> {{ entry.dateLabel }}</p>
        <a :href="withBase(entry.path)">{{ entry.title }}</a>
      </li>
    </ol>
  </section>
</template>
