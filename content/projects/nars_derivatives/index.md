---
comments: true
---

# NARS衍生项目 索引

本页汇总与 NARS 相关的衍生项目：基于 NARS 内核或 NAL 模型，但**不直接实现完整 NARS 推理引擎**的项目（典型如应用、工具、论文附属实现、跨学科扩展）。

若为 NARS 各版实现的直接精简/重写，请见 [[../index\|NARS各版实现]]。

## 主轴：NARS 在项目中的地位（深度由深到浅）

> 收录时按两族区分——"直接使用 NARS" 与 "灵感启发自 NARS"——并按"集成 / 应用 / 启发"层次由深到浅排列。

### A. 直接使用 NARS（调用 NARS 引擎、以 NARS 为子模块 / RPC / IO）

#### A1. 运行时集成：把成熟 NARS 引擎作为子进程 / RPC / 库调用

- [[channels\|OpenNARS Channels]]（opennars/Channels，Python）— 把 OpenNARS NAR shell 接进自然语言 / 知识库 / 传感器
- [[narca\|NARCA]]（ntoxeg/narca，Python，Apache-2.0）— NARS Controlled Agent 框架

#### A3. 框架 / 可视化 / 应用：在 NARS 上的 IO 抽象、桥接、可视化、教学

- [[babelnar\|BabelNAR 项目集 / NAVM 模型]]（ARCJ137442，Rust/Julia）— 跨 NARS 实现的 IO 抽象 + NAVM 非公理虚拟机
- [[nace\|NACE]]（patham9 / ntoxeg，Python / Julia）— 基于 NARS 的因果探索器

### B. 灵感启发自 NARS（不调用 NARS 引擎，也不完整实现 NAL）

#### B1. 控制 / AGI 应用：借鉴 NAL/NARS 思想于其他技术栈

- [[nnesycef\|NNeSyCeF]]（PtrMan，F#）— 基于 NAL 真值与 AIKR 的神经符号 AGI 框架

#### B2. 学术 / 论文附属 / 实验笔记

- [[nars-gpt\|NarsGPT]]（patham9 + narsgpt 组织，Python）— 用 GPT 模型模拟 NAL 推理，含 AAAI 2023 匿名提交版与 patham9 版；按 CLAUDE.md §"NARS 实现的准入范围"判定**不属于 NARS 实现**
- [[pixel-to-concept-reader\|Pixel-to-Concept Reader]]（poerlang，TypeScript）— 阅读友好的"结构化 NAL 词条 + 手写数字识别"论文附属实现

## 已收录（按上述分类汇总）

