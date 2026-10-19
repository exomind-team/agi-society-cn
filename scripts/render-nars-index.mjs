import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_PATH = path.join(ROOT, 'data', 'nars-implementations.json')
const OUTPUT_PATH = path.join(ROOT, 'content', 'projects', 'nars_impl', 'index.md')
const WRITE = process.argv.includes('--write')

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
// 表格单元格里所有 `|` 都必须转义成 `\|`，否则 markdown-it 会把它们当成列分隔符破坏表格。
// 所有渲染到单元格的字符串最后都要走 escapeCell。
const escapeCell = (s) => String(s ?? '').replaceAll('|', '\\|')
const pageCell = (entry) => entry.page ? `[[${entry.page}|${entry.name}]]` : entry.name
const projectCell = (entry) => entry.page ? `[[${entry.page}|项目页]]` : '暂无独立页面'
const repositoryCell = (entry) => entry.repository ? `[仓库](${entry.repository})` : ''
// 项目可见状态。状态值与 emoji + 文案映射。
const STATUS_LABELS = {
  public:  '🟢 公开',
  private: '🔴 内部',
  unknown: '🟡 待核实',
}
const statusCell = (entry) => STATUS_LABELS[entry.publicStatus] ?? STATUS_LABELS.unknown

// 说明：项目首次公开发布日期（firstPublicAt）尚未确立可靠字段；JSON 里有 repoCreatedAt
// 仅记录仓库平台创建日，二者不等价。本表暂按 JSON entries 原顺序展示，待首发日期核实后再排序。
const rows = data.entries.map((entry) => {
  const language = (entry.languages ?? []).join(' / ') || '未知'
  const author = entry.maintainers ?? '未声明'
  const repoPart = repositoryCell(entry)
  const tail = repoPart ? `${escapeCell(projectCell(entry))}；${escapeCell(repoPart)}` : escapeCell(projectCell(entry))
  return `| ${escapeCell(pageCell(entry))} | ${escapeCell(entry.generation)} | ${escapeCell(language)} | ${escapeCell(author)} | ${tail} | ${escapeCell(statusCell(entry))} |`
})

const output = `---
comments: true
---

# NARS各版实现 索引

本页是 NARS 各版实现的入口索引。每个项目页保存该实现自己的基础资料、运行方式、教程、截图和源码观察；不再另设一张重复维护的大型资料表。

> [!info] 资料口径
> 页面中的“基础资料”由 data/nars-implementations.json 维护，并通过 npm run nars:catalog 分发到各项目页。字段只记录已核验事实；未知字段保留“未知”，不根据提交日期推断维护状态。

**最后核验：** ${data.lastVerified}

## 实现索引

| 实现 | 代际 / 定位 | 语言 | 作者 / 维护者 | 页面与代码 | 状态 |
|---|---|---|---|---|---|
${rows.join('\n')}

## 资料与理论入口

- [[introduction|NARS各版实现介绍]]：历史脉络与入门说明。
- [[research/nars/theory/nac/source-materials|非公理控制原始资料索引]]：理论、论文、源码和具体会议报告入口。
- [Temple AGI Team](https://cis.temple.edu/tagit/#projects)：公开项目、论文、演示和活动资料。

## 版本收录与投稿

> [!question] 需要添加自己的版本？
>
> 若实现者有自己的一版 NARS 实现，可[在 GitHub 提 issue](https://github.com/exomind-team/agi-society-cn/issues/new)，或在文末评论区发言。投稿前请提供代码仓库、Narsese/NAL 范围和可运行 Demo；缺少可靠资料的字段保持“未知”。
`

if (WRITE) fs.writeFileSync(OUTPUT_PATH, output, 'utf8')
else process.stdout.write(output)

console.log(JSON.stringify({ write: WRITE, entries: data.entries.length, output: path.relative(ROOT, OUTPUT_PATH) }))
