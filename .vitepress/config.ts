import { defineConfig } from 'vitepress'
import path from 'node:path'
import matter from 'gray-matter'
import { isDiscoverable, annotateConferenceRows } from './relations/index.mjs'
import { annualOverview, conferenceOverviewBody } from './relations/conference.mjs'
import { writeFileSync, readFileSync } from 'node:fs'
import { presetMarkdownIt } from '@nolebase/integrations/vitepress/markdown-it'
import { GitChangelog } from '@nolebase/vitepress-plugin-git-changelog/vite'
import { PageProperties } from '@nolebase/vitepress-plugin-page-properties/vite'
import obsidianCallouts from 'markdown-it-obsidian-callouts'
import markdownItMark from 'markdown-it-mark'
import { generateSidebar, hasSidebarChanged, commitSidebarUpdate } from './sidebar'

const siteBase = process.env.VITEPRESS_BASE ?? '/agi-society-cn/'
const previewEditBranch = process.env.VITEPRESS_EDIT_BRANCH ?? 'dot/dev-agi-society-cn-20261019'

const nolebaseMD = presetMarkdownIt({
  bidirectionalLinks: {
    options: { dir: path.join(process.cwd(), 'content'), isRelativePath: true },
  },
  unlazyImages: false,
  inlineLinkPreview: false,
})

