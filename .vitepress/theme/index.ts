import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import { presetClient } from '@nolebase/integrations/vitepress/client'
import DocFooterLicense from './components/DocFooterLicense.vue'
import ResearchHome from './components/ResearchHome.vue'
import ResearchNews from './components/ResearchNews.vue'
import HomeNewsTeaser from './components/HomeNewsTeaser.vue'
import KnowledgeMap from './components/KnowledgeMap.vue'
import PeopleProfiles from './components/PeopleProfiles.vue'
import PeopleDirectory from './components/PeopleDirectory.vue'
import PreviewContext from './components/PreviewContext.vue'
import ConferenceCoverage from './components/ConferenceCoverage.vue'
import PageRelations from './components/PageRelations.vue'
import PersonProfile from './components/PersonProfile.vue'
import PaperIndex from './components/PaperIndex.vue'
import PeopleIndex from './components/PeopleIndex.vue'
import CommunityDemo from './components/CommunityDemo.vue'
import CommunityCitation from './components/CommunityCitation.vue'
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
      'nav-bar-title-after': () => h('span', { class: 'preview-badge', title: '独立开发预览；研究内容沿用公开资料' }, '先锋体验版'),
      'doc-before': () => [h(PreviewContext), h(ConferenceCoverage)],
      'doc-after': () => [h(PageRelations), h(CommunityCitation), h(PreviewDiscussion)],
      'doc-footer-before': () => h(DocFooterLicense),
    })
  },
  enhanceApp(ctx) {
    nolebase?.enhanceApp?.(ctx)
    ctx.app.component('CommunityDemo', CommunityDemo)
    ctx.app.component('PersonProfile', PersonProfile)
    ctx.app.component('PaperIndex', PaperIndex)
    ctx.app.component('PeopleIndex', PeopleIndex)
    ctx.app.component('ResearchHome', ResearchHome)
    ctx.app.component('ResearchNews', ResearchNews)
    ctx.app.component('HomeNewsTeaser', HomeNewsTeaser)
    ctx.app.component('PeopleDirectory', PeopleDirectory)
    ctx.app.component('PeopleProfiles', PeopleProfiles)
    ctx.app.component('KnowledgeMap', KnowledgeMap)
  },
} satisfies Theme
