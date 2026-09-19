import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = path.join(ROOT, 'content')
const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...value] = arg.replace(/^--/, '').split('=')
  return [key, value.join('=') || true]
}))
const DIST = path.resolve(ROOT, String(args.get('dist') || 'dist'))
const BASE = normalizeBase(String(args.get('base') || process.env.VITEPRESS_BASE || '/agi-society-cn/'))

function normalizeBase(value) {
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

function walk(dir) {
  const output = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) output.push(...walk(full))
    else output.push(full)
  }
  return output
}

function relativeTo(base, full) {
  return path.relative(base, full).replaceAll(path.sep, '/')
}

function withoutCodeFences(text) {
  const lines = text.split(/\r?\n/)
  let fenced = false
  const withoutFences = lines.filter((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced
      return false
    }
    return !fenced
  }).join('\n')
  return withoutFences.replace(/`[^`]*`/g, '')
}

const markdownFiles = walk(CONTENT).filter((file) => file.endsWith('.md'))
const byStem = new Map()
for (const file of markdownFiles) {
  const stem = path.basename(file, '.md').toLowerCase()
  if (!byStem.has(stem)) byStem.set(stem, [])
  byStem.get(stem).push(file)
}

function candidateMarkdownFiles(source, target) {
  const normalized = target.replaceAll('/', path.sep)
  const targets = []
  const add = (value) => {
    const absolute = path.normalize(value)
    for (const candidate of [absolute, `${absolute}.md`, path.join(absolute, 'index.md')]) {
      if (!targets.includes(candidate)) targets.push(candidate)
    }
  }

  if (target.startsWith('/')) add(path.join(CONTENT, normalized.slice(1)))
  else if (target.startsWith('./') || target.startsWith('../')) add(path.resolve(path.dirname(source), normalized))
  else {
    add(path.resolve(path.dirname(source), normalized))
    add(path.join(CONTENT, normalized))
  }

  if (!target.includes('/')) {
    for (const candidate of byStem.get(target.toLowerCase()) || []) targets.push(candidate)
  }
  return targets
}

const errors = []
const warnings = []

for (const file of markdownFiles) {
  const source = fs.readFileSync(file, 'utf8')
  const text = withoutCodeFences(source)
  for (const match of text.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const raw = match[1].replaceAll('\\|', '|')
    const target = raw.split('|', 1)[0].split('#', 1)[0].split('^', 1)[0].trim()
    if (!target || /^[a-z]+:/i.test(target)) continue
    const resolved = candidateMarkdownFiles(file, target).find((candidate) => fs.existsSync(candidate))
    if (!resolved) errors.push(`${relativeTo(ROOT, file)}: unresolved wikilink [[${target}]]`)
  }

  for (const match of text.matchAll(/(?<!!)(?<!\!)\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].trim().split(/\s+/, 1)[0]
    if (/^(?:https?:|mailto:|tel:|#|\/\/)/i.test(target)) continue
    if (/\.md(?:#.*)?$/i.test(target)) {
      warnings.push(`${relativeTo(ROOT, file)}: use an Obsidian wikilink instead of ${target}`)
    }
  }
}

if (fs.existsSync(DIST)) {
  const publicRoot = path.join(CONTENT, 'public')
  for (const file of walk(publicRoot)) {
    const relative = relativeTo(publicRoot, file)
    if (!fs.existsSync(path.join(DIST, relative))) errors.push(`missing built public asset: ${relative}`)
  }

  const htmlFiles = walk(DIST).filter((file) => file.endsWith('.html'))
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8')
    if (/<h1[^>]*>Not Found<\/h1>|<title>Not Found/i.test(html)) {
      errors.push(`built Not Found page: ${relativeTo(DIST, file)}`)
    }

    // Static demos are regular files rather than vault notes. Check their
    // clean-URL resolution explicitly while leaving VitePress router links
    // to the generated-site smoke tests.
    for (const match of html.matchAll(/(?:href|src)="([^"]*demo\/[^"#?]*)/g)) {
      const href = match[1]
      const relativeHtml = relativeTo(DIST, file)
      const route = relativeHtml.replace(/\.html$/, '').replace(/\/index$/, '')
      const pageUrl = `https://example.invalid${BASE}${route}`
      const resolved = new URL(href, pageUrl)
      if (!resolved.pathname.startsWith(BASE)) continue
      const asset = decodeURIComponent(resolved.pathname.slice(BASE.length)).replace(/^\//, '')
      if (!fs.existsSync(path.join(DIST, asset))) errors.push(`${relativeHtml}: broken demo asset ${href}`)
    }
  }
}

console.log(`wikilink scan: ${markdownFiles.length} Markdown files`)
console.log(`built asset scan: ${fs.existsSync(DIST) ? DIST : '(skipped; build output not found)'}`)
if (warnings.length) {
  console.log(`warnings=${warnings.length}`)
  for (const warning of warnings) console.log(`WARN ${warning}`)
}
if (errors.length) {
  console.error(`errors=${errors.length}`)
  for (const error of errors) console.error(`ERROR ${error}`)
  process.exit(1)
}
console.log('content link checks passed')
