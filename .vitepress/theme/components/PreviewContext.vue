<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
const back = ref(withBase('/#research-index'))
onMounted(() => {
  try {
    const saved = sessionStorage.getItem('agi-preview-return')
    if (saved && saved.startsWith(withBase('/')) && !saved.startsWith('//')) back.value = saved
  } catch {}
})
</script>
<template><div class="preview-context"><a :href="back">‹ 返回研究索引</a><span>先锋体验版</span></div></template>
