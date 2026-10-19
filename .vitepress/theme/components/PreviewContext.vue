<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, withBase } from 'vitepress'
const route = useRoute()
const isNews = computed(() => [withBase('/news/'), withBase('/news')].includes(route.path))
const back = ref(withBase('/news#research-index'))
function restore() {
  back.value = isNews.value ? withBase('/') : withBase('/news#research-index')
  if (isNews.value || typeof location === 'undefined') return
  try {
    const saved = sessionStorage.getItem('agi-preview-return')
    if (saved) {
      const target = new URL(saved, location.origin)
      if (target.origin === location.origin && [withBase('/'), withBase('/news/'), withBase('/news')].includes(target.pathname) && target.hash === '#research-index') {
        // Migrate saved links from the old home feed to its dedicated route.
        back.value = withBase('/news') + target.search + target.hash
      }
    }
  } catch {}
}
onMounted(restore)
watch(() => route.path, restore, { immediate: true })
</script>
<template><div class="preview-context"><a :href="back">{{ isNews ? '‹ 返回首页' : '‹ 返回新闻动态' }}</a><span>先锋体验版</span></div></template>
