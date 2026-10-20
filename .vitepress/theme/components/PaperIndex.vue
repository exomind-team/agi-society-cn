<script setup lang="ts">
import { withBase } from 'vitepress'
import { data } from './relations.data'
const papers = data.nodes.filter(node => node.file.startsWith('wiki/papers/') && !node.file.endsWith('/index.md'))
</script>
<template><ul><li v-for="paper in papers" :key="paper.href"><a :href="withBase(paper.href)">{{ paper.title }}</a></li></ul></template>
