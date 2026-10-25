<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import profiles from '../../../data/people-profiles.json'
import identities from '../../../data/people-identities.json'
import PeopleProfiles from './PeopleProfiles.vue'
const { frontmatter } = useData()
const person = computed(() => [...profiles, ...identities].find(p => p.id === frontmatter.value.personId))
const hasProfile = computed(() => profiles.some(p => p.id === frontmatter.value.personId))
</script>
<template><div v-if="person"><PeopleProfiles v-if="hasProfile" :person-id="person.id" /><p v-else>{{ person.summary }}</p><a :href="withBase('/wiki/people/')">所有人物</a></div></template>
