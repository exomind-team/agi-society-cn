---
comments: true
---

# Exnars

<!-- BEGIN GENERATED NARS PROFILE -->

## 基础资料

> 本节由 data/nars-implementations.json 生成；项目特有教程和源码观察仍在本页维护。

| 字段 | 已核验信息 |
|---|---|
| 代际 / 定位 | 暂未公开（项目方未提供代号或定位说明） |
| 编程语言 | Elixir |
| 作者 / 维护组织 | 孙常新 |
| 代码仓库 | [仓库]() |
| 许可证 | 未知 |
| Narsese / NAL 边界 | 本轮未核实 |
| 运行 / Demo | 本轮未核实 |
| 最近公开提交 | 未知（仅为仓库元数据观察值） |
| 维护状态 | 暂未公开发布 |
| 最后核验 | 2026-09-20 |

<!-- END GENERATED NARS PROFILE -->

> [!warning] 暂未公开
> 本站核验记录：该实现的编程语言为 Elixir，作者为孙常新。
> 本轮在 GitHub/Gitee 上未检索到公开仓库；暂不收录实现细节，待项目正式发布后再补充基础资料。

## 项目观察

> 本节只描述公开元信息（项目骨架、顶层目录、mix.exs 声明字段），**不涉及任何具体源码、模块名、API 表面或实现细节**。等仓库公开后再作技术性补充。

- 平台层：基于 Erlang/OTP 与 Elixir，编译与构建走 `mix.exs`
- 项目形态：标准 Elixir umbrella（`apps_path: "apps"`）
- 顶层目录骨架：`apps/`（子应用）、`config/`、`deps/`、`tests/`、`logs/`、`_build/`，与 Elixir/OTP 项目惯例一致
- 子应用分组：当前 `apps/` 下可见 `core`、`deque` 两个子应用目录（命名仅指项目骨架，未展开内部模块）
- 元数据：`mix.exs` 声明 `version: "0.1.0"`；顶层 `README.md` 仅含 `TODO: Add description`，项目方尚未撰写正式描述
- 项目阶段：基于上述元信息判断仍处于早期骨架与内部实现阶段；面向外部的描述、教程、运行指引尚未公开书写

## 现状与计划

- 入库口径：本页只接收已核验事实（语言、维护者）；在仓库公开前不收录具体的实现、模块、测试或运行命令
- 待补的字段：项目定位（代际 / 与 NARS 理论对应关系）、许可证、Narsese / NAL 边界、运行 / Demo、最近公开提交、维护状态
- 收录路径：仓库一旦在 GitHub 或 Gitee 公开，把 `data/nars-implementations.json` 中的 `exnars` 条目按公开资料补齐，重新跑 `npm run nars:catalog` 即可在本页与 `index.md` 中体现
