<script setup lang="ts">
import { withBase } from 'vitepress'
import { data } from './people.data'
import profiles from '../../../data/people-profile-links.json'
const officialProfile = (name: string) => profiles.find(person => person.name === name)?.url
import wangPortrait from '../../../content/about/image/team/王培老师相片.png'
</script>

<template>
  <div class="people-directory">
    <div class="people-group-heading"><h3>创办人与专家组</h3><a :href="withBase('/about/team')">完整成员介绍与来源</a></div>
    <div class="people-featured">
      <article v-for="person in data.featured" :key="person.name" class="person-featured">
        <a class="person-portrait" :href="withBase(person.path)" :aria-label="`${person.name}的成员资料`">
          <img v-if="person.name === '王培'" :src="wangPortrait" alt="王培" loading="lazy" width="320" height="360" />
          <span v-else class="person-monogram"><span>{{ person.name }}</span><small>成员资料</small></span>
        </a>
        <div class="person-meta"><span>{{ person.role }}</span><a v-if="officialProfile(person.name)" :href="officialProfile(person.name)" target="_blank" rel="noopener noreferrer">学术主页<span class="sr-only">（新窗口）</span></a><a v-else :href="withBase(person.path)">成员资料</a></div>
        <div v-if="person.originalBio" class="person-original-bio" v-html="person.originalBio" />
        <h4 v-else><a :href="withBase(person.path)">{{ person.name }}</a></h4>
      </article>
    </div>
    <h3 class="people-secondary-title">秘书组</h3>
    <div class="people-secretariat">
      <article v-for="person in data.secretariat" :key="person.name" class="person-secretary">
        <div v-if="person.originalBio" class="person-original-bio" v-html="person.originalBio" />
        <h4 v-else>{{ person.name }}</h4>
        <a :href="withBase(person.path)">成员资料</a>
      </article>
    </div>
    <details class="people-members"><summary>会员组 <span>{{ data.members.length }} 位成员</span></summary><ul><li v-for="person in data.members" :key="person.name">{{ person.name }}</li></ul></details>
  </div>
</template>
