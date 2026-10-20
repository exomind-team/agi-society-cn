<script setup lang="ts">
import { withBase } from 'vitepress'
import { data } from './relations.data'
</script>
<template><ul class="people-index"><li v-for="person in data.people" :key="person.id"><a :href="withBase(person.href)">{{ person.name }}</a><p>{{ person.summary }}</p></li></ul></template>