| 项目 | 语言 | 维护者 | 简介 | 仓库 |
|---|---|---|---|---|
| [[channels\|OpenNARS Channels]] | Python | opennars 项目 | OpenNARS NAR shell 的自然语言 / 知识库 / 传感器通道 | [仓库](https://github.com/opennars/Channels) |
| [[narca\|NARCA]] | Python | ntoxeg | 基于 NARS 的可控智能体框架 | [仓库](https://github.com/ntoxeg/narca) |
| [[babelnar\|BabelNAR 项目集 / NAVM 模型]] | Rust / Julia | ARCJ137442 | 围绕 NAVM + CIN 的项目群，含十余个子项目 | [NAVM.rs](https://github.com/ARCJ137442/NAVM.rs) ｜ [BabelNAR.rs](https://github.com/ARCJ137442/BabelNAR.rs) |
| [[nace\|NACE]] | Python / Julia | patham9 / ntoxeg | 基于 NARS 的因果探索工具 | [Python 版](https://github.com/patham9/NACE) ｜ [Julia 复刻](https://github.com/ntoxeg/NACE.jl) |
| [[nnesycef\|NNeSyCeF]] | F# | PtrMan | 基于 NAL 真值与 AIKR 的神经符号 AGI 框架 | [仓库](https://github.com/PtrMan/NNeSyCeF) |
| [[nars-gpt\|NarsGPT]] | Python | patham9；narsgpt 组织（AAAI 2023 匿名提交） | 用 GPT 模型模拟 NAL 推理路径；项目页内并列介绍 patham9 版与 AAAI 2023 匿名提交版 | [patham9/NarsGPT](https://github.com/patham9/NarsGPT) ｜ [narsgpt/NARS-GPT](https://github.com/narsgpt/NARS-GPT) |
| [[pixel-to-concept-reader\|Pixel-to-Concept Reader]] | TypeScript | poerlang | 阅读友好的"结构化 NAL 词条 + 手写数字识别"论文附属实现 | [仓库](https://github.com/poerlang/pixel-to-concept-reader) |

## 候选与待收录

最近一次盘点 ARCJ137442、patham9、ntoxeg、poerlang、PtrMan、ccrock4t、maxeeem、opennars 等 NARS 作者/组织的公开仓库，识别到一批与 NARS / AGI 主题相关但本轮未单独建项目页、或与查重纪律存在边界争议的候选：

### ccrock4t 名下（Unity 与可视化应用）

- [NARS-Unity](https://github.com/ccrock4t/NARS-Unity) — C# NARS for Unity；可入 A3. 应用层；本轮尚未建项目页
- [NARS-Visualization](https://github.com/ccrock4t/NARS-Visualization) — NARS graphical visualization tool；可入 A3. 应用层
- [NARS-Web-GUI](https://github.com/ccrock4t/NARS-Web-GUI) — Web GUI；可入 A3. 应用层
- [NARS-Pong](https://github.com/ccrock4t/NARS-Pong) — NARS Pong in Unity3D；可入 A3. 应用层
- [NARSBlocksWorldEvolution](https://github.com/ccrock4t/NARSBlocksWorldEvolution) — 块世界演化（README 暂缺）；可入 B2. 实验
- [NARSGridWorldEvolution](https://github.com/ccrock4t/NARSGridWorldEvolution) — 网格世界演化（README 暂缺）；可入 B2. 实验

### maxeeem 名下（B 族学术衍生为主）

- [autonars](https://github.com/maxeeem/autonars) / MacNARS — "NARS-inspired control prototype"，Apple Silicon Metal 加速；**B1. 灵感启发**，本轮未单独建项目页
- [ONAT](https://github.com/maxeeem/ONAT) — OpenNARS Bridge Agent；**A1. 运行时集成**，本轮未单独建项目页
- [nars-workshop-2024](https://github.com/maxeeem/nars-workshop-2024) — NARS Workshop 2024 talk 配套笔记，miniKanren-based NAL inference；**B2. 学术衍生**

### poerlang 名下

- [mininars](https://github.com/poerlang/mininars) — 项目方声明"又一个 NARS 精简版"；属于 OpenNARS 系列的 fork 链（`fork:true`，parent `patham9/opennars_declarative_core`，source `opennars/opennars_googlecode`），按查重纪律在 fork 链透明度确认前不入"已收录"
- [PyNARS](https://github.com/poerlang/PyNARS)（poerlang fork）— "pynars version editted by Tory Li"；同上，待主线 PyNARS 项目方确认
- `he4o` / `HELIX_THEORY`（已从本候选清单移除）—— 这两个原本挂在 poerlang 名下，但 GitHub 上 `parent`/`source` 都指向 jiaxiaogang/HE、jiaxiaogang/HELIX_THEORY（原作者 jiaxiaogang / 贾晓刚 的"螺旋抗熵"AGI 平行理论），且未见到可核验的二次改造。按 CLAUDE.md §"挂回原作者"，应挂回 [jiaxiaogang/HE](https://github.com/jiaxiaogang/HE) / [jiaxiaogang/HELIX_THEORY](https://github.com/jiaxiaogang/HELIX_THEORY)；且因这俩与 NARS 没有直接字样关联（仅 AGI 平行思路），本就**不在 nars_derivatives 收录范围**内

### opennars 组织周边

- [opennars/OpenNARS-for-Research](https://github.com/opennars/OpenNARS-for-Research) — OpenNARS 3.1.1 延伸版；本应入 nars_impl 但项目页未建
- [opennars/opennars_v3.1.2](https://github.com/opennars/opennars_v3.1.2) — OpenNARS 3.1.2；同上
- [opennars/opennars-applications](https://github.com/opennars/opennars-applications) — OpenNARS Applications（Java, MIT）；**A3. 应用层**
- [opennars/opennars-demavenized](https://github.com/opennars/opennars-demavenized) — 无 Maven 简化版；**A2. 理论实现变体**

### 学术与 Agent 方向

- [narsgpt/NARS-GPT-Agentic-test](https://github.com/petit-object-a/NARS-GPT-Agentic-test) — NARS-GPT Agentic 测试 fork
- [SolevarLive/NARS-EdAgent](https://github.com/SolevarLive/NARS-EdAgent) — NARS 教育 Agent
- [donyedwakefield/nars_multi_agent_env](https://github.com/donyedwakefield/nars_multi_agent_env) — NARS 多智能体环境

> [!info] 收录口径
> 本页只收录与 NARS（理论、内核、NAL、Narsese）有直接关系、但**不直接实现完整 NARS 推理引擎**的项目。任何能独立提供 Narsese 输入 → 推理服务的项目（即便名字里有"GPT"、"Agent"字样），按原则归 [[index\|NARS各版实现]]。fork 透明 + 有二次改造的可入"已收录"；只 fork 上游、不做二次工作的暂入"候选与待收录"。
