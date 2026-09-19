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

另有 `scripts/check-content-links.mjs`，用于检查 Obsidian wikilink、公共资源和构建后的 Demo 资源；`scripts/render-nars-catalog.mjs` 用于从结构化 JSON 生成 NARS 实现总表，`scripts/audit-bilibili-conference.mjs` 用于从协会官方 B 站空间生成会议/组会候选审计报告。
```

### 运行方式

- **vitest**：`npx vitest run tests/sidebar.test.ts`（需要 dev server 已启动）
- **Playwright**：`node tests/<name>.spec.mjs`
- **插件单元测试**：`NODE_PATH=./node_modules node tests/wikilink-plugin.spec.mjs`（Unix 系列命令，无 Unix 环境则需使用等价命令）

### 构建验证

- 每次改动后运行 `npm run build` 和 `npm run check:content-links`
- `ignoreDeadLinks: true` 已配置，但仍需关注构建警告

### NARS 与会议资料维护

- 修改 `data/nars-implementations.json` 后运行 `npm run nars:catalog`，不要手工维护总表的重复字段
- B 站候选审计需要先通过 web-access/CDP 打开协会官方空间，再运行 `node scripts/audit-bilibili-conference.mjs --target=<CDP target id> --write`
- B 站脚本只生成候选报告，不自动把视频归入年会或组会；正式入库前必须核对标题、发布时间、合集分页与议程
- NARS 理论原始资料入口维护在 `content/research/nars/theory/nac/source-materials.md`

---

## 8. 关键文件索引

| 文件 | 作用 |
|------|------|
| `.vitepress/config.ts` | VitePress 配置（nav、插件、轮询） |
| `.vitepress/sidebar.ts` | 侧边栏生成+检测+更新 |
| `.vitepress/head.ts` | HTML 元数据 |
| `.vitepress/theme/index.ts` | 主题入口（Nólëbase 插件 + 自定义组件） |
| `tests/sidebar.test.ts` | 侧边栏自动化测试 |
| `scripts/check-content-links.mjs` | Obsidian wikilink 与构建资源检查 |
| `scripts/render-nars-catalog.mjs` | 从 `data/nars-implementations.json` 生成 NARS 实现总表 |
| `scripts/audit-bilibili-conference.mjs` | 生成官方 B 站会议/组会候选审计报告 |
| `data/nars-implementations.json` | NARS 各实现的结构化基础资料 |
| `tests/` | 所有测试脚本（6 个） |
| `../CONTRIBUTING.md` | 项目贡献指南（Obsidian / GitHub / 本地构建三种路径） |
| `content/contact/contributing/obsidian.md` | Obsidian 编辑指南 |

---

## 9. Wikilink 编写规范

### 死命令

**Obsidian 中能正常打开的链接，部署到网站必须同样有效并能打开。**

### 命名原则

- **能不用路径就不用路径**：`[[ona|ONA]]` 而非 `[[impls/ona|ONA]]`
- 同名文件（如 `index.md` 有 29 个、`ona.md` 有 2 个）必须保留最小父目录前缀消歧义：`[[impls/ona|ONA]]`
- 跨目录引用父级：`[[../index|NARS]]`
- 全站统一使用 `[[wikilink]]`，**禁止**写 `[text](./path/to/file.md)` 形式的 Markdown 内链

### 表格内的 wikilink

表格中 `[[target|display]]` 的 `|` 会被 Markdown 解析为列分隔符，必须用反斜杠转义：

```markdown
| 届次 | 详情 |
|------|------|
| [[2016\|第一届]] | ... |
```

### 全站内链转换

- 所有指向 `.md` 文件的内链必须转为 `[[wikilink]]` 格式
- 外部链接（B站、GitHub、优酷）保持 `[text](url)` 不变
- 图片链接保持 `![alt](url)` 不变

---

## 10. Patch 规范（node_modules 修补）

### 何时使用

依赖包的 Bug 或缺失功能影响业务需求，且不适合 fork/等上游修复时。

### TDD 流程

1. 写最小复现测试钉住问题（`temp/test-xxx.js`）
2. 修改 `node_modules` 中对应文件
3. 测试通过后，运行 `npx patch-package <package-name>` 生成 patch
4. `rm -rf node_modules && npm install` 验证 patch 自动生效（Unix 系列命令，无 Unix 环境则需使用等价命令）

### 共享逻辑提取

如果需要修改双入口包（`.cjs` + `.mjs`），将公共逻辑提取到一个 `.cjs` 文件，两个入口分别导入。**CJS 可以作为 CJS 和 ESM 的共同导入目标。**

### 配置

- `package.json` 的 `postinstall` 脚本已配置 `patch-package`，无需手动执行
- `patches/` 目录随仓库提交

---

## 11. Agent 行为边界

### 脚本纪律

- 临时脚本写完后必须告知用户其用途和生命周期
- 一次性转换脚本运行后即可丢弃，**不要设计成需要维护的文件列表**
- 批量操作前先检查影响范围，用户确认后再执行
- 当用户说"你亲自改"时，不用脚本，逐条手工编辑

---

## 12. 链接与渲染

### 渲染异常诊断流程

Markdown → markdown-it 转译 → Vue 模板编译 → SSR → 客户端 hydration。每一层都可能出问题。

- 查看构建产物的 SSR HTML 确认组件是否正确渲染
- 查看编译后的 JS（`.lean.js`）确认 `resolveComponent` 调用
- 第三方包有 bug 时在 VitePress 配置层禁用，不直接改 `node_modules`（除 TDD patch 流程外）

### 脚本输出的 Markdown 必须构建验证

`vitepress build` 后检查表格渲染为 `<table>` / `<th>` / `<td>`（不是 `<p>` 内嵌 `|`）。

### 构建失败时优先清缓存

```bash
rm -rf dist .vitepress/cache node_modules/.vite
npx vitepress build
```

> 注：以上为 Unix 系列命令，无 Unix 环境则需使用等价命令。

---

## 13. 内容补全

### 历史数据恢复三层策略

1. **Git 历史** — `git show <commit> -- <file>` 提取原始内容
2. **平台 API** — B站 `pagelist` 接口获取分P时间戳
3. **浏览器搜索** — web-access / CDP 搜索缺失条目

每层完成确认无遗漏后再进下一层。

### 中文语义分割—脚本初稿，人工校验

顿号 `、` 分隔的多人名、英文名、课题组名、"群体讨论"等非人名，脚本跑完必须人工复查。

---

## 14. 协作基础设施

- `.obsidian/` 全部 Git 忽略（`content/.obsidian/`），各协作者自行配置
- `CONTRIBUTING.md` 在项目根目录，提供多种贡献路径
- 关键 Obsidian 语法（wikilink、callout、`==高亮==`）确保网站渲染支持
- `content/` 即为 Obsidian vault；公共静态资源放在 `content/public/`

---

## 15. 协作流程

### 重大决策前用结构化提问对齐认知

涉及文件结构重组、Git 策略、命名规范时，使用结构化提问方式（如 Socratic 式提问、弹窗选项等）与用户对齐认知，确认意图后再执行。

### 专注询问，不做盲目修改

进入提问模式后暂停写入性操作，专注于通过提问明确意图。

---

## 16. 技术栈要点

- **Markdown 引擎**：markdown-it + `markdown-it-mark`（`==高亮==`）+ `markdown-it-obsidian-callouts` + `@nolebase/markdown-it-bi-directional-links`（`[[wikilink]]`）
- **双向链接**：`bidirectionalLinks.dir` 指向 `content/` 目录，`[[nars/index|NARS]]` 格式
- **inlineLinkPreview**：当前已禁用（`presetMarkdownIt` + `presetClient` 双 `false`），v2.18.2 SSR 不兼容
- **构建工具**：VitePress v1.6.4 + Nólëbase v2.18.2
- **patch-package**：`npm run postinstall` 自动应用 `patches/` 补丁
