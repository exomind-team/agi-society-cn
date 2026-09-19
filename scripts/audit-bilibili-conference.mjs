import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PROXY = 'http://localhost:3456'
const TARGET = process.argv.find((arg) => arg.startsWith('--target='))?.slice('--target='.length)
const WRITE = process.argv.includes('--write')
const TODAY = new Date().toISOString().slice(0, 10)
const REPORT_PATH = path.join(ROOT, 'ops', `bilibili-conference-audit-${TODAY}.md`)
const CONFERENCE_DIR = path.join(ROOT, 'content', 'conference')

if (!TARGET) {
  throw new Error('Usage: node scripts/audit-bilibili-conference.mjs --target=<CDP target id> [--write]')
}

async function request(pathname, options = {}) {
  const response = await fetch(`${PROXY}${pathname}`, options)
  if (!response.ok) throw new Error(`${pathname}: HTTP ${response.status}`)
  return response.json()
}

async function navigate(url) {
  await request(`/navigate?target=${encodeURIComponent(TARGET)}&url=${encodeURIComponent(url)}`)
}

function extractBvids(text) {
  return [...String(text).matchAll(/BV[0-9A-Za-z]{10}/g)].map((match) => match[0])
}

function classify(title) {
  const value = String(title).toLowerCase()
  if (/年会|annual|conference/.test(value)) return '年会候选'
  if (/组会|nars|narsese|非公理|agi|智能/.test(value)) return '组会/NARS候选'
  return '其他视频'
}

async function collectOfficialSpace() {
  await navigate('https://space.bilibili.com/475410405/video')
  await request(`/scroll?target=${encodeURIComponent(TARGET)}&direction=bottom`)
  const result = await request(`/eval?target=${encodeURIComponent(TARGET)}`, {
    method: 'POST',
    headers: { 'content-type': 'text/plain;charset=UTF-8' },
    body: `(() => {
      const cards = Array.from(document.querySelectorAll('a.bili-cover-card[href*="/video/"]'));
      const seen = new Set();
      return cards.map((card) => {
        const href = card.href || '';
        const match = href.match(/video\\/(BV[0-9A-Za-z]{10})/);
        if (!match || seen.has(match[1])) return null;
        seen.add(match[1]);
        const imageTitle = card.querySelector('img')?.alt || '';
        const titleLink = card.parentElement?.querySelector('a:not(.bili-cover-card)[href*="/video/"]');
        const title = (imageTitle || titleLink?.innerText || '').trim();
        return { bvid: match[1], href, title };
      }).filter(Boolean);
    })()`,
  })
  if (!Array.isArray(result.value)) throw new Error('Bilibili space DOM did not return a video list')
  return result.value
}

async function collectExistingBvids() {
  const markdown = []
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) await walk(full)
      else if (entry.name.endsWith('.md')) markdown.push(await fs.readFile(full, 'utf8'))
    }
  }
  await walk(CONFERENCE_DIR)
  return new Set(markdown.flatMap(extractBvids))
}

const officialVideos = await collectOfficialSpace()
const existingBvids = await collectExistingBvids()
const candidates = officialVideos
  .map((video) => ({ ...video, classification: classify(video.title), alreadyIndexed: existingBvids.has(video.bvid) }))
  .filter((video) => video.classification !== '其他视频')

const report = [
  `# B 站年会与组会候选核查（${TODAY}）`,
  '',
  '> 本报告由 `scripts/audit-bilibili-conference.mjs` 从协会官方 B 站空间的页面 DOM 生成。它只生成候选，不自动写入会议 Markdown；新增链接必须结合标题、发布时间、合集分页和议程人工确认。',
  '',
  `官方空间：<https://space.bilibili.com/475410405/video>`,
  `当前页面采集到视频数：${officialVideos.length}`,
  `会议页面已收录的 BV 数：${existingBvids.size}`,
  '',
  '| BV 号 | 页面标题 | 分类 | 是否已收录 |',
  '|---|---|---|---|',
  ...candidates.map((video) => `| [${video.bvid}](https://www.bilibili.com/video/${video.bvid}/) | ${video.title || '未从卡片 DOM 取得标题'} | ${video.classification} | ${video.alreadyIndexed ? '是' : '否'} |`),
  '',
  '## 人工处理规则',
  '',
  '- “年会候选”需要与年会议程或官方视频标题中的日期/分会场对应后再写入年会页面。',
  '- “组会/NARS 候选”需要确认是否为正式组会；论文导读、公开讲座等视频保留候选状态，不直接计入学年场次。',
  '- 页面 DOM 未加载完整时，先滚动官方空间并重新运行本脚本；不要把采集不全解释成“没有视频”。',
].join('\n') + '\n'

if (WRITE) await fs.writeFile(REPORT_PATH, report, 'utf8')
console.log(JSON.stringify({ write: WRITE, officialVideos: officialVideos.length, indexedBvids: existingBvids.size, candidates: candidates.length, report: path.relative(ROOT, REPORT_PATH) }, null, 2))
