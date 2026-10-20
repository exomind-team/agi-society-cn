<script setup lang="ts">
import { withBase } from 'vitepress'
import { data } from './people.data'
import profiles from '../../../data/people-profiles.json'
import identities from '../../../data/people-identities.json'
import { portraitUrl } from './people-profile-assets'
const people = [...profiles, ...identities]
const personFor = (name: string) => people.find(person => person.name === name || person.aliases?.includes(name))
const profileFor = (name: string) => profiles.find(person => person.name === name || person.aliases?.includes(name))
const personPath = (name: string) => {
  const person = personFor(name)
  return person ? '/wiki/people/' + person.id : ''
}
const profilePath = (name: string) => personPath(name) || '/about/team'
</script>

<template>
  <div class="people-directory">
    <div class="people-group-heading"><h3>创办人与专家组</h3><a :href="withBase('/about/people')">人物介绍与研究资料</a></div>
    <div class="people-featured">
      <article v-for="person in data.featured" :key="person.name" class="person-featured">
        <a v-if="portraitUrl(profileFor(person.name)?.portrait?.file)" class="person-portrait" :href="withBase(profilePath(person.name))" :aria-label="`阅读${person.name}的介绍`">
          <img v-if="portraitUrl(profileFor(person.name)?.portrait?.file)" :src="portraitUrl(profileFor(person.name)?.portrait?.file)" alt="" loading="lazy" width="400" height="400" />

        </a>
        <div class="person-meta"><span>{{ person.role }}</span></div>
        <h4><a :href="withBase(profilePath(person.name))">{{ person.name }}</a></h4>
        <p class="person-affiliation">{{ profileFor(person.name)?.affiliation }}</p>
        <p class="person-summary">{{ profileFor(person.name)?.summary }}</p>
        <a class="person-read-more" :href="withBase(profilePath(person.name))">人物独页与关联 <span aria-hidden="true">↗</span></a>
      </article>
    </div>
    <h3 class="people-secondary-title">秘书组</h3>
    <div class="people-secretariat">
      <article v-for="person in data.secretariat" :key="person.name" class="person-secretary" :data-person-id="personFor(person.name)?.id">
        <a v-if="portraitUrl(profileFor(person.name)?.portrait?.file)" class="secretary-portrait" :href="withBase(profilePath(person.name))" :aria-label="`阅读${person.name}的介绍与照片来源`">
          <img :src="portraitUrl(profileFor(person.name)?.portrait?.file)" alt="" loading="lazy" width="88" height="110" />
        </a>
        <div class="secretary-introduction">
        <div v-if="person.originalBio" class="person-original-bio" v-html="person.originalBio" />
        <h4 v-else>{{ person.name }}</h4>
        <a :href="withBase(personPath(person.name) || person.path)">{{ personPath(person.name) ? '人物独页与关联' : '查看成员介绍' }}</a>
        </div>
      </article>
    </div>
    <details class="people-members"><summary>会员组 <span>{{ data.members.length }} 位成员</span></summary><ul><li v-for="person in data.members" :key="person.name"><a v-if="personPath(person.name)" :href="withBase(personPath(person.name))">{{ person.name }}</a><span v-else>{{ person.name }}</span></li></ul></details>
    <p class="people-source-link"><a :href="withBase('/about/team')">协会完整名录与原有资料</a><span> · 照片版权归原权利人，按人物页标注来源使用，不适用本站文字许可。</span></p>
  </div>
</template>

<style scoped>
.person-secretary { display:flex; align-items:flex-start; gap:16px; min-width:0; }
.secretary-introduction { min-width:0; overflow-wrap:anywhere; }
.secretary-introduction>a { font-size:12px; display:inline-block; margin-top:10px; }
.person-secretary>.secretary-portrait { display:block; flex:0 0 88px; margin-top:0; overflow:hidden; border-radius:4px; background:var(--rp-soft); }
.secretary-portrait img { display:block; width:88px; height:110px; object-fit:contain; object-position:center; }
.secretary-portrait:focus-visible { outline:2px solid var(--rp-ink); outline-offset:4px; }
@media(max-width:360px) { .person-secretary { gap:12px; } .person-secretary>.secretary-portrait { flex-basis:64px; } .secretary-portrait img { width:64px; height:80px; } }
</style>
