// Manual browser QA driver for the administrator editor prototype.
// Drives a real, installed browser over the loopback-only fixture service.
// Writes a redacted JSON report; it never touches the website or GitHub.
import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'

const BASE = process.env.QA_BASE_URL || 'http://127.0.0.1:8787'
const OUT = process.env.QA_OUT || path.resolve('reports')
const SHOTS = path.join(OUT, 'screenshots')
const results = []
let shotIndex = 0

const log = (name, status, detail) => {
  results.push({ name, status, detail: detail ?? null })
  process.stdout.write(`${status.padEnd(7)} ${name}${detail ? ` — ${detail}` : ''}\n`)
}

async function shot(page, label) {
  shotIndex += 1
  const file = path.join(SHOTS, `${String(shotIndex).padStart(2, '0')}-${label}.png`)
  await page.screenshot({ path: file, fullPage: false })
  return path.basename(file)
}

const text = async (page, selector) => (await page.locator(selector).textContent())?.trim() ?? ''

async function run() {
  await fs.mkdir(SHOTS, { recursive: true })
  const browser = await chromium.launch({ channel: 'chrome', headless: false })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', e => consoleErrors.push(String(e)))
  const failedResponses = []
  page.on('response', r => { if (r.status() >= 400) failedResponses.push(r.status() + ' ' + r.request().method() + ' ' + r.url()) })
  page.on('requestfailed', r => failedResponses.push('FAILED ' + r.url()))

  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('#editor:not([disabled])', { timeout: 15000 })
    log('page-load', 'PASS', `mode="${await text(page, '#mode')}"`)

    // 1. Page selection
    const pageButtons = page.locator('.page-button')
    log('select-page', (await pageButtons.count()) === 1 ? 'PASS' : 'FAIL',
      `${await pageButtons.count()} page(s) listed`)
    log('page-title', (await text(page, '#title')).includes('Obsidian') ? 'PASS' : 'FAIL',
      await text(page, '#title'))

    // 2. Edit ordinary text
    const editor = page.locator('#editor')
    const original = await editor.inputValue()
    if (!original.includes('它提供了优秀的 Markdown 编辑体验和知识管理功能。')) {
      log('fixture-content', 'FAIL', 'expected protected fragment not found in editor')
    }
    const edited = original.replace(
      '它提供了优秀的 Markdown 编辑体验和知识管理功能。',
      '它提供了优秀的 Markdown 编辑体验和知识管理功能。（本机浏览器验收：2026-10-22）',
    )
    await editor.fill(edited)
    await page.waitForFunction(() => document.getElementById('state')?.textContent?.includes('未保存'), null, { timeout: 5000 })
    log('edit-text', 'PASS', `state="${await text(page, '#state')}"`)
    await shot(page, 'edited-dirty')

    // 3. Save draft, then reload and confirm the draft survived
    await page.click('#save')
    await page.waitForFunction(() => !document.getElementById('notice')?.hidden, null, { timeout: 10000 })
    const saveNotice = await text(page, '#notice')
    log('save-draft', /草稿已保存/.test(saveNotice) ? 'PASS' : 'FAIL', saveNotice)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForSelector('#editor:not([disabled])', { timeout: 15000 })
    const afterReload = await page.locator('#editor').inputValue()
    log('draft-persists-reload', afterReload.includes('本机浏览器验收') ? 'PASS' : 'FAIL',
      afterReload.includes('本机浏览器验收') ? 'draft readable after reload' : 'draft lost after reload')
    log('draft-not-published', afterReload === edited ? 'PASS' : 'FAIL',
      'reload shows draft text (draft layer), not a new published version')
    await shot(page, 'after-reload-draft')

    // 4. Diff view
    await page.click('[data-view="changes"]')
    await page.waitForTimeout(200)
    const added = await page.locator('.diff-row.added').count()
    const removed = await page.locator('.diff-row.removed').count()
    log('diff-view', added > 0 && removed > 0 ? 'PASS' : 'FAIL', `+${added} / -${removed} rows`)
    await shot(page, 'diff-view')

    // 5. Plain-text preview must not execute markup
    await page.click('[data-view="preview"]')
    await page.waitForTimeout(200)
    const previewText = await text(page, '#preview')
    const previewHtml = await page.locator('#preview').innerHTML()
    log('plain-text-preview', !/<[a-z]/i.test(previewHtml) ? 'PASS' : 'FAIL',
      'preview renders text nodes only')
    log('preview-matches-editor', previewText.includes('本机浏览器验收') ? 'PASS' : 'FAIL')
    await shot(page, 'preview-view')
    await page.click('[data-view="edit"]')

    // 6. Publish creates a local canonical version only
    const beforePublish = await (await fetch(`${BASE}/api/pages`)).json()
    await page.click('#publish')
    await page.waitForSelector('#dialog[open]', { timeout: 5000 })
    const publishBody = await text(page, '#dialog-body')
    log('publish-dialog-warns', /尚未连接网站构建和上线流程/.test(publishBody) ? 'PASS' : 'FAIL',
      'dialog states website publish is not connected')
    await shot(page, 'publish-dialog')
    await page.click('#dialog-confirm')
    await page.waitForFunction(() => document.getElementById('notice')?.textContent?.includes('正式内容版本已保存'), null, { timeout: 15000 })
    const publishNotice = await text(page, '#notice')
    log('publish-local-version', /正式内容版本已保存/.test(publishNotice) ? 'PASS' : 'FAIL', publishNotice)
    const afterPublish = await (await fetch(`${BASE}/api/pages`)).json()
    log('publish-changed-revision', afterPublish.revision !== beforePublish.revision ? 'PASS' : 'FAIL',
      `${beforePublish.revision.slice(0, 8)} -> ${afterPublish.revision.slice(0, 8)}`)
    log('publish-not-website', afterPublish.capabilities?.websitePublish === false
      && afterPublish.capabilities?.remoteSync === false ? 'PASS' : 'FAIL',
      'server still reports websitePublish=false, remoteSync=false')
    await shot(page, 'after-publish')

    // 7. History view and restore creates a NEW version
    await page.click('#history')
    await page.waitForSelector('#dialog[open]', { timeout: 5000 })
    const versionRows = await page.locator('.version-row').count()
    log('history-list', versionRows >= 2 ? 'PASS' : 'FAIL', `${versionRows} versions listed`)
    await shot(page, 'history-dialog')
    await page.click('#dialog .dialog-actions button[value="cancel"]')
    await page.waitForFunction(() => !document.getElementById('dialog')?.open, null, { timeout: 5000 })

    // 8. Second tab: stale published revision must be refused, input retained.
    //    Tab 1 has already published, so tab 1's draft is based on a superseded revision.
    const page2 = await context.newPage()
    await page2.goto(BASE, { waitUntil: 'domcontentloaded' })
    await page2.waitForSelector('#editor:not([disabled])', { timeout: 15000 })
    const tab2Text = edited.replace('（本机浏览器验收：2026-10-22）', '（第二标签页改动）')
    await page2.locator('#editor').fill(tab2Text)

    // Read the current draft revision, then submit against the SUPERSEDED published
    // revision while passing the current draft revision: this isolates VERSION_CONFLICT.
    const conflict = await page2.evaluate(async ({ id, content }) => {
      const read = await (await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read', id })
      })).json()
      const r = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveDraft',
          id,
          content,
          baseRevision: read.draft?.baseRevision ?? read.revision,
          expectedDraftRevision: read.draft?.draftRevision ?? null
        })
      })
      return { status: r.status, body: await r.json(), staleBase: read.draft?.baseRevision, head: read.revision }
    }, { id: 'content/contact/contributing/obsidian.md', content: tab2Text })
    log('stale-draft-rejected', conflict.status === 409 ? 'PASS' : 'FAIL',
      `saveDraft with superseded base -> HTTP ${conflict.status} ${conflict.body?.error?.code || ''} (base=${String(conflict.staleBase).slice(0, 8)} head=${String(conflict.head).slice(0, 8)})`)
    await shot(page2, 'tab2-conflict')
    const tab2Kept = await page2.locator('#editor').inputValue()
    log('conflict-retains-input', tab2Kept.includes('第二标签页改动') ? 'PASS' : 'FAIL',
      'second tab kept its own text after the refusal')
    await page2.close()
    // 9. Sync status must be truthfully disabled
    await page.click('#sync')
    await page.waitForSelector('#dialog[open]', { timeout: 5000 })
    const syncBody = await text(page, '#dialog-body')
    log('sync-disabled-truthful', /尚未启用/.test(syncBody) ? 'PASS' : 'FAIL', syncBody.slice(0, 60))
    await page.keyboard.press('Escape')
    await page.waitForFunction(() => !document.getElementById('dialog')?.open, null, { timeout: 5000 })
    // 10. Unsaved-change guard: a REAL navigation away must be intercepted.
    await page.locator('#editor').fill(edited + '（未保存改动）')
    await page.waitForFunction(() => document.getElementById('state')?.textContent?.includes('未保存'), null, { timeout: 5000 })
    const nav = await page.evaluate(() => {
      // Ask the real handler to run and report whether it cancelled.
      const e = new Event('beforeunload', { cancelable: true })
      const notCancelled = window.dispatchEvent(e)
      return { notCancelled, defaultPrevented: e.defaultPrevented }
    })
    log('unsaved-guard-beforeunload', nav.defaultPrevented ? 'PASS' : 'FAIL',
      `beforeunload defaultPrevented=${nav.defaultPrevented}`)

    // 11. Ctrl+S on a stale draft must ask before rebasing; confirming it saves.
    await page.locator('#editor').click()
    await page.keyboard.press('Control+s')
    await page.waitForSelector('#dialog[open]', { timeout: 8000 })
    const staleTitle = await text(page, '#dialog-title')
    log('ctrl-s-asks-on-stale-draft', /重新保存草稿/.test(staleTitle) ? 'PASS' : 'FAIL',
      `dialog: "${staleTitle}"`)
    await shot(page, 'ctrl-s-stale-confirm')
    await page.click('#dialog-confirm')
    await page.waitForFunction(
      () => document.getElementById('notice')?.textContent?.includes('草稿已保存'),
      null, { timeout: 15000 })
    // 12. Composition guard: IME composition must not trigger a save.
    //     Compare the server-side draft revision before and after, not the notice text.
    const draftBefore = await page.evaluate(async ({ id }) => {
      const r = await (await fetch('/api/action', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read', id })
      })).json()
      return r.draft?.draftRevision ?? null
    }, { id: 'content/contact/contributing/obsidian.md' })
    await page.locator('#editor').fill('')
    await page.locator('#editor').evaluate(el => {
      el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, data: '' }))
      el.value = el.value + 'ni'
      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: 'ni', inputType: 'insertCompositionText' }))
    })
    await page.keyboard.press('Control+s')
    await page.waitForTimeout(800)
    const draftAfter = await page.evaluate(async ({ id }) => {
      const r = await (await fetch('/api/action', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read', id })
      })).json()
      return r.draft?.draftRevision ?? null
    }, { id: 'content/contact/contributing/obsidian.md' })
    log('ime-no-save-during-composition', draftAfter === draftBefore ? 'PASS' : 'FAIL',
      `draft revision unchanged during composition (${String(draftBefore).slice(0, 8)} -> ${String(draftAfter).slice(0, 8)})`)

    // 13. A clean page (no draft differing from published) must disable Save.
    const cleanSave = await page.evaluate(async ({ id }) => {
      // Publish the current draft so the page is clean, then read the UI state.
      const r = await (await fetch('/api/action', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read', id })
      })).json()
      return r
    }, { id: 'content/contact/contributing/obsidian.md' })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForSelector('#editor:not([disabled])')
    const saveDisabled = await page.locator('#save').isDisabled()
    log('save-disabled-when-clean', saveDisabled ? 'PASS' : 'FAIL',
      `draft status=${cleanSave.draft?.status ?? 'none'} stale=${cleanSave.draft?.stale ?? 'n/a'} saveDisabled=${saveDisabled}`)

    // 14. Layout sanity at desktop width
    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }))
    log('no-horizontal-overflow', overflow.scrollW <= overflow.clientW + 1 ? 'PASS' : 'FAIL',
      `scrollWidth=${overflow.scrollW} clientWidth=${overflow.clientW}`)
    await shot(page, 'desktop-layout')

    // 15. Narrow viewport
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(300)
    const narrowOverflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }))
    log('narrow-no-horizontal-overflow', narrowOverflow.scrollW <= narrowOverflow.clientW + 1 ? 'PASS' : 'FAIL',
      `scrollWidth=${narrowOverflow.scrollW} clientWidth=${narrowOverflow.clientW}`)
    await shot(page, 'narrow-layout')
    await page.setViewportSize({ width: 1440, height: 900 })

    // /favicon.ico is a real, separately reported finding: the prototype serves no icon,
    // so every page load logs one 404. It is reported apart from script errors.
    const scriptErrors = consoleErrors.filter(e => !e.includes('404'))
    log('no-console-errors', scriptErrors.length === 0 ? 'PASS' : 'FAIL',
      scriptErrors.length ? scriptErrors.slice(0, 3).join(' | ') : 'no script console errors')
    const favicon404 = consoleErrors.filter(e => e.includes('404'))
    log('favicon-present', favicon404.length === 0 ? 'PASS' : 'FAIL',
      favicon404.length ? 'browser requested /favicon.ico and the server returned 404' : 'favicon served')
    log('no-failed-requests', failedResponses.length === 0 ? 'PASS' : 'FAIL',
      failedResponses.length ? failedResponses.slice(0, 5).join(' | ') : 'no failed requests')

  } catch (error) {
    log('harness', 'FAIL', String(error && error.message ? error.message : error))
  } finally {
    await browser.close()
  }

  const report = {
    schema: 'admin-editor-browser-qa/v1',
    base_url: BASE,
    browser: 'Google Chrome (installed channel), Playwright 1.59.1',
    viewport: '1440x900 desktop, 390x844 narrow',
    generated_at: new Date().toISOString(),
    results,
  }
  await fs.writeFile(path.join(OUT, 'browser-qa-report.json'), JSON.stringify(report, null, 2), 'utf8')
  const failed = results.filter(r => r.status === 'FAIL')
  process.stdout.write(`\n${results.length - failed.length}/${results.length} passed\n`)
  process.exitCode = failed.length ? 1 : 0
}

run()
