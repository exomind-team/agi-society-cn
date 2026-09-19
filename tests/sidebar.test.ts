import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { chromium, type Browser, type Page } from 'playwright'

describe('Conference sidebar ordering', () => {
  let browser: Browser
  let page: Page

  // With content-order: date in annual/index.md, expect descending by date.
  // The local dev server uses the project base by default; set VITEPRESS_BASE=/
  // when testing a root-path mirror build.
  const BASE = (process.env.VITEPRESS_BASE ?? '/agi-society-cn').replace(/\/$/, '')
  const expectedByDateDesc = [
    '2026 · 第十一届',
    '2025 · 第十届',
    '2024 · 第九届',
    '2023 · 第八届',
    '2022 · 第七届',
    '2021 · 第六届',
    '2020 · 第五届',
    '2019 · 第四届',
    '2018 · 第三届',
    '2017 · 第二届',
    '2016 · 第一届',
  ]

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true })
    page = await browser.newPage()
    await page.goto(`http://localhost:5173${BASE}/conference/`, { waitUntil: 'networkidle' })
  })

  afterAll(async () => {
    await browser.close()
  })

  it('should show all conference year entries', async () => {
    const count = await page.evaluate(() => {
      const links = document.querySelectorAll('.VPSidebarItem a .text')
      return Array.from(links).map(el => el.textContent.trim()).filter(t => /^20\d{2} · /.test(t)).length
    })
    expect(count).toBe(expectedByDateDesc.length)
  })

  it('should sort conferences by date descending (newest first) when content-order: date is set', async () => {
    const items = await page.evaluate(() => {
      const links = document.querySelectorAll('.VPSidebarItem a .text')
      return Array.from(links).map(el => el.textContent.trim()).filter(t => /^20\d{2} · /.test(t))
    })

    expect(items).toEqual(expectedByDateDesc)
  })

  it('should have both 年会 and 组会 sections expanded by default', async () => {
    const groups = await page.evaluate(() => {
      // Collect all sidebar items that have text + children (groups)
      const items = document.querySelectorAll('.VPSidebarItem')
      return Array.from(items).map(el => {
        const textEl = el.querySelector('.text')
        const hasItems = el.querySelector('.items') !== null
        const isCollapsed = el.classList.contains('collapsed')
        return {
          text: textEl?.textContent?.trim() || '',
          hasItems,
          collapsed: hasItems ? isCollapsed : null,
        }
      })
    })

    const annual = groups.find(g => g.text === '年会')
    const groupMtg = groups.find(g => g.text === '组会')

    expect(annual?.collapsed).toBe(false)
    expect(groupMtg?.collapsed).toBe(false)
  })

  it('should show sidebarTitle not full heading for conference entries', async () => {
    const items = await page.evaluate(() => {
      const links = document.querySelectorAll('.VPSidebarItem a .text')
      return Array.from(links).map(el => el.textContent.trim())
    })

    // Should show "2016 · 第一届" not "第一届中国通用人工智能年会"
    expect(items).toContain('2016 · 第一届')
  })
})
