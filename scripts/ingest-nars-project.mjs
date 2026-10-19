#!/usr/bin/env node
/**
 * ingest-nars-project.mjs
 *
 * 标准化 NARS 实现 / 衍生项目收录流程：
 *   1) 用 `gh api` 拉仓库元数据（fork 链 / parent / source / 创建日 / stars / description）
 *   2) 按 CLAUDE.md §"收录 NARS 实现的查重纪律"做溯源判定
 *   3) 输出 Markdown 骨架（项目页内容草稿）到 stdout
 *
 * 不直接修改任何文件——由 agent / 维护者根据脚本输出做"收录决策"，再把项目页与索引表
 * 行写入仓库。这样设计的好处：脚本确定性，但来源溯源与"fork / 二次改造"判断仍需人。
 *
 * 用法：
 *   node scripts/ingest-nars-project.mjs --owner=Noctis-Xu --repo=NARS-FighterPlane \
 *     --target=derivatives --tier=A3
 *
 * 参数：
 *   --owner=<owner>     GitHub owner（必需）
 *   --repo=<repo>       仓库名（必需）
 *   --target=impl|derivatives   目标目录（默认 derivatives）
 *   --tier=A1|A2|A3|B1|B2      拟分类（脚本仅做提示，不强迫）
 *   --page=<page-name>  项目页文件名（默认与 repo 同名）
 *   --name=<display>    项目显示名（默认从 repo 推断；读 README H1 也行）
 *
 * 输出（stdout）：Markdown 顶部元数据 + 文件元信息 + 查重要点
 */

import { execFileSync } from 'node:child_process'

function fail(msg) {
  console.error(`ingest-nars-project: ${msg}`)
  process.exit(2)
}

const args = process.argv.slice(2)
function getArg(name) {
  const pref = `--${name}=`
  const a = args.find((x) => x.startsWith(pref))
  return a ? a.slice(pref.length) : null
}

const owner = getArg('owner')
const repo = getArg('repo')
const target = getArg('target') ?? 'derivatives'
const tier = getArg('tier') ?? 'A3'
const page = getArg('page') ?? repo
const name = getArg('name') ?? repo

if (!owner || !repo) {
  fail('必须指定 --owner=<owner> 与 --repo=<repo>')
}

if (!['impl', 'derivatives'].includes(target)) {
  fail(`--target 必须是 impl 或 derivatives；当前：${target}`)
}

// 拉仓库元数据（fork 链 / 描述 / 时间戳 / stars / language）
let info
try {
  const rawJson = execFileSync('gh', ['api', `repos/${owner}/${repo}`], { encoding: 'utf8' })
  const raw = JSON.parse(rawJson)
  info = {
    fork: raw.fork,
    parent: raw.parent?.full_name ?? null,
    source: raw.source?.full_name ?? null,
    language: raw.language,
    description: raw.description,
    html_url: raw.html_url,
    created_at: raw.created_at,
    pushed_at: raw.pushed_at,
    stargazers: raw.stargazers_count,
    license: raw.license?.spdx_id ?? null,
    topics: Array.isArray(raw.topics) ? raw.topics : [],
    default_branch: raw.default_branch,
  }
} catch (e) {
  fail(`无法拉取 ${owner}/${repo}：${e.message}`)
}

// 拉 README 头部（前 30 行）做内容溯源
let readmeHead = ''
try {
  const encoded = execFileSync(
    'gh',
    ['api', `repos/${owner}/${repo}/readme`, '--jq', '.content'],
    { encoding: 'utf8' }
  ).trim()
  readmeHead = Buffer.from(encoded, 'base64').toString('utf8').split('\n').slice(0, 30).join('\n')
} catch {
  readmeHead = '（无 README）'
}

// 判定 fork 链状态
const forkState = info.fork
  ? `fork (parent=${info.parent ?? '?'}, source=${info.source ?? '?'})`
  : '独立项目'
const note = forkState === '独立项目'
  ? '✓ 符合 §查重纪律：fork 链透明 + 非 fork'
  : `⚠ fork=true；请确认 parent/source 是否指向已收录条目或原作者`
