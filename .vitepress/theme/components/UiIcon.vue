<script setup lang="ts">
import { computed } from 'vue'
import { uiIcons, type UiIconName } from './ui-icons'
const props = defineProps<{ name: UiIconName; label?: string }>()
const icon = computed(() => uiIcons[props.name] || uiIcons.book)
</script>
<template>
  <svg :viewBox="icon.viewBox" :aria-hidden="label ? undefined : true" :role="label ? 'img' : undefined" :aria-label="label" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path v-for="(path, index) in icon.paths" :key="index" :d="path" />
  </svg>
</template>
