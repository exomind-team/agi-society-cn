<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import coverage from '../../../data/conference-coverage.json'
const { page } = useData()
const record = computed(() => coverage.find(item => item.file === page.value.relativePath))
</script>
<template><details v-if="record" class="conference-coverage"><summary>资料覆盖与核对范围</summary><p>本地目录核对：{{ record.localAuditAt }}。{{ record.status }}。本地核对不等于视频内容核验，也不保证最新完整。</p><p v-if="record.lastVerified">既有来源核验记录：{{ record.lastVerified }}；本轮未将其刷新为今天。</p><p v-else>未记录本轮逐项外部核验日期。</p><p v-if="record.blocked">本轮外部读取受阻，未据此补入新视频。</p></details></template>