const derivativeNote =
  (info.description ?? '').toLowerCase().match(/nars|narsese|nal|nar\b/) ||
  (info.topics ?? []).some((t) => /nars|narsese|nal|nar\b/i.test(String(t)))
    ? '✓ 描述或话题含 NARS 字样'
    : '⚠ 描述与话题均未直接含 NARS 字样，需进一步判定'

// 输出 Markdown 骨架
console.log('# IngestReport\n')
console.log(`- **仓库：** [${owner}/${repo}](${info.html_url})`)
console.log(`- **建议目标：** \`content/projects/nars_${target === 'impl' ? 'impl' : 'derivatives'}/${page}.md\``)
console.log(`- **建议页面名（id）：** ${page}`)
console.log(`- **建议显示名：** ${name}`)
console.log(`- **拟分类：** ${tier}\n`)

console.log('## 元数据\n')
console.log(`- 创建日：${info.created_at}`)
console.log(`- 最后 push：${info.pushed_at ?? '未知'}`)
console.log(`- 主要语言：${info.language ?? '未知'}`)
console.log(`- 许可证：${info.license ?? '未声明'}`)
console.log(`- Stars：${info.stargazers}`)
console.log(`- 话题：${(info.topics ?? []).join(', ') || '无'}`)
console.log(`- Fork 链：${forkState}`)
console.log(`- 仓库描述：${info.description ?? '无'}`)
console.log()

console.log('## 溯源判定\n')
console.log(`- ${note}`)
console.log(`- ${derivativeNote}`)
console.log()

console.log('## README（前 30 行）\n')
console.log('```text')
console.log(readmeHead)
console.log('```')
console.log()

console.log('## 项目页骨架\n')
console.log('```markdown')
console.log('---')
console.log('comments: true')
console.log('---')
console.log()
console.log(`# ${name}`)
console.log()
console.log(`> **层级**：${tier}. — 由 \`ingest-nars-project.mjs --tier=${tier}\` 标注，请人工复核`)
console.log()
console.log(`- 全名：**${name}**`)
console.log(`- 编程语言：${info.language ?? '未知'}`)
console.log(`- 仓库：<${info.html_url}>`)
console.log(`- 维护者：${owner}（GitHub 账号；与其他资料交叉核实请人工补充）`)
console.log(`- 许可证：${info.license ?? '仓库元数据未声明'}`)
console.log(`- 仓库平台创建日：${info.created_at?.slice(0, 10) ?? '未知'}`)
console.log()
console.log('## 项目简介')
console.log()
console.log(`> 占位——由 ingest 起草，请人工查阅 README 后改写。`)
console.log()
console.log(`> 仓库方说明：${info.description ?? '无'}`)
console.log()
console.log('## 收录与归属')
console.log()
console.log(`本页属于 [[${target === 'impl' ? 'index' : '../index'}|${target === 'impl' ? 'NARS各版实现' : 'NARS衍生项目'}]]。`)
console.log('（依据上文拟分类；如需调整请同步修改索引表格。/）')
console.log()
console.log('## 来源溯源')
console.log()
console.log(`- GitHub fork 链：fork=${info.fork}、parent=${info.parent ?? 'null'}、source=${info.source ?? 'null'}`)
console.log(`- README 自报项目语境`)
console.log()
console.log('```')
console.log()

console.log('## 下一步（人工）\n')
console.log(`1. 根据 README 改写"项目简介"段`)
console.log(`2. 写入 \`content/projects/nars_${target === 'impl' ? 'impl' : 'derivatives'}/${page}.md\``)
console.log(`3. 如 target=impl：在 \`data/nars-implementations.json\` 加 entry 后跑 \`npm run nars:catalog\``)
console.log(`4. 更新 \`content/projects/nars_${target === 'impl' ? 'impl' : 'derivatives'}/index.md\` 的"已收录"`)
console.log(`5. commit + push + \`npm run publish:tencent --confirm=tencent-main\``)

// 退出码：成功
process.exit(0)
