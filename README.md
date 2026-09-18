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
│         在浏览器 http://localhost:5173 预览   │
│         │                                    │
│         提交 Pull Request                     │
│                                              │
└─────────────────────────────────────────────┘
```

1. 打开 Obsidian → "打开其他 Vault" → 选择 `content/` 目录
2. 像写笔记一样编辑 Markdown，Obsidian 所见即所得
3. 浏览器访问 `http://localhost:5173` 实时预览最终效果
4. 满意后提交 Pull Request

> 编辑已有文件内容网站会即时刷新。**新增文件后侧边栏 2 秒内自动更新**，无需重启。

### 内容结构

```
content/
├── index.md           # 首页
├── about/             # 协会简介、研究团队
├── research/          # 学术研究（NARS 理论、GTI、NAC）
├── conference/        # 学术会议（2016-2026 年会 + 组会）
├── content/           # Obsidian 知识库内容（维基、研究、会议与项目）
├── projects/          # 项目介绍
└── contact/           # 联系我们
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
npm run dev          # 启动开发服务器 → http://localhost:5173
npm run build        # 构建生产版本 → dist/
npm run serve        # 预览构建产物
```

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
