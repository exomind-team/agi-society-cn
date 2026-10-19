<script setup lang="ts">
import { useData } from 'vitepress'
import GiscusComments from './GiscusComments.vue'
const { theme } = useData()
</script>
<template>
  <p v-if="theme.previewEnvironment" class="preview-discussion-note">先锋体验版暂不连接正式站讨论区。正文编辑入口仍指向本开发分支。</p>
  <GiscusComments v-else />
</template>
