import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_PATH = path.join(ROOT, 'data', 'nars-implementations.json')
const PAGES_DIR = path.join(ROOT, 'content', 'projects', 'nars_impl')
const WRITE = process.argv.includes('--write')
const START = '<!-- BEGIN GENERATED NARS PROFILE -->'
const END = '<!-- END GENERATED NARS PROFILE -->'

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
const clean = (value) => String(value ?? '未知').replaceAll('|', '\\|').replaceAll('\n', '<br>')
const link = (label, url) => `[${label}](${url})`

function renderProfile(entry) {
  const language = entry.languages.join(' / ')
  return [
    START,
    '',
    '## 基础资料',
    '',
    '> 本节由 data/nars-implementations.json 生成；项目特有教程和源码观察仍在本页维护。',
    '',
    '| 字段 | 已核验信息 |',
    '|---|---|',
    `| 代际 / 定位 | ${clean(entry.generation)} |`,
    `| 编程语言 | ${clean(language)} |`,
    `| 作者 / 维护组织 | ${clean(entry.maintainers)} |`,
    `| 代码仓库 | ${link('仓库', entry.repository)} |`,
    `| 许可证 | ${clean(entry.license)} |`,
    `| Narsese / NAL 边界 | ${clean(entry.narseseNal)} |`,
    `| 运行 / Demo | ${clean(entry.runDemo)} |`,
    `| 最近公开提交 | ${clean(entry.latestPublicCommit)}（仅为仓库元数据观察值） |`,
    `| 维护状态 | ${clean(entry.maintenanceStatus)} |`,
    `| 最后核验 | ${clean(data.lastVerified)} |`,
    '',
    END,
  ].join('\n')
}

function insertOrReplace(source, block) {
  const marker = new RegExp(`${START}[\\s\\S]*?${END}`)
  if (marker.test(source)) return source.replace(marker, block)
  const heading = source.match(/^# .+$/m)
  if (!heading || heading.index === undefined) throw new Error('Page has no level-one heading')
  const insertAt = heading.index + heading[0].length
  return `${source.slice(0, insertAt)}\n\n${block}${source.slice(insertAt)}`
}

const changed = []
for (const entry of data.entries) {
  if (!entry.page) throw new Error(`${entry.id} has no page; every indexed implementation now needs a page`)
  const filePath = path.join(PAGES_DIR, `${entry.page}.md`)
  if (!fs.existsSync(filePath)) throw new Error(`Missing page for ${entry.id}: ${filePath}`)
  const before = fs.readFileSync(filePath, 'utf8')
  const after = insertOrReplace(before, renderProfile(entry))
  if (after !== before) {
    changed.push(path.relative(ROOT, filePath))
    if (WRITE) fs.writeFileSync(filePath, after, 'utf8')
  }
}

console.log(JSON.stringify({ write: WRITE, entries: data.entries.length, changed }, null, 2))
