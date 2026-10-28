<script setup lang="ts">
import { withBase } from 'vitepress'
import poster from '../../../content/conference/image/2026/2026年会.jpg'
import HomeNewsTeaser from './HomeNewsTeaser.vue'
</script>

<template>
  <div class="research-home association-home">
    <header class="research-masthead">
      <div class="research-masthead-main">
        <img class="research-home-logo" :src="withBase('/logo.png')" alt="AGI 协会彩色标志" width="1058" height="1058" fetchpriority="high" />
        <div class="research-masthead-copy"><p class="research-brand">AGI Society CN <span>中国通用人工智能协会</span></p><h1>通用人工智能的研究与实践</h1></div>
      </div>
      <p class="research-intro">中国通用人工智能协会<br>会议记录、理论原文与开源实践</p>
    </header>
    <div class="research-layout">
      <main class="research-main">
        <section class="research-feature" aria-labelledby="feature-title">
          <div class="feature-copy">
            <p class="research-meta"><span class="research-kind">年会档案</span><time datetime="2026-07-18">2026 年 7 月 18–19 日</time></p>
            <h2 id="feature-title">第十一届年会：<br>报告、录像与议程</h2>
            <p>王培的「符号如何获得含义」、人工认知生命项目进展等报告，已按议程整理在年会档案中。可以先找感兴趣的题目，再看对应录像。</p>
            <a class="research-primary" :href="withBase('/conference/annual/2026')">阅读 2026 年会档案 <span aria-hidden="true">↗</span></a>
            <p class="research-note">武汉理工大学南湖校区 · 已举办<br>部分分论坛录像暂缺，完整议程与缺项说明保留在档案中。</p>
          </div>
          <a class="feature-poster" :href="withBase('/conference/annual/2026#年会海报')" aria-label="查看 2026 年会原始海报与议程"><img :src="poster" alt="第十一届中国通用人工智能年会原始海报" width="1086" height="1448" /></a>
        </section>

        <!-- The complete homepage continues in the same main column as the lead. -->
        <div class="home-body vp-doc"><slot /></div>
      </main>
      <aside class="research-rail" aria-label="知识与会议导航">
        <HomeNewsTeaser variant="rail" />
        <slot name="conference" />
        <section><h2>思想书库</h2><p>这里收录不同作者对智能的理解。阅读时请留意各自的概念、前提和论述。</p><a :href="withBase('/wiki/thought_library/')">打开思想书库</a></section>
      </aside>
    </div>
    <footer class="research-bottom home-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>