export default defineConfig({
  lang: 'zh-CN',
  title: '中国通用人工智能协会',
  description: '中国通用人工智能协会 — 研究、教育、学术交流与开放知识',
  srcDir: './content',
  outDir: './dist',
  base: siteBase,
  ignoreDeadLinks: true,
  cleanUrls: true,
  transformPageData(pageData) {
    if (!isDiscoverable(pageData.frontmatter)) {
      Object.assign(pageData.frontmatter, { search: false, comments: false, sidebar: false, sidebarHide: true, sitemap: false, prev: false, next: false, editLink: false, lastUpdated: false })
      pageData.frontmatter.head = [...(pageData.frontmatter.head || []), ['meta', { name: 'robots', content: 'noindex, nofollow' }]]
    }
  },

  // CRITICAL: optimizeDeps.exclude 避免 Vite dev 模式预打包含 virtual module 的 Nólëbase 包
  vite: {
    publicDir: './public',
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
      },
    },
    plugins: [
      // Dev: poll every 2s; if sidebar changed → update cache + touch sidebar.ts → config reload
      {
        name: 'sidebar-dev-watch',
        configureServer(server) {
          const sidebarPath = path.join(process.cwd(), '.vitepress', 'sidebar.ts')
          setInterval(() => {
            // 1. Detection: has the sidebar structure actually changed?
            if (hasSidebarChanged()) {
              // 2. Action: commit the new sidebar + trigger reload
              commitSidebarUpdate()
              const content = readFileSync(sidebarPath, 'utf-8')
              writeFileSync(sidebarPath, content)
              server.ws.send({ type: 'full-reload' })
            }
          }, 2000)
        },
      },
      GitChangelog({
        include: ['**/*.md', '!node_modules'],
        repoURL: 'https://github.com/exomind-team/agi-society-cn',
        maxGitLogCount: 2000,
      }),
      PageProperties(),
    ],
    optimizeDeps: {
      exclude: [
        'vitepress',
        '@nolebase/integrations',
        '@nolebase/ui',
        '@nolebase/vitepress-plugin-git-changelog',
        '@nolebase/vitepress-plugin-page-properties',
        '@nolebase/vitepress-plugin-enhanced-readabilities',
        '@nolebase/vitepress-plugin-enhanced-mark',
        '@nolebase/vitepress-plugin-highlight-targeted-heading',
        '@nolebase/vitepress-plugin-inline-link-preview',
        '@nolebase/vitepress-plugin-index',
        '@nolebase/vitepress-plugin-thumbnail-hash',
      ],
    },
    ssr: {
      noExternal: ['@nolebase/**'],
    },
  },

  markdown: {
    math: true,
    async preConfig(md) {
      await nolebaseMD.install(md)
    },
    config(md) {
      md.core.ruler.after('inline', 'conference-report-anchors', state => {
        if (state.env.relativePath?.startsWith('conference/')) annotateConferenceRows(state.tokens)
      })
      // Render the existing archive tables directly on the conference landing page.
      // Original Markdown remains authoritative and its old URLs remain readable.
      md.core.ruler.before('normalize', 'conference-parent-overview', (state) => {
        if (state.env.relativePath === 'conference/annual/index.md') {
          state.src = state.src.replace(/(## 年会列表)[\s\S]*$/, '$1\n\n' + annualOverview(path.resolve('content')))
          return
        }
        if (state.env.relativePath === 'conference/group/index.md') {
          state.src = state.src.replace(/(## 学年索引)[\s\S]*$/, '$1\n\n' + conferenceOverviewBody({root: path.resolve('content'), kind: 'group'}))
          return
        }
        if (state.env.relativePath !== 'conference/index.md') return
        for (const kind of ['annual', 'group']) {
          const body = conferenceOverviewBody({root: path.resolve('content'), kind})
          if (!body) throw new Error(`Missing conference source marker: ${kind}`)
          const resolved = body.replace(/\[\[([^\]]+)\]\]/g, (_, value) => {
            const [target, label] = value.replace(/\\\|/g, '|').split('|')
            return `[${label || target}](/conference/${kind}/${target})`
          }).replace(/^## /gm, '### ')
          state.src = state.src.replace(`<ConferenceYears kind="${kind}" />`, `<div class="conference-overview conference-${kind}">\n\n${resolved}\n\n</div>`)
        }
      })
      md.core.ruler.before('normalize', 'homepage-people-view', (state) => {
        if (state.env.relativePath !== 'index.md') return
        state.src = state.src.replace(/<div class="team-grid">[\s\S]*?(?=\n<\/section>)/, '<PeopleDirectory />\n')
      })
      md.use(obsidianCallouts)
      md.use(markdownItMark)
    },
  },

  themeConfig: {
    siteTitle: 'AGI Society CN',
    previewEnvironment: process.env.VITEPRESS_PREVIEW === 'true',
    logo: '/logo.png',
    nav: [
      { text: '首页', link: '/' },
      { text: '学习与知识', link: '/learn/map' },
      { text: '研究与项目', items: [
        { text: '研究方向', link: '/research/' },
        { text: '选择项目', link: '/learn/projects' },
        { text: '推理器实现', link: '/projects/nars_impl/' },
        { text: '应用与工具', link: '/projects/nars_derivatives/' },
      ] },
      { text: '会议与交流', link: '/conference/' },
      { text: '社区 · 演示', link: '/community' },
      { text: '新闻动态', link: '/news' },
      { text: '关于与联系', items: [
        { text: '协会简介', link: '/about/' },
        { text: '研究团队', link: '/contact/team' },
        { text: '联系我们', link: '/contact/' },
        { text: '贡献指南', link: '/contact/contributing/' },
      ] },
    ],

    sidebar: generateSidebar(),

    socialLinks: [
      { icon: 'github', link: 'https://github.com/exomind-team/agi-society-cn' },
    ],

    search: {
      provider: 'local',
      options: {
        _render(src, env, md) {
          if (!isDiscoverable(matter(src).data)) return ''
          const html = md.render(src, env)
          return env.frontmatter?.search === false ? '' : html
        },
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索文档',
          },
          modal: {
            displayDetails: '显示详情',
            noResultsText: '未找到相关结果',
            resetButtonTitle: '清除搜索',
            footer: {
              selectText: '选择',
              closeText: '关闭',
            },
          },
        },
      },
    },

    editLink: {
      pattern: process.env.VITEPRESS_PREVIEW === 'true'
        ? `https://github.com/exomind-team/agi-society-cn/edit/${previewEditBranch}/content/:path`
        : 'https://github.com/exomind-team/agi-society-cn/edit/main/content/:path',
      text: '在 GitHub 上编辑此页',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    lastUpdated: {
      text: '最后更新于',
    },

    outline: {
      label: '页面大纲',
      level: [2, 3],
    },

    darkModeSwitchLabel: '切换主题',
  },
})
