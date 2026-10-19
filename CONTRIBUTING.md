# 贡献指南

欢迎为 AGI Society Wiki 贡献内容！

## 方式一：通过 Obsidian 编辑（推荐，无需编程）

本项目的 `content/` 目录是一个 Obsidian 知识库。你只需安装 Obsidian 并打开该目录即可编辑所有维基内容。

详见 **[Obsidian 编辑指南](content/contact/contributing/obsidian.md)**。

## 方式二：通过 GitHub 编辑

1. Fork 本仓库
2. 在 `content/` 目录下新增或修改 `.md` 文件
3. 提交 Pull Request

## 方式三：本地构建预览

```bash
npm install
npm run dev
```

详见 [工具配置](content/contact/contributing/tools.md)。

## 新增 NARS 实现条目

任何向 `data/nars-implementations.json` 添加 NARS 实现的工作，请先按 `CLAUDE.md` §"收录 NARS 实现的查重纪律"做来源溯源：

- 查清 GitHub `parent` / `source` 字段（fork 链是否在 OpenNARS 系列内）
- 抽样对比源文件，与已知 OpenNARS 主线仓库核对
- fork 透明 + 有二次改造 → 可入索引，并在 `notes` / `generation` 字段写明二次内容
- 换名复刻、无改造证据 → 不收录；写"未核实 / 占位"也不适合，应直接拒绝
