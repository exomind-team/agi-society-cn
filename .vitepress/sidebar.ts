import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import GrayMatter from 'gray-matter'
import { calculateSidebar as calc } from '@nolebase/vitepress-plugin-sidebar'

const CONTENT_SECTIONS = [
  'content/about',
  'content/research',
  'content/conference',
  'content/wiki',
  'content/projects',
  'content/contact',
]

// ====  Public API  ====

/** VitePress holds a reference to this object — mutated in-place by commitSidebarUpdate(). */
const sidebarCache = {}

/** VitePress config calls this once at startup. Returns the persistent cache object. */
export function generateSidebar() {
  commitSidebarUpdate()
  return sidebarCache
}

// ====  Detection: check whether the sidebar structure has changed since last commit  ====

let _lastMtime = 0
let _lastFingerprint = ''

/** Pure detection — no mutation. Returns true if the sidebar would be different. */
export function hasSidebarChanged() {
  const mtime = latestContentMtime()
  if (!_lastMtime || mtime <= _lastMtime + 100) {
    _lastMtime = mtime
    return false
  }
  _lastMtime = mtime
  // Compute what the new sidebar would look like, compare to last committed fingerprint
  const fresh = computeSidebar()
  return structureFingerprint(fresh) !== _lastFingerprint
}

// ====  Action: commit the current sidebar state into the cache (triggers config reload)  ====

/** Mutate sidebarCache in-place and record the new fingerprint. Call after hasSidebarChanged() returns true. */
export function commitSidebarUpdate() {
  const fresh = computeSidebar()
  for (const k of Object.keys(sidebarCache)) delete sidebarCache[k]
  Object.assign(sidebarCache, fresh)
  _lastFingerprint = structureFingerprint(sidebarCache)
}

// ====  Internal helpers  ====

function latestContentMtime() {
  try {
    const entries = readdirSync(join(process.cwd(), 'content'), { recursive: true })
    let max = 0
    for (const e of entries) {
      if (!e.endsWith('.md')) continue
      try { const s = statSync(join(process.cwd(), 'content', e)); if (s.mtimeMs > max) max = s.mtimeMs } catch {}
    }
    return max
  } catch { return Date.now() }
}

function structureFingerprint(sidebar) {
  const strip = (item) => {
    const { _sortVal, ...rest } = item
    const clean = {}
    for (const k of Object.keys(rest).sort()) {
      if (k === 'items') clean[k] = rest[k]?.map(strip)
      else clean[k] = rest[k]
    }
    return clean
  }
  const keys = Object.keys(sidebar).sort()
  return JSON.stringify(keys.map(k => ({ k, v: sidebar[k].map(strip) })))
}

function computeSidebar() {
  const items = calc(CONTENT_SECTIONS)
  let sections = Array.isArray(items) ? items : items.items || []
  if (sections.length === 1 && sections[0].index === 'content') {
    sections = sections[0].items || []
  }
  const sortedSections = sortByContentOrder(sections, 'content')
  const result = {}
  for (const section of sortedSections) {
    result['/' + section.index + '/'] = fixItems(section.items || [], join('content', section.index))
  }
  return result
}

function fixLink(link) { return link ? link.replace('/content', '') : link }

function fixItems(arr, parentDir) {
  const sorted = sortByContentOrder(arr, parentDir)
  return sorted.map(item => {
    const fixed = { ...item }
    if (fixed.link) fixed.link = fixLink(fixed.link)
    // VitePress serializes a trailing-slash directory link as `.../index`,
    // while the active page path is normalized to `.../directory`. Remove
    // the explicit `index` suffix so the current chapter can be identified
    // when calculating the document footer pager.
    if (fixed.items && fixed.link?.endsWith('/index')) {
      fixed.link = fixed.link.slice(0, -'/index'.length)
    }
    // A directory index is a real document even when the sidebar generator
    // represents the directory as a group. Keep that document in the flat
    // sidebar sequence so VitePress can calculate the expected prev/next
    // links (for example: Chapter 1 -> Section 1.1).
    if (!fixed.link && fixed.items && fixed.index) {
      const indexPath = join(parentDir, fixed.index, 'index.md')
      if (existsSync(indexPath)) {
        const relativeIndex = indexPath
          .replace(/^content[\\/]/, '')
          .replace(/[\\/]index\.md$/, '')
          .replaceAll('\\', '/')
        fixed.link = '/' + relativeIndex
      }
    }
    if (fixed.items) fixed.items = fixItems(fixed.items, join(parentDir, item.index || ''))
    if (fixed.collapsed !== true) fixed.collapsed = false
    return fixed
  })
}

function getContentOrder(dirPath) {
  for (const name of ['index.md', '_page.md']) {
    const p = join(dirPath, name)
    if (existsSync(p)) {
      try { const { data } = GrayMatter(readFileSync(p, 'utf-8')); return data['content-order'] || 'name' } catch { return 'name' }
    }
  }
  return 'name'
}

function getContentOrderReversed(dirPath) {
  for (const name of ['index.md', '_page.md']) {
    const p = join(dirPath, name)
    if (existsSync(p)) {
      try { const { data } = GrayMatter(readFileSync(p, 'utf-8')); return data['content-order-reversed'] === true } catch { return false }
    }
  }
  return false
}

function getSortValue(filePath, orderMode) {
  if (!existsSync(filePath)) return null
  try {
    const { data } = GrayMatter(readFileSync(filePath, 'utf-8'))
    if (orderMode === 'order') return data?.order != null ? { v: Number(data.order), t: 'order' } : null
    if (orderMode === 'date' && data?.date) return { v: new Date(data.date).getTime(), t: 'date' }
    return null
  } catch { return null }
}

function sortByContentOrder(arr, parentDir) {
  if (!arr || arr.length === 0) return arr || []
  const orderMode = getContentOrder(parentDir)
  const reversed = getContentOrderReversed(parentDir)
  for (const item of arr) {
    if (item.items) item.items = sortByContentOrder(item.items, join(parentDir, item.index || ''))
  }
  if (orderMode === 'name' && !reversed) return arr
  const withKeys = arr.map(item => {
    const filePath = item.link
      ? join('content', fixLink(item.link).replace(/^\//, '') + '.md')
      : join(parentDir, item.index || '', 'index.md')
    return { ...item, _sortVal: getSortValue(filePath, orderMode) }
  })
  const direction = reversed ? -1 : 1
  withKeys.sort((a, b) => {
    const aH = a._sortVal != null, bH = b._sortVal != null
    if (aH && bH) return direction * (a._sortVal.v - b._sortVal.v)
    if (aH && !bH) return -1
    if (!aH && bH) return 1
    return (a.text || '').localeCompare(b.text || '', 'zh')
  })
  return withKeys.map(({ _sortVal, ...rest }) => rest)
}
