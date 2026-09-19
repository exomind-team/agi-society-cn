import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_PATH = path.join(ROOT, 'data', 'nars-implementations.json')
const OUTPUT_PATH = path.join(ROOT, 'content', 'projects', 'nars_impl', 'catalog.md')
const WRITE = process.argv.includes('--write')

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
const escapeCell = (value) => String(value ?? '未知').replaceAll('|', '\\|').replaceAll('\n', '<br>')
const link = (label, url) => `[${label}](${url})`
const repositoryCell = (entry) => link('仓库', entry.repository)
const pageCell = (entry) => entry.page ? `[[${entry.page}|${entry.name}]]` : entry.name
const runCell = (entry) => entry.runDemo || '未知'
const nalCell = (entry) => entry.narseseNal || '未知'
const notes = data.entries.map((entry) => {
  const page = entry.page ? `[[${entry.page}|项目页]]` : '暂无独立项目页'
  return `- ${pageCell(entry)}：${entry.notes}（${page}）`
}).join('\n')

const rows = data.entries.map((entry) => [
  pageCell(entry),
  entry.generation,
  entry.languages.join(' / '),
  repositoryCell(entry),
  entry.license,
  nalCell(entry),
  runCell(entry),
  entry.latestPublicCommit,
  entry.maintenanceStatus,
  data.lastVerified,
].map(escapeCell))

const table = [
  '| 实现 | 实现对象/代际 | 语言 | 代码仓库 | 许可证 | Narsese / NAL 资料边界 | 运行或 Demo | 最近公开提交 | 维护状态 | 核验日期 |',
  '|---|---|---|---|---|---|---|---|---|---|',
  ...rows.map((row) => `| ${row.join(' | ')} |`),
].join('\n')

const output = `---\ntitle: NARS 实现基础资料总表\ncomments: true\n---\n\n# NARS 实现基础资料总表\n\n本表是 NARS 各实现的基础资料集中索引，数据源为 data/nars-implementations.json。字段只记录本轮从项目 README、官方仓库元数据或用户提供资料中确认的事实；未知字段保持“未知”，不根据公开提交日期推断维护状态。\n\n> [!info] 核验边界\n> 最近公开提交日期只表示仓库元数据观察值，不等同于项目维护状态。NAL 覆盖范围只有在 README、测试材料或源码中明确出现时才写入。\n\n**最后核验：** ${data.lastVerified}\n\n${table}\n\n## 项目备注\n\n${notes}\n\n## 后续资料采集\n\n- 代码级控制机制资料见 [[research/nars/theory/nac/source-materials|非公理控制原始资料索引]]。\n- 年会、组会与实现演示的关联资料仍以各会议页面为准。\n- 更新 data/nars-implementations.json 后执行 npm run nars:catalog；B 站视频候选使用 npm run audit:bilibili。\n`

if (WRITE) fs.writeFileSync(OUTPUT_PATH, output, 'utf8')
else process.stdout.write(output)

console.log(JSON.stringify({ write: WRITE, entries: data.entries.length, output: path.relative(ROOT, OUTPUT_PATH) }))
