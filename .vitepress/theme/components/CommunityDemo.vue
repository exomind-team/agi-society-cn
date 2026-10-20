<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, withBase } from 'vitepress'
import markup from '../../community/template.html?raw'
import { mountDiscussion, COMMUNITY_SNAPSHOT } from '../../community/controller.mjs'
const host=ref<HTMLElement>(), route=useRoute()
function mount(){if(!host.value)return;const p=new URLSearchParams(location.search);const source=p.get('source');const reference=source?.startsWith('/')&&!source.startsWith('//')?{route:source,title:p.get('title')||source,anchor:p.get('anchor')||'',quote:p.get('quote')||'',snapshot:p.get('snapshot')||COMMUNITY_SNAPSHOT}:null;mountDiscussion({root:host.value,reference,storage:{getItem:(key:string)=>localStorage.getItem(key),setItem:(key:string,value:string)=>localStorage.setItem(key,value)},routeLink:(r:string,a:string)=>withBase(r)+(a?'#'+encodeURIComponent(a):''),exportFile:(s:string)=>{const u=URL.createObjectURL(new Blob([s],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='AGI-Wiki-讨论草稿.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}})}
onMounted(mount);watch(()=>route.path,async()=>{await nextTick();mount()})
</script>
<template><div ref="host" v-html="markup" /></template>
