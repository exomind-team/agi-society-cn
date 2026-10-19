<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
const back = ref(withBase('/#research-index'))
onMounted(() => {
  try {
    const saved = sessionStorage.getItem('agi-preview-return')
    if (saved) {
      const target = new URL(saved, location.origin)
      if (target.origin === location.origin && target.pathname === withBase('/') && target.hash === '#research-index') {
        back.value = target.pathname + target.search + target.hash
      }
    }
  } catch {}
})
</script>
<template><div class="preview-context"><a :href="back">‹ 返回研究索引</a><span>先锋体验版</span></div></template>
