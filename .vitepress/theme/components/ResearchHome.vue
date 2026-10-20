<script setup lang="ts">
import { withBase } from 'vitepress'
import poster from '../../../content/conference/image/2026/2026年会.jpg'
</script>

<template>
  <div class="research-home">
    <header class="research-masthead">
      <div><p class="research-brand">AGI Society CN <span>中国通用人工智能协会</span></p><h1>通用人工智能的研究与实践</h1></div>
      <p class="research-intro">中国通用人工智能协会<br>会议记录、理论原文与开源实践</p>
    </header>
    <div class="research-layout">
      <div class="research-main">
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

        <nav class="home-quick-nav" aria-label="快速导航">
          <a :href="withBase('/learn/map')"><strong>开始学习</strong><span>读基本概念，试一个例子</span></a>
          <a :href="withBase('/learn/projects')"><strong>查阅项目</strong><span>按用途找实现、工具与源码</span></a>
          <a :href="withBase('/conference/')"><strong>会议与交流</strong><span>年会回顾、组会记录与材料</span></a>
        </nav>
      </div>
      <aside class="research-rail" aria-label="知识与会议导航">
        <section><h2>从哪里读起</h2><a class="knowledge-path" :href="withBase('/research/nars/theory/aikr')"><span>理论起点</span><strong>有限知识与资源下的智能</strong><small>AIKR：NARS 从什么假设出发</small></a><a class="knowledge-path" :href="withBase('/research/nars/theory/')"><span>理论目录</span><strong>NARS 理论</strong><small>概念、逻辑与认知架构</small></a><a class="knowledge-path" :href="withBase('/projects/nars_impl/')"><span>工程实践</span><strong>NARS 实现索引</strong><small>语言、版本与原始代码仓库</small></a></section>
        <section class="conference-shelf"><h2>会议书架</h2><p class="shelf-years">2016 <span aria-hidden="true">—</span> 2026</p><p>十一届年会的议程、报告与录像，按年份查阅。</p><a :href="withBase('/conference/annual/')">历届年会</a><a :href="withBase('/conference/group/')">学术组会</a></section>
        <section><h2>思想书库</h2><p>这里收录不同作者对智能的理解。阅读时请留意各自的概念、前提和论述。</p><a :href="withBase('/wiki/thought_library/')">打开思想书库</a></section>
        <section class="research-contribute"><h2>补充与修正</h2><p>缺了出处，链接打不开，或有值得补入的研究材料，都可以附上来源提交修改。</p><a :href="withBase('/contact/contributing/formats')">查看贡献指南</a></section>
      </aside>
    </div>
    <footer class="research-bottom"><span>开放阅读 · 内容采用 CC BY-SA 4.0</span><a :href="withBase('/about/')">关于协会</a><a :href="withBase('/contact/team')">全部团队成员与学术主页</a><a :href="withBase('/contact/')">联系与参与</a></footer>
  </div>
</template>
