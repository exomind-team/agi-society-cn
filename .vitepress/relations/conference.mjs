import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

/** The archive files determine membership; historic index rows retain their editorial metadata. */
export function annualOverview(root) {
  const dir = path.join(root, 'conference/annual')
  const source = fs.readFileSync(path.join(dir, 'index.md'), 'utf8')
  const rows = new Map([...source.matchAll(/^\|\s*\[\[(\d{4})\\\|[^\n]+$/gm)].map(match => [match[1], match[0]]))
  const years = fs.readdirSync(dir).filter(file => /^\d{4}\.md$/.test(file)).map(file => file.slice(0,4)).sort().reverse()
  return ['| 届次 | 时间 | 地点 | 备注 |', '| --- | --- | --- | --- |', ...years.map(year => {
    if (rows.has(year)) return rows.get(year)
    const { data } = matter(fs.readFileSync(path.join(dir, year + '.md'), 'utf8'))
    return `| [[${year}\\|${data.sidebarTitle || year}]] | ${data.date instanceof Date ? data.date.toISOString().slice(0,10) : data.date || '待补充'} | 待补充 | 新增档案，请补齐目录信息 |`
  })].join('\n')
}

export function groupOverview(root) {
  const dir = path.join(root, 'conference/group')
  const source = fs.readFileSync(path.join(dir, 'index.md'), 'utf8')
  const rows = new Map([...source.matchAll(/^\|\s*\[\[(\d{4}-\d{4})(?:\\\|[^\]]+)?\]\][^\n]+$/gm)].map(match => [match[1], match[0]]))
  const years = fs.readdirSync(dir).filter(file => /^\d{4}-\d{4}\.md$/.test(file)).map(file => file.slice(0,-3)).sort().reverse()
  return ['| 学年 | 场次 |', '| --- | --- |', ...years.map(year => rows.get(year) || `| [[${year}]] | 待补充 |`)].join('\n')
}

export function conferenceOverviewBody({ root, kind }) {
  if (kind === 'annual') return annualOverview(root)
  const source = fs.readFileSync(path.join(root, 'conference/group/index.md'), 'utf8')
  const body = source.split('## 学年索引')[1]
  if (!body) throw new Error('Missing conference source marker: group')
  const nextSection = body.indexOf('\n## ')
  return groupOverview(root) + '\n' + (nextSection >= 0 ? body.slice(nextSection) : '')
}
