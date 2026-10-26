# AGI Society Wiki 开发规范

> 本文件写给后续 Agent 和维护者。内容经多轮对话验证，不要绕过。

---

## 1. 内容目录结构

```
content/
├── index.md          首页（layout: home）
├── about/            协会简介（agi.md, team.md）
├── research/         学术研究
│   ├── nars/         NARS 理论（theory/, news.md）
│   └── thought_library/  思想书库
├── conference/       学术会议
│   ├── annual/       年会（2016.md-2026.md + index.md）
│   └── group/        组会（2016-2017.md-2025-2026.md + index.md）
├── wiki/             维基百科（思想书库）
├── projects/         项目介绍
│   └── nars_derivatives/  衍生项目
└── contact/          联系我们
    ├── team.md
    ├── contributing/
    └── documents_and_qq_group.md
```

**规则**：

- 新增页面放对应板块目录，不要放在 `content/` 根目录
- 目录名保持英文，标题通过 frontmatter 设为中文
- 不要恢复旧 `agi/` `sai/` `other/` `nars/` 文件夹

---

## 2. Frontmatter 字段规范

### 字段顺序（身份→排序→配置→展示→互动）

```yaml
---
title:                 # 页面标题
sidebarTitle:          # 侧边栏显示名（覆盖 title），仅 index.md 和年会/组会文件需要

order:                 # 数字排序（content-order: order 时生效）
date:                  # 日期排序，格式 YYYY-MM-DD（content-order: date 时生效）

content-order:         # 子项排序：order | date | name（默认）。仅 index.md 设置
content-order-reversed: # true = 倒序

sidebarCollapsed:      # 侧边栏分组默认折叠：true/false（不设默认 false = 展开）
sidebarHide:           # true = 从侧边栏隐藏

comments:              # true = 显示 Giscus 评论区
---
```

### 排序规则

- 优先级：`order` > `date` > 字母序（`name`）
- 无对应字段的文件排最后，按字母序
- 普通内容页（aikr.md、3c.md 等）只需 `title`，不需要排序字段

---

## 3. 侧边栏系统

### 架构

- `sidebar.ts` — 三个公共导出，**不要手写侧边栏**
- `config.ts` 负责站点配置，`sidebar: generateSidebar()` 是其侧边栏入口

### 三个函数

| 函数 | 职责 | 副作用 |
|------|------|:--:|
| `generateSidebar()` | 初始化，返回缓存对象 | 首次调用时写缓存 |
| `hasSidebarChanged()` | 检测结构是否变化（指纹比对） | 无 |
| `commitSidebarUpdate()` | 更新缓存 + 记录指纹 | 写缓存 |

### 热更新流程

```
.md 文件变更
  → hasSidebarChanged()（指纹比对）
    → 结构相同：VitePress HMR 正常刷新内容
    → 结构不同：commitSidebarUpdate() → touch sidebar.ts → Vite 重载 config → full-reload
```

### 关键实现细节

- `sidebarCache` 是一个对象引用——VitePress 在 `resolveConfig` 时拿到这个引用
- `commitSidebarUpdate()` 用 `Object.assign` + `delete` 原地更新，保持同一个引用
- 轮询间隔 2 秒，在 `config.ts` 的 `sidebar-dev-watch` 插件中实现
- touch `sidebar.ts` 触发 Vite 模块热替换 → 重新求值 `generateSidebar()` → 返回已更新的 `sidebarCache`

---

## 4. CSS 分块约定

```
styles/
├── custom.css   ← 纯导入入口（禁止写样式）
├── vars.css     ← CSS 变量（颜色、callout、按钮）
├── homepage.css ← 首页（Hero、分区、卡片、团队、页脚）
├── callout.css  ← Obsidian Callout 完整样式
└── layout.css   ← 导航栏、排版、暗色模式、<mark> 荧光笔
```

**规则**：新增样式到对应文件，不要写到 `custom.css`。`mark` 荧光笔样式当前在 `custom.css`（历史遗留，后续迁移到 `layout.css`）。

---

## 5. 开发服务器

### 行为

- **编辑已有 .md 内容/frontmatter** → VitePress HMR 即时刷新（不触发 reload）
- **新增/重命名 .md 文件** → 2 秒内自动检测 + 全量 reload
- `npm run dev` 在项目根目录运行，端口默认 5173；默认项目路径为 `/agi-society-cn/`

### 不要做的事

- `server.restart()` — Vite 5 不存在此 API
- `require()` 在 ESM 模块内 — 用顶层 `import`
- `fs.watch` / `handleHotUpdate` / `transformPageData` 做侧边栏热更新 — 全部验证失败
- `Proxy` 包装 sidebar 对象 — VitePress 缓存 config，Proxy getter 永不触发

---

## 6. 禁止事项（已验证失败）

| 方案 | 失败原因 |
|------|---------|
| config.ts 里手写侧边栏 | 新增文件不自动反映 |
| `server.watcher.on('all')` 做 HMR | Windows 下 chokidar 事件不触发 |
| `handleHotUpdate` 返回 `[]` | VitePress 内置 md HMR 先拦截 |
| `fs.watch` + `ws.send` | ESM 环境 `require()` 报错 |
| `Proxy` + mtime 懒重算 | VitePress resolveConfig 后不再读 sidebar |
| `setInterval` 轮询直接 full-reload | 内容编辑也触发全量刷新 |

---

## 7. 测试规范

所有测试脚本统一放在 `tests/` 目录：

