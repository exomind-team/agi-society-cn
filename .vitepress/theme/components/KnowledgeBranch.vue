<script setup lang="ts">
import { withBase } from 'vitepress'
import type { KnowledgeNode } from './knowledge.data'
defineProps<{ node: KnowledgeNode }>()
</script>
<template>
  <li>
    <details v-if="node.children.length" :data-map-id="node.href || node.title">
      <summary><span>{{ node.title }}</span><small>{{ node.count }} 篇</small></summary>
      <div class="knowledge-branch-body">
        <a v-if="node.href" class="knowledge-overview" :href="withBase(node.href)">阅读概览 <span aria-hidden="true">↗</span></a>
        <ul><KnowledgeBranch v-for="child in node.children" :key="child.href || child.title" :node="child" /></ul>
      </div>
    </details>
    <a v-else :href="withBase(node.href)">{{ node.title }}</a>
  </li>
</template>
