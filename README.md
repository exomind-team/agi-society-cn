# AGI Society CN

中国通用人工智能协会（AGI Society CN）官方网站。基于 **VitePress + Nólëbase** 构建的学术知识库。

🔗 在线访问：<https://exomind-team.github.io/agi-society-cn/>

---

## Obsidian 所见即所得编辑（推荐）

本项目的 `content/` 目录就是一个 **Obsidian Vault**。你用 Obsidian 编辑内容时看到的效果，就是网站上最终呈现的效果。

### 前提

- 安装了 [Node.js](https://nodejs.org/)（≥22）
- 安装了 [Obsidian](https://obsidian.md/)

### 开始编辑

```bash
# 1. 克隆仓库
git clone https://github.com/exomind-team/agi-society-cn.git
cd agi-society-cn

# 2. 安装依赖（仅需一次）
npm install

# 3. 启动本地预览服务器
npm run dev
```

### 编辑流程

```
┌─────────────────────────────────────────────┐
│                                              │
│   用 Obsidian 打开 content/ 目录              │
│         │                                    │
│         编辑、新建 .md 文件                   │
│         │                                    │
│   在浏览器 http://localhost:5173/agi-society-cn/ 预览 │
│         │                                    │
│         提交 Pull Request                     │
│                                              │
└─────────────────────────────────────────────┘
```

1. 打开 Obsidian → "打开其他 Vault" → 选择 `content/` 目录
2. 像写笔记一样编辑 Markdown，Obsidian 所见即所得
3. 浏览器访问 `http://localhost:5173/agi-society-cn/` 实时预览最终效果
4. 满意后提交 Pull Request

> 编辑已有文件内容网站会即时刷新。**新增文件后侧边栏 2 秒内自动更新**，无需重启。

### 内容结构

```
content/
├── index.md           # 首页
├── about/             # 协会简介、研究团队
├── research/          # 学术研究（NARS 理论、GTI、NAC）
├── conference/        # 学术会议（2016-2026 年会 + 组会）
├── wiki/               # 思想书库等维基内容
├── projects/          # 项目介绍
├── contact/           # 联系我们
└── public/             # 发布到站点根路径的公共资源
```

每个目录对应网站导航栏的一个板块。新增页面放到对应目录即可自动出现在侧边栏中。

### 页面元数据（Frontmatter）

页面顶部 `---` 之间的内容决定了它在网站上的显示方式：

```yaml
---
title: 页面标题           # 同时作为侧边栏显示名
date: 2024-07-13         # 日期（会议页面需要，用于排序）
order: 1                 # 手动排序（数字越小越靠前）
comments: true           # 开启评论区
---
```

> 详细的 frontmatter 规范请参阅 [CLAUDE.md](./CLAUDE.md) 第 2 章。

---

## 本地构建与预览

```bash
npm install          # 安装依赖（仅需一次）
npm run dev          # 启动开发服务器 → http://localhost:5173/agi-society-cn/
npm run build        # 构建生产版本 → dist/
npm run check:content-links  # 检查 Obsidian wikilink 与构建资源
npm run nars:catalog # 从结构化资料生成 NARS 索引和各实现页的基础资料
npm run publish:tencent --confirm=tencent-main # 明确批准后，手动触发 main 的腾讯云生产发布
npm run serve        # 预览构建产物
```

会议与 NARS 资料维护还提供辅助命令：`npm run nars:catalog` 会根据 `data/nars-implementations.json` 更新索引和各实现页；B 站审计脚本需要通过 web-access/CDP 提供目标页，再运行 `node scripts/audit-bilibili-conference.mjs --target=<CDP target id> --write`。脚本只生成候选报告，正式更新会议页面前仍需人工核对。

普通 `dev`/`main` 推送只用于 GitHub Pages 测试和 Gitea 源码镜像同步；腾讯云正式镜像必须在 `main` 干净且已推送后，人工执行 `npm run publish:tencent --confirm=tencent-main`，并在 GitHub Actions 的 `publish_tencent` 选项中确认。

---

## 贡献方式

| 方式 | 适用人群 | 说明 |
|------|---------|------|
| **Obsidian 编辑** | 所有人 | 打开 `content/` Vault 即可编辑，无需编程 |
| **GitHub PR** | 熟悉 Git | Fork → 修改 .md → 提交 PR |
| **GitHub Issue** | 所有人 | 提交建议或问题 |

详细指南见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

---

## 技术栈

| 层面 | 技术 |
|------|------|
| 构建引擎 | VitePress |
| Markdown 增强 | Nólëbase Integrations（Wikilink、Callout、页面属性） |
| 样式 | CSS 自定义（学术极简风格） |
| 部署 | GitHub Pages + 自建服务器 |

---

## 开发参考

- [CLAUDE.md](./CLAUDE.md) — Agent 开发规范（15 章）
- [CONTRIBUTING.md](./CONTRIBUTING.md) — 贡献指南
- [Nólëbase 文档](https://nolebase.ayaka.io/)
- [VitePress 文档](https://vitepress.dev/)

## 许可证

内容采用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 许可。代码采用 MIT 许可。


## 先锋版人物与社区融合演示

预览分支 `dot/dev-agi-society-cn-20261019` 包含人物、论文、会议报告反链与 `/community` 精简社区本地演示。社区仅保存本机草稿并可导出，不连接真实 Discourse、不提供账号或发帖服务。引用带条目、段落摘录和快照版本，讨论可返回来源；规则候选不等同已确认事实。

构建完整离线 HTML：先执行 `VITEPRESS_PREVIEW=true VITEPRESS_BASE=/ npm run build`，再运行 `node scripts/offline/build.mjs`，结果位于 `delivery/offline/AGI-Wiki-完整离线预览.html`。Windows 可先在 PowerShell 设置 `$env:VITEPRESS_PREVIEW="true"; $env:VITEPRESS_BASE="/"` 后执行构建。外部视频和论文需联网；原始转写不进搜索和目录，但持有文件者可直接读取，不属于私密访问控制。

详见 [社区演示规格](docs/specs/community-demo.md) 与 [人物关系规格](docs/specs/wiki-relations.md)。历史保留测试还需要对应旧 Git 对象／构建基线，不能把本地复跑通过误认为干净 clone 已自带全部历史夹具。

分块交付可运行 `python scripts/offline/package.py delivery/offline/AGI-Wiki-完整离线预览.html delivery/parts`。每块不超过 5,000,000 字节；生成的清单与 PowerShell/Python 合并脚本校验逐块与总 SHA256，保留原分块，不修改系统执行策略。

### 单文件离线预发行版

先锋分支可通过修改 `release/offline-preview.json` 触发全站离线打包。预发行版同时提供独立 HTML 与 ZIP；可直接下载 HTML 后用浏览器打开，或解压 ZIP 阅读，两者正文文件完全相同，不再需要聊天分块合并（不是 GitHub 在线托管预览）；附源码 commit 与 SHA256。社区仅本地演示，未索引原料仍可访问，不是私密资料。发布边界、手动入口限制与验收见[离线预发行规范](docs/specs/offline-prerelease.md)。
