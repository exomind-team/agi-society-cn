import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { isDiscoverable } from '../../relations/index.mjs'

// Build from the Markdown tree, rather than maintain a second table of contents.
export interface KnowledgeNode { title: string; href: string; children: KnowledgeNode[]; count: number }
const root = path.resolve('content')
function page(file: string) {
  const { data, content } = matter(fs.readFileSync(file, 'utf8'))
  const compatibilityTitle: Record<string, string> = {'conference/annual/index.md':'年会总览（历史兼容页）','conference/group/index.md':'组会总览（历史兼容页）'}
  const title = compatibilityTitle[path.relative(root,file).replaceAll(path.sep,'/')] || data.title || data.sidebarTitle || content.match(/^#\s+(.+)$/m)?.[1] || path.basename(file, '.md')
  return { title: String(title).replace(/\*|`/g, ''), href: '/' + path.relative(root, file).replaceAll(path.sep, '/').replace(/\.md$/, '').replace(/\/index$/, '/'), order: Number(data.order ?? 999) }
}
function tree(dir: string): KnowledgeNode {
  const index = path.join(dir, 'index.md')
  const own = fs.existsSync(index) ? page(index) : {title: path.basename(dir), href: '', order:999}
  const children = fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
    const full = path.join(dir,entry.name)
    if(entry.isDirectory()) { const child=tree(full); return child.count ? [child] : [] }
    if(!entry.name.endsWith('.md') || entry.name === 'index.md') return []
    if (!isDiscoverable(matter(fs.readFileSync(full, 'utf8')).data)) return []
    return [{...page(full), children:[], count:1}]
  }).sort((a,b)=> ('order' in a ? Number(a.order) : 999)-('order' in b ? Number(b.order) : 999) || a.title.localeCompare(b.title,'zh-CN'))
  return {...own,children,count:children.reduce((sum,c)=>sum+c.count,fs.existsSync(index)?1:0)}
}
export default {
  watch: ['../../../content/**/*.md'],
  load() {
    const groups = [
      { id:'theory', title:'理论与概念', subtitle:'从基本预设到逻辑与认知架构', dirs:['research'] },
      { id:'implementations', title:'推理器实现', subtitle:'比较版本、语言与代码来源', dirs:['projects/nars_impl'] },
      { id:'applications', title:'应用与工具', subtitle:'连接环境、构建智能体与观察推理', dirs:['projects/nars_derivatives'] },
      { id:'thought', title:'思想书库', subtitle:'阅读不同作者的跨学科探索', dirs:['wiki/thought_library'] },
      { id:'conferences', title:'会议与报告', subtitle:'按年查阅议程、录像与原始材料', dirs:['conference'] },
    ].map(group=>({...group, nodes:group.dirs.map(dir=>tree(path.join(root,dir)))}))
    const included = new Set<string>()
    function collect(node: KnowledgeNode) { if (node.href) included.add(node.href); node.children.forEach(collect) }
    groups.forEach(group => group.nodes.forEach(collect))
    function remainder(node: KnowledgeNode): KnowledgeNode {
      const children = node.children.map(remainder).filter(child => child.count > 0)
      const href = included.has(node.href) ? '' : node.href
      return {...node, href, children, count: children.reduce((n, child) => n + child.count, href ? 1 : 0)}
    }
    const supplementary = remainder(tree(root))
    supplementary.title = '全站入口'
    supplementary.href = '/'
    return [...groups, {id:'site', title:'全站补充索引', subtitle:'协会、人物、联系、新闻与阅读入口', dirs:[], nodes:[supplementary]}]
  },
}
