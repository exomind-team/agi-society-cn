---
comments: true
---

# Obsidian 编辑指南

本站的 `content/` 目录是一个 **Obsidian 知识库**（vault）。我们推荐使用 [Obsidian](https://obsidian.md) 编辑内容，它提供了优秀的 Markdown 编辑体验和知识管理功能。

## 快速开始

1. 安装 [Obsidian](https://obsidian.md/download)
2. 打开 Obsidian，点击「打开其他知识库」→「打开本地文件夹」
3. 选择项目中的 `content/` 目录
4. 现在你可以浏览、编辑、搜索所有维基内容了

## 推荐插件

以下社区插件可以增强编辑体验（**非必需**，但推荐安装）：

| 插件 | 用途 |
|------|------|
| **Obsidian Git** | 自动提交和推送更改到 Git 仓库 |
| **Better Word Count** | 显示选中文字的字符数 |

> [!tip] 内置支持
> Obsidian 原生支持 wikilink（`[[页面名]]`）、callout（`> [!info]` 等）和荧光笔高亮（`==文本==`），无需额外插件。网站渲染也已完全支持这三种语法。

## 编辑规范

- 页面间使用 `[[wikilink]]` 格式链接，路径相对于 `content/` 根目录
- 使用 `> [!info]` / `> [!warning]` / `> [!tip]` 等 callout 增强可读性
- 文件命名使用小写英文和下划线，如 `nars/theory/aikr.md`
- 新页面需在 frontmatter 中添加 `comments: true` 以启用评论区

## 本地开发（可选）

如需在本地预览网站效果，请参考[[contact/contributing/tools|工具配置]]。
