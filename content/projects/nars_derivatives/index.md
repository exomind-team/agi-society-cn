---
comments: true
---

# NARS衍生项目 索引

本页汇总与 NARS 相关的衍生项目：基于 NARS 内核或 NAL 模型，但**不直接实现完整 NARS 推理引擎**的项目（典型如应用、工具、论文附属实现、跨学科扩展）。

若为 NARS 各版实现的直接精简/重写，请见 [[projects/nars_impl/index|NARS各版实现]]。

## OpenNARS 相关实现与分发仓库

下面三项是 opennars 组织下的研究版、发行版和精简版，与应用或可视化工具分别查阅。仓库归属不等于它们拥有完全相同的内核能力；版本与运行方法以各仓库和 [[projects/nars_impl/opennars|OpenNARS 项目页]] 的来源记录为准。

| 项目 | 语言 | 维护者 | 简介 | 仓库 |
|---|---|---|---|---|
| OpenNARS-for-Research | Java | opennars 项目 | OpenNARS 3.1.1 延伸版 | [仓库](https://github.com/opennars/OpenNARS-for-Research) |
| opennars_v3.1.2 | Java | opennars 项目 | OpenNARS 3.1.2 release | [仓库](https://github.com/opennars/opennars_v3.1.2) |
| opennars-demavenized | Java | opennars 项目 | 无 Maven，并移除部分控制功能的精简版 | [仓库](https://github.com/opennars/opennars-demavenized) |

Java 核心的组件接入与应用示例另见下方 `opennars-applications`，以及 [[learn/projects|按用途选择项目]]。本页不将研究版、发行版、精简版与应用层合并为一个软件包，也不据仓库同属一个组织推断某示例已经内置。

## 主轴：NARS 在项目中的地位（深度由深到浅）

> 收录时按两族区分——"直接使用 NARS" 与 "灵感启发自 NARS"——并按"集成 / 应用 / 启发"层次由深到浅排列。

### A. 直接使用 NARS（调用 NARS 引擎、以 NARS 为子模块 / RPC / IO）

#### A1. 运行时集成：把成熟 NARS 引擎作为子进程 / RPC / 库调用

- [[channels|OpenNARS Channels]]（opennars/Channels，Python）— 把 OpenNARS NAR shell 接进自然语言 / 知识库 / 传感器
- [[narca|NARCA]]（ntoxeg/narca，Python，Apache-2.0）— NARS Controlled Agent 框架
- [ONAT](https://github.com/maxeeem/ONAT)（maxeeem/ONAT，Python）— OpenNARS Bridge Agent；用 ONA 推理 + 神经符号桥
- [[nars-fighterplane|NARS-FighterPlane]]（Noctis-Xu，Python）— 用 NARS 当战机游戏 AI 的 demo（v1.0 / v2.0，pygame + ONA/OpenNARS）

#### A3. 框架 / 可视化 / 应用：在 NARS 上的 IO 抽象、桥接、可视化、教学

- [[babelnar|BabelNAR 项目集 / NAVM 模型]]（ARCJ137442，Rust/Julia）— 跨 NARS 实现的 IO 抽象 + NAVM 非公理虚拟机
- [[nace|NACE]]（patham9 / ntoxeg，Python / Julia）— 基于 NARS 的因果探索器
- [[nars-pong|NARS-Pong]]（ccrock4t，Tcl + Unity3D）— NARS 驱动游戏 NPC 的 Pong demo
- [NARS-Unity](https://github.com/ccrock4t/NARS-Unity)（ccrock4t，C#）— C# NARS for Unity（从 NARS-Python v0.4 移植）
- [NARS-Visualization](https://github.com/ccrock4t/NARS-Visualization)（ccrock4t，C#）— NARS graphical visualization tool
- [NARS-Web-GUI](https://github.com/ccrock4t/NARS-Web-GUI)（ccrock4t，JavaScript）— NARS Web GUI
- [NARSBlocksWorldEvolution](https://github.com/ccrock4t/NARSBlocksWorldEvolution)（ccrock4t，C#，2025-10）— 块世界演化实验
- [NARSGridWorldEvolution](https://github.com/ccrock4t/NARSGridWorldEvolution)（ccrock4t，C#，2025-10）— 网格世界演化实验
- [opennars-applications](https://github.com/opennars/opennars-applications)（opennars 组织，Java）— OpenNARS v3.0.0+ 应用层（Lab 之外，MIT 许可）

### B. 灵感启发自 NARS（不调用 NARS 引擎，也不完整实现 NAL）

#### B1. 控制 / AGI 应用：借鉴 NAL/NARS 思想于其他技术栈

- [[nnesycef|NNeSyCeF]]（PtrMan，F#）— 基于 NAL 真值与 AIKR 的神经符号 AGI 框架
- [MacNARS / autonars](https://github.com/maxeeem/autonars)（maxeeem，C++，2026-06）— Apple Silicon Metal 加速的 "NARS-inspired control prototype"，手写控制器做 CartPole

#### B2. 学术 / 论文附属 / 实验笔记

- [[nars-gpt|NarsGPT]]（patham9 + narsgpt 组织，Python）— 用 GPT 模型模拟 NAL 推理，含 AAAI 2023 匿名提交版与 patham9 版；按 CLAUDE.md §"NARS 实现的准入范围"判定**不属于 NARS 实现**
- [[pixel-to-concept-reader|Pixel-to-Concept Reader]]（poerlang，TypeScript）— 阅读友好的"结构化 NAL 词条 + 手写数字识别"论文附属实现
- [nars-workshop-2024](https://github.com/maxeeem/nars-workshop-2024)（maxeeem，Python）— NARS Workshop 2024 配套笔记，miniKanren-based NAL inference

## 已收录（按上述分类汇总）

### A. 直接使用 NARS

#### A1. 运行时集成（4 项）

| 项目 | 语言 | 维护者 | 简介 | 仓库 |
|---|---|---|---|---|
| [[channels\|OpenNARS Channels]] | Python | opennars 项目 | OpenNARS NAR shell 的自然语言 / 知识库 / 传感器通道 | [仓库](https://github.com/opennars/Channels) |
| [[narca\|NARCA]] | Python | ntoxeg | 基于 NARS 的可控智能体框架 | [仓库](https://github.com/ntoxeg/narca) |
| ONAT | Python | maxeeem | OpenNARS Bridge Agent | [仓库](https://github.com/maxeeem/ONAT) |
| [[nars-fighterplane\|NARS-FighterPlane]] | Python | Noctis-Xu（Boyang Xu） | NARS 控制战机游戏 AI 的 demo | [仓库](https://github.com/Noctis-Xu/NARS-FighterPlane) |

#### A3. 框架 / 可视化 / 应用

| 项目 | 语言 | 维护者 | 简介 | 仓库 |
|---|---|---|---|---|
| [[babelnar\|BabelNAR 项目集 / NAVM 模型]] | Rust / Julia | ARCJ137442 | 围绕 NAVM + CIN 的项目群 | [NAVM.rs](https://github.com/ARCJ137442/NAVM.rs) ｜ [BabelNAR.rs](https://github.com/ARCJ137442/BabelNAR.rs) |
| [[nace\|NACE]] | Python / Julia | patham9 / ntoxeg | 因果探索器 | [Python](https://github.com/patham9/NACE) ｜ [Julia](https://github.com/ntoxeg/NACE.jl) |
| [[nars-pong\|NARS-Pong]] | Tcl / Unity3D | ccrock4t | NARS 驱动游戏 NPC 的 Pong demo | [仓库](https://github.com/ccrock4t/NARS-Pong) |
| NARS-Unity | C# | ccrock4t | C# NARS for Unity | [仓库](https://github.com/ccrock4t/NARS-Unity) |
| NARS-Visualization | C# | ccrock4t | NARS graphical visualization | [仓库](https://github.com/ccrock4t/NARS-Visualization) |
| NARS-Web-GUI | JavaScript | ccrock4t | NARS Web GUI | [仓库](https://github.com/ccrock4t/NARS-Web-GUI) |
| NARSBlocksWorldEvolution | C# | ccrock4t | 块世界演化实验（2025-10） | [仓库](https://github.com/ccrock4t/NARSBlocksWorldEvolution) |
| NARSGridWorldEvolution | C# | ccrock4t | 网格世界演化实验（2025-10） | [仓库](https://github.com/ccrock4t/NARSGridWorldEvolution) |
| opennars-applications | Java | opennars 项目 | OpenNARS 应用层（MIT） | [仓库](https://github.com/opennars/opennars-applications) |

### B. 灵感启发自 NARS

| 项目 | 语言 | 维护者 | 简介 | 仓库 |
|---|---|---|---|---|
| [[nnesycef\|NNeSyCeF]] | F# | PtrMan | NAL + AIKR 神经符号 AGI 框架 | [仓库](https://github.com/PtrMan/NNeSyCeF) |
| MacNARS / autonars | C++ | maxeeem | Apple Silicon Metal 加速的 "NARS-inspired" CartPole prototype | [仓库](https://github.com/maxeeem/autonars) |
| [[nars-gpt\|NarsGPT]] | Python | patham9 + narsgpt 组织 | GPT 模型模拟 NAL 推理（AAAI 2023 提交版 + patham9 版） | [patham9/NarsGPT](https://github.com/patham9/NarsGPT) ｜ [narsgpt/NARS-GPT](https://github.com/narsgpt/NARS-GPT) |
| [[pixel-to-concept-reader\|Pixel-to-Concept Reader]] | TypeScript | poerlang | 结构化 NAL 词条 + 手写数字识别论文附属 | [仓库](https://github.com/poerlang/pixel-to-concept-reader) |
| nars-workshop-2024 | Python | maxeeem | miniKanren-based NAL inference talk 笔记 | [仓库](https://github.com/maxeeem/nars-workshop-2024) |

## 候选与待收录

按"fork 链透明度确认前不升格"原则，下列项目仍待主项目方确认或本地可核验的二次改造证据，方可正式收录：

### poerlang 名下 fork

- [mininars](https://github.com/poerlang/mininars) — 仓库方声明"又一个 NARS 精简版"；属于 OpenNARS 系列的 fork 链（`fork:true`，parent `patham9/opennars_declarative_core`，source `opennars/opennars_googlecode`）。若用户能补 README 中关于"精简到哪些部分、保留哪些 NAL 层"的具体改造描述即可升格
- [PyNARS](https://github.com/poerlang/PyNARS)（poerlang fork）— "pynars version editted by Tory Li"。属于 bowen-xu/PyNARS 的 fork，待主线项目方确认价值

> 历史说明：`he4o` / `HELIX_THEORY` 已从本候选清单移除——这两个原本挂在 poerlang 名下，但 GitHub 上 `parent`/`source` 都指向 jiaxiaogang/HE、jiaxiaogang/HELIX_THEORY（原作者 jiaxiaogang / 贾晓刚 的"螺旋抗熵"AGI 平行理论），且未见到可核验的二次改造。按 CLAUDE.md §"挂回原作者"，应挂回 [jiaxiaogang/HE](https://github.com/jiaxiaogang/HE) / [jiaxiaogang/HELIX_THEORY](https://github.com/jiaxiaogang/HELIX_THEORY)；且因这俩与 NARS 没有直接字样关联（仅 AGI 平行思路），本就**不在 nars_derivatives 收录范围**内
