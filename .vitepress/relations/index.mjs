import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'

/** One discovery boundary for search, graph, sidebars and recommendations. */
export const isDiscoverable = (frontmatter) => frontmatter.discovery !== 'unlisted'
export const pageHref = (file) => '/' + file.replace(/\.md$/, '').replace(/(^|\/)index$/, '$1')
// Match VitePress HTML parsing so comments are tokens, never link evidence.
const markdown = new MarkdownIt({ html: true })

export function readPages(root) {
  return fs.readdirSync(root, { recursive: true }).filter(file => file.endsWith('.md')).sort().map(file => {
    const { data, content } = matter(fs.readFileSync(path.join(root, file), 'utf8'))
    return { file: file.replaceAll(path.sep, '/'), frontmatter: data, content,
      title: String(data.title || content.match(/^#\s+(.+)$/m)?.[1] || data.sidebarTitle || path.basename(file, '.md')) }
  })
}

export function readPeople(root = process.cwd()) {
  const read = name => JSON.parse(fs.readFileSync(path.join(root, 'data', name), 'utf8'))
  return [...read('people-profiles.json'), ...read('people-identities.json')].map(person => ({
    id: person.id, name: person.name, aliases: person.aliases || [],
    href: `/wiki/people/${person.id}`, summary: person.summary,
  }))
}

/** Resolve Obsidian paths without guessing between duplicate basenames. */
export function resolveTarget({ source, target, files }) {
  target = target.replace(/\\\|/g, '|').split('|')[0].split('#')[0].trim().replace(/\.md$/, '')
  if (!target || /^[a-z]+:/i.test(target)) return null
  const candidates = target.startsWith('/') ? [target.slice(1)] :
    [path.posix.normalize(path.posix.join(path.posix.dirname(source), target)), target]
  for (const candidate of candidates) {
    for (const file of [candidate + '.md', candidate.replace(/\/$/, '') + '/index.md']) if (files.has(file)) return file
  }
  const matches = [...files].filter(file => file.replace(/\.md$/, '').endsWith('/' + target))
  return matches.length === 1 ? matches[0] : null
}

function inlineText(tokens) {
  return tokens.filter(token => token.type === 'inline').flatMap(token =>
    (token.children || []).filter(child => child.type === 'text').map(child => child.content)
  ).join('\n')
}

/** Table parsing uses header roles, not co-occurrence: a name in a title is not a speaker. */
function conferenceRows(tokens) {
  const rows = []
  let headers = [], cells = [], heading = false, inRow = false, rowToken
  const anchors = new Map()
  for (const token of tokens) {
    if (token.type === 'thead_open') heading = true
    if (token.type === 'thead_close') heading = false
    if (token.type === 'tr_open') { cells = []; inRow = true; rowToken = token }
    if (token.type === 'inline' && inRow) cells.push(token.content)
    if (token.type === 'tr_close') {
      inRow = false
      if (heading) headers = cells
      else {
        const speaker = headers.findIndex(h => /^(报告人|主讲人|主讲|讲者)$/.test(h))
        const title = headers.findIndex(h => /^(报告标题|报告题目|主题|题目|内容)$/.test(h))
        if (speaker >= 0 && title >= 0) {
          const base = 'report-' + createHash('sha256').update(`${cells[speaker]}\n${cells[title]}`).digest('hex').slice(0, 12)
          const occurrence = (anchors.get(base) || 0) + 1
          anchors.set(base, occurrence)
          rows.push({ speakers: cells[speaker], title: cells[title], source: cells.join(' ').match(/https:\/\/[^\s)]+/)?.[0], anchor: base + (occurrence > 1 ? `-${occurrence}` : ''), token: rowToken })
        }
      }
    }
  }
  return rows
}

// The renderer and graph use identical row identities; links land on the actual report.
export function annotateConferenceRows(tokens) {
  for (const row of conferenceRows(tokens)) row.token.attrSet('id', row.anchor)
}

// A report row is a distinct occurrence even when its speaker and title repeat.
export const relationKey = edge => JSON.stringify([edge.from, edge.to, edge.role, edge.label, edge.href || null])

export function buildRelations({ pages, people }) {
  const ids = new Set()
  const names = new Map()
  for (const person of people) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(person.id) || typeof person.name !== 'string' || !Array.isArray(person.aliases) || person.aliases.some(alias => typeof alias !== 'string')) throw new Error(`Invalid person identity: ${JSON.stringify(person)}`)
    if (ids.has(person.id)) throw new Error(`Duplicate person ID: ${person.id}`)
    ids.add(person.id)
    for (const name of [person.name, ...person.aliases]) names.set(name, [...(names.get(name) || []), person.id])
  }
  const visible = pages.filter(page => isDiscoverable(page.frontmatter))
  const files = new Set(visible.map(page => page.file))
  const personPages = new Set()
  for (const page of visible) {
    const id = page.frontmatter.personId
    if (id && (!ids.has(id) || personPages.has(id))) throw new Error(`Unknown or repeated personId ${id} in ${page.file}`)
    if (id) personPages.add(id)
    if (page.frontmatter.tags && !Array.isArray(page.frontmatter.tags)) throw new Error(`Tags must be an array in ${page.file}`)
  }
  const nodes = visible.map(page => ({ file: page.file, href: pageHref(page.file), title: page.title, person: page.frontmatter.personId || null }))
  const edges = []
  const edgeKeys = new Set()
  const add = edge => {
    const key = relationKey(edge)
    if (!edgeKeys.has(key)) { edgeKeys.add(key); edges.push({ ...edge, key }) }
  }
  for (const page of visible) {
    const from = pageHref(page.file)
    const tokens = markdown.parse(page.content, {})
    const prose = inlineText(tokens)
    for (const match of prose.matchAll(/(?<!!)\[\[([^\]]+)\]\]/g)) {
      const resolved = resolveTarget({ source: page.file, target: match[1], files })
      if (resolved && resolved !== page.file) add({ from, to: pageHref(resolved), role: 'link', label: page.title, rule: 'explicit-wikilink', source: from, status: 'confirmed', confidence: 'explicit' })
    }
    // Existing conventional Markdown links also contribute backlinks, excluding images and external URLs.
    for (const token of tokens.filter(t => t.type === 'inline')) for (const child of token.children || []) {
      if (child.type !== 'link_open') continue
      const target = child.attrGet('href')
      const resolved = resolveTarget({ source: page.file, target, files })
      if (resolved && resolved !== page.file) add({ from, to: pageHref(resolved), role: 'link', label: page.title, rule: 'explicit-markdown-link', source: from, status: 'confirmed', confidence: 'explicit' })
    }
    for (const relation of page.frontmatter.relations || []) {
      if (!ids.has(relation.person) || !['author','speaker','subject','doctoral-advisor','postdoctoral-advisor'].includes(relation.role) || !/^https?:\/\/|^\//.test(relation.source || '') || !relation.confidence || !['confirmed','maintainer-provided'].includes(relation.status)) throw new Error(`Invalid relation in ${page.file}: ${JSON.stringify(relation)}`)
      // A maintainer statement is not verified evidence of a mentor relationship.
      // Fail closed instead of leaking an unverified edge into public backlinks.
      if (relation.role.endsWith('-advisor') && (relation.status !== 'confirmed' || relation.confidence === 'explicit-maintainer-statement')) throw new Error(`Unverified mentor relation in ${page.file}`)
      add({ from, to: `/wiki/people/${relation.person}`, role: relation.role, label: page.title, rule: 'editorial-evidence', source: relation.source, status: relation.status, confidence: relation.confidence })
    }
    if (page.file.startsWith('conference/')) for (const row of conferenceRows(tokens)) {
      for (const name of (row.speakers || '').split(/[、，,]/).map(s => s.trim())) {
        const matches = names.get(name)
        if (matches?.length === 1) add({ from, to: `/wiki/people/${matches[0]}`, role: 'speaker', href: from + '#' + row.anchor, label: row.title, rule: 'agenda-speaker-column', source: row.source || from, status: 'confirmed', confidence: 'agenda' })
      }
    }
    for (const [name, matches] of names) {
      if (matches.length !== 1 || !prose.includes(name) || page.frontmatter.personId === matches[0]) continue
      const to = `/wiki/people/${matches[0]}`
      if (!edges.some(e => e.from === from && e.to === to)) add({ from, to, role: 'mention', label: page.title, rule: 'unique-name-mention', source: from, status: 'candidate', confidence: 'name-only' })
    }
  }
  // Explicit shared tags propose reading connections only, never person-to-person facts.
  const candidates = []
  for (let i = 0; i < visible.length; i++) for (let j = i + 1; j < visible.length; j++) {
    const a = visible[i], b = visible[j]
    const tags = (a.frontmatter.tags || []).filter(tag => (b.frontmatter.tags || []).includes(tag))
    if (tags.length) candidates.push({ from: pageHref(a.file), to: pageHref(b.file), role: 'related-reading', label: tags.join('、'), rule: 'shared-explicit-tag', source: [pageHref(a.file), pageHref(b.file)], status: 'candidate', confidence: 'topic-only' })
  }
  return { nodes, edges, candidates, people }
}
