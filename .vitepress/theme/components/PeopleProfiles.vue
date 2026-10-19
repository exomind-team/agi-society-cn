<script setup lang="ts">
import { withBase } from 'vitepress'
import { onMounted } from 'vue'
import profiles from '../../../data/people-profiles.json'
import { data } from './people.data'
import { portraitUrl } from './people-profile-assets'
function revealSource(id: string) {
  const item = document.getElementById(id)
  const details = item?.closest('details')
  if (details) details.open = true
}
onMounted(() => { if (location.hash) revealSource(decodeURIComponent(location.hash.slice(1))) })
const roleFor = (name: string) => data.featured.find(person => person.name === name)?.role
</script>
<template>
  <div class="people-profiles">
    <nav class="profile-jump" aria-label="选择人物"><a v-for="person in profiles" :key="person.id" :href="'#'+person.id">{{ person.name }}</a></nav>
    <article v-for="person in profiles" :key="person.id" class="full-person" :aria-labelledby="person.id">
      <header class="full-person-header">
        <figure v-if="portraitUrl(person.portrait?.file)"><img :src="portraitUrl(person.portrait.file)" :alt="person.name" loading="lazy" width="400" height="400" /><figcaption><a :href="person.portrait.sourceUrl.startsWith('/') ? withBase(person.portrait.sourceUrl) : person.portrait.sourceUrl">照片来源</a><span v-if="person.portrait.caption"> · {{ person.portrait.caption }}</span></figcaption></figure>
        <div><p class="profile-role">{{ roleFor(person.name) }} · 中国通用人工智能协会</p><h2 :id="person.id">{{ person.name }}</h2><p class="profile-affiliation">{{ person.affiliation }}</p><p>{{ person.summary }}</p><p class="profile-verified">资料核验：{{ person.verifiedOn }}</p></div>
      </header>
      <p v-if="person.identityBoundary" class="profile-boundary">{{ person.identityBoundary }}</p>
      <section v-for="section in person.sections" :key="section.title" class="profile-section">
        <h3>{{ section.title }}</h3>
        <ul><li v-for="(item, i) in section.items" :key="i"><span v-if="item.timeScope" class="profile-time">{{ item.timeScope }}</span>{{ item.text }} <span class="profile-citations"><a v-for="source in item.sources" :key="source" :href="'#'+person.id+'-source-'+source" @click="revealSource(person.id+'-source-'+source)" :aria-label="`${person.name}：查看来源 ${source}`">[{{ source }}]</a></span></li></ul>
      </section>
      <nav v-if="person.related?.length" class="profile-related" :aria-label="person.name+'的相关资料'"><a v-for="link in person.related" :key="link.href" :href="link.href.startsWith('/') ? withBase(link.href) : link.href">{{ link.label }} <span aria-hidden="true">↗</span></a></nav>
      <details class="profile-sources"><summary>来源、核验与照片说明</summary><ol><li v-for="source in person.sources" :id="person.id+'-source-'+source.id" :key="source.id"><a :href="source.url.startsWith('/') ? withBase(source.url) : source.url">{{ source.label }}</a><span> · 核验 {{ source.observedOn }}</span></li></ol><p v-if="person.portrait?.rights">{{ person.portrait.rights }}</p><p v-if="person.limitations">{{ person.limitations }}</p></details>
    </article>
  </div>
</template>
