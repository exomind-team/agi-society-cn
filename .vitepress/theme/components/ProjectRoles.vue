<script setup lang="ts">
import UiIcon from './UiIcon.vue'
import { withBase } from 'vitepress'
</script>
<template>
  <figure class="project-roles" aria-label="实验环境向推理内核提供感知输入，内核向环境返回操作；Core 与 Demo 是不同仓库">
    <div class="project-role-pair">
      <a :href="withBase('/learn/try')" class="project-role-node">
        <UiIcon name="environment" />
        <strong>实验环境</strong><span>Demo · 感知与反馈</span>
      </a>
      <div class="project-role-exchange" aria-hidden="true">
        <span>感知输入<UiIcon name="inputArrow" /></span>
        <span><UiIcon name="outputArrow" />操作输出</span>
      </div>
      <a :href="withBase('/projects/nars_impl/opennars304ts')" class="project-role-node">
        <UiIcon name="processor" />
        <strong>推理内核</strong><span>Core · 推理与控制</span>
      </a>
    </div>
    <figcaption>OpenNARS 304 TS：Core 与 Demo 分属不同仓库。<a :href="withBase('/projects/nars_impl/opennars304ts')">查看仓库与接口边界</a></figcaption>
  </figure>
</template>
<style scoped>
.project-roles { margin:24px 0; padding:22px 0; border-block:1px solid var(--vp-c-divider); }
.project-role-pair { display:grid; grid-template-columns:minmax(0,1fr) 110px minmax(0,1fr); align-items:center; gap:20px; }
.project-role-node { display:flex; flex-direction:column; align-items:center; gap:8px; padding:12px 6px; min-width:0; text-align:center; text-decoration:none!important; }
.project-role-node > svg { width:32px; height:32px; fill:none; stroke:currentColor; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
.project-role-node strong { font-size:16px; }
.project-role-node span, figcaption { font-size:12px; color:var(--vp-c-text-2); line-height:1.7; }
.project-role-exchange { display:flex; flex-direction:column; gap:12px; font-size:11px; text-align:center; color:var(--vp-c-text-2); }
.project-role-exchange svg { display:block; width:100%; height:16px; fill:none; stroke:currentColor; stroke-width:1.5; }
figcaption { margin-top:18px; text-align:center; }
.project-roles a:focus-visible { outline:2px solid var(--vp-c-brand-1); outline-offset:3px; }
@media(max-width:480px) { .project-role-pair { grid-template-columns:minmax(0,1fr) 64px minmax(0,1fr); gap:5px; } .project-role-node strong { font-size:14px; } .project-role-node span { font-size:11px; } }
</style>