```
tests/
├── sidebar.test.ts           vitest + Playwright — 侧边栏自动化
├── callout.spec.mjs          Playwright — Callout 渲染验证
├── callout-debug.spec.mjs    Playwright — Callout 调试
├── nav-consistency.spec.mjs  Playwright — 导航一致性
├── wiki.spec.mjs             Playwright — 维基页面
└── wikilink-plugin.spec.mjs  Node — 双向链接插件 TDD

另有 `scripts/check-content-links.mjs`，用于检查 Obsidian wikilink、公共资源和构建后的 Demo 资源；`scripts/render-nars-catalog.mjs` 用于从结构化 JSON 生成 NARS 索引和各实现页基础资料，`scripts/audit-bilibili-conference.mjs` 用于从协会官方 B 站空间生成会议/组会候选审计报告，`scripts/publish-tencent.mjs` 用于带显式确认地触发腾讯云生产发布。
```

### 运行方式

- **vitest**：`npx vitest run tests/sidebar.test.ts`（需要 dev server 已启动）
- **Playwright**：`node tests/<name>.spec.mjs`
- **插件单元测试**：`NODE_PATH=./node_modules node tests/wikilink-plugin.spec.mjs`（Unix 系列命令，无 Unix 环境则需使用等价命令）

### 构建验证

- 每次改动后运行 `npm run build` 和 `npm run check:content-links`
- `ignoreDeadLinks: true` 已配置，但仍需关注构建警告

### NARS 与会议资料维护
- 修改 data/nars-implementations.json 后运行 npm run nars:catalog；B 站候选审计须核对来源和议程。
- 收录流程、查重纪律、项目范围与作者归属规则见 [NARS 项目与资料维护策略](./docs/nars-catalog-policy.md)。

## 8. 关键文件索引

| 文件 | 作用 |
|------|------|
| `.vitepress/config.ts` | VitePress 配置（nav、插件、轮询） |
| `.vitepress/sidebar.ts` | 侧边栏生成+检测+更新 |
| `.vitepress/head.ts` | HTML 元数据 |
| `.vitepress/theme/index.ts` | 主题入口（Nólëbase 插件 + 自定义组件） |
| `tests/sidebar.test.ts` | 侧边栏自动化测试 |
| `scripts/check-content-links.mjs` | Obsidian wikilink 与构建资源检查 |
| `scripts/render-nars-catalog.mjs` | 从 `data/nars-implementations.json` 生成 NARS 索引和各实现页基础资料 |
| `scripts/audit-bilibili-conference.mjs` | 生成官方 B 站会议/组会候选审计报告 |
| `scripts/publish-tencent.mjs` | 仅在显式确认后触发 main 的腾讯云生产发布 |
| `data/nars-implementations.json` | NARS 各实现的结构化基础资料 |
| `tests/` | 所有测试脚本（6 个） |
| `../CONTRIBUTING.md` | 项目贡献指南（Obsidian / GitHub / 本地构建三种路径） |
| docs/nars-catalog-policy.md | NARS 条目收录与查重规则 |
| docs/development-maintenance.md | Wikilink、补丁、渲染排障与内容恢复细则 |
| `content/contact/contributing/obsidian.md` | Obsidian 编辑指南 |

---

## 9. 内容与技术维护

- 全站内部 Markdown 页面使用 wikilink；改动后运行 npm run build 与 npm run check:content-links。
- 不直接改 node_modules；依赖补丁必须有复现测试并按仓库 patch 流程验证。
- Wikilink、Patch、渲染排障与内容恢复细则见 [内容与代码维护细则](./docs/development-maintenance.md)。

## 10. Agent 行为边界

### 脚本纪律

- 临时脚本写完后必须告知用户其用途和生命周期
- 一次性转换脚本运行后即可丢弃，**不要设计成需要维护的文件列表**
- 批量操作前先检查影响范围，用户确认后再执行
- 当用户说"你亲自改"时，不用脚本，逐条手工编辑

---

## 11. 协作基础设施

- `.obsidian/` 全部 Git 忽略（`content/.obsidian/`），各协作者自行配置
- `CONTRIBUTING.md` 在项目根目录，提供多种贡献路径
- 关键 Obsidian 语法（wikilink、callout、`==高亮==`）确保网站渲染支持
- `content/` 即为 Obsidian vault；公共静态资源放在 `content/public/`

---

## 12. 协作流程

### 重大决策前用结构化提问对齐认知

涉及文件结构重组、Git 策略、命名规范时，使用结构化提问方式（如 Socratic 式提问、弹窗选项等）与用户对齐认知，确认意图后再执行。

### 专注询问，不做盲目修改

进入提问模式后暂停写入性操作，专注于通过提问明确意图。

---

## 13. 技术栈要点

- **Markdown 引擎**：markdown-it + `markdown-it-mark`（`==高亮==`）+ `markdown-it-obsidian-callouts` + `@nolebase/markdown-it-bi-directional-links`（`[[wikilink]]`）
- **双向链接**：`bidirectionalLinks.dir` 指向 `content/` 目录，`[[nars/index|NARS]]` 格式
- **inlineLinkPreview**：当前已禁用（`presetMarkdownIt` + `presetClient` 双 `false`），v2.18.2 SSR 不兼容
- **构建工具**：VitePress v1.6.4 + Nólëbase v2.18.2
- **patch-package**：`npm run postinstall` 自动应用 `patches/` 补丁
