<script setup lang="ts">
import { computed, onMounted, watch, nextTick, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { COMMUNITY_SNAPSHOT, readDrafts } from '../../community/controller.mjs'
const {page,frontmatter}=useData()
const related=ref<any[]>([])
function refresh(){const ps=Array.from(document.querySelectorAll('.vp-doc p'));ps.forEach((p,i)=>{if(!p.id)p.id='community-p-'+i});const route='/'+page.value.relativePath.replace(/\.md$/,'').replace(/(^|\/)index$/,'$1');try{related.value=readDrafts(localStorage).filter(d=>d.reference?.route===route)}catch{related.value=[]}if(location.hash.startsWith('#community-p-'))document.getElementById(location.hash.slice(1))?.scrollIntoView()}
onMounted(refresh);watch(()=>page.value.relativePath,async()=>{await nextTick();refresh()})
const visible=computed(()=>frontmatter.value.discovery!=='unlisted'&&!page.value.relativePath.startsWith('community.'))
function cite(){const ps=Array.from(document.querySelectorAll('.vp-doc p'));ps.forEach((p,i)=>{if(!p.id)p.id='community-p-'+i});const selection=window.getSelection();const node=selection?.anchorNode;const element=node?.nodeType===1?node as Element:node?.parentElement;const p=element?.closest('.vp-doc p')||ps[0];const source='/'+page.value.relativePath.replace(/\.md$/,'').replace(/(^|\/)index$/,'$1');const params=new URLSearchParams({source,title:page.value.title,anchor:p?.id||'',quote:(p?.textContent||'').trim().slice(0,800),snapshot:COMMUNITY_SNAPSHOT});location.href=withBase('/community')+'?'+params.toString()}
</script>
<template><aside v-if="visible" class="community-cite"><button @click="cite">引用本页／选中段落到讨论</button><a :href="withBase('/community')">社区演示</a><small> · 仅本机草稿，不发布</small><details v-if="related.length"><summary>本机相关讨论草稿 · {{related.length}}</summary><p v-for="draft in related" :key="draft.id"><a :href="withBase('/community')">{{draft.title}}（未发布）</a></p></details></aside></template>
