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
<template><div v-if="person"><PeopleProfiles v-if="hasProfile" :person-id="person.id" /><p v-else>{{ person.summary }}</p><details class="person-identity"><summary>身份与资料边界</summary><p>人物标识：{{ person.id }}。本页不自动合并同名学者或社交账号。</p></details><a :href="withBase('/wiki/people/')">所有人物</a></div></template>
