import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import { presetClient } from '@nolebase/integrations/vitepress/client'
import DocFooterLicense from './components/DocFooterLicense.vue'
import ResearchHome from './components/ResearchHome.vue'
import PreviewContext from './components/PreviewContext.vue'
import PreviewDiscussion from './components/PreviewDiscussion.vue'

import './styles/custom.css'

const nolebase = presetClient({
  enhancedReadabilities: true,
  highlightTargetedHeading: true,
  inlineLinkPreview: false,
  enhancedMark: true,
  pageProperties: true,
  gitChangelog: false,
  thumbnailHash: false,
  index: false,
})

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'home-hero-before': () => h(ResearchHome),
      'nav-bar-title-after': () => h('span', { class: 'preview-badge', title: '独立开发预览；研究内容沿用公开资料' }, '先锋体验版'),
      'doc-before': () => h(PreviewContext),
      'doc-after': () => h(PreviewDiscussion),
      'doc-footer-before': () => h(DocFooterLicense),
    })
  },
  enhanceApp(ctx) {
    nolebase?.enhanceApp?.(ctx)
    ctx.app.component('ResearchHome', ResearchHome)
  },
} satisfies Theme
