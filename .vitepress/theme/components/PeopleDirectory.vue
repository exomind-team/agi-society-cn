<script setup lang="ts">
import { withBase } from 'vitepress'
import { data } from './people.data'
import profiles from '../../../data/people-profiles.json'
import { portraitUrl } from './people-profile-assets'
const profileFor = (name: string) => profiles.find(person => person.name === name)
const profilePath = (name: string) => '/wiki/people/' + profileFor(name)?.id
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
      <article v-for="person in data.secretariat" :key="person.name" class="person-secretary">
        <div v-if="person.originalBio" class="person-original-bio" v-html="person.originalBio" />
        <h4 v-else>{{ person.name }}</h4>
        <a :href="withBase(person.name === '李祥' ? profilePath(person.name) : person.path)">查看介绍</a>
      </article>
    </div>
    <details class="people-members"><summary>会员组 <span>{{ data.members.length }} 位成员</span></summary><ul><li v-for="person in data.members" :key="person.name">{{ person.name }}</li></ul></details>
    <p class="people-source-link"><a :href="withBase('/about/team')">协会完整名录与原有资料</a><span> · 照片版权归原权利人，按人物页标注来源使用，不适用本站文字许可。</span></p>
  </div>
</template>
