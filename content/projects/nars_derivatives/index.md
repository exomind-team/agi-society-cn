---
comments: true
---

# NARS衍生项目 索引

本页汇总与 NARS 相关的衍生项目：基于 NARS 内核或 NAL 模型，但**不直接实现完整 NARS 推理引擎**的项目（典型如应用、工具、论文附属实现、跨学科扩展）。

若为 NARS 各版实现的直接精简/重写（如 OpenNARS 系列的变种），请见 [[index\|NARS各版实现]]。

## 已收录

| 项目 | 语言 | 维护者 | 简介 | 仓库 |
|---|---|---|---|---|
| [[nace\|NACE]]（Non-Axiomatic Causal Explorer） | Python / Julia | patham9（Python 原版）；ntoxeg（Julia 复刻） | 基于 NARS 的因果探索工具 | [Python 版](https://github.com/patham9/NACE) ｜ [Julia 复刻](https://github.com/ntoxeg/NACE.jl) |
| [[pixel-to-concept-reader\|Pixel-to-Concept Reader]] | TypeScript | poerlang | 阅读友好的"结构化 NAL 词条 + 手写数字识别"论文附属实现 | [仓库](https://github.com/poerlang/pixel-to-concept-reader) |
| [[nars-gpt\|NarsGPT]] | Python | patham9 | A NARS implemented as a GPT model — NARS-based memory + control machinery，借 GPT 提示调用推理 | [仓库](https://github.com/patham9/NarsGPT) |
| [[narca\|NARCA]]（NARS Controlled Agent） | Python | ntoxeg | 基于 NARS 构建的可控智能体框架 | [仓库](https://github.com/ntoxeg/narca) |
| [[babelnar\|BabelNAR 项目集 / NAVM 模型]] | Rust / Julia | ARCJ137442 | 围绕 NAVM（非公理虚拟机）+ CIN（统一 IO 接口）的项目群；含 BabelNAR.rs/Jl、CLI、Implements、test-suite、NAVM.rs/Jl、JuNarsese、JuNEI、PyNEI、Narsese.rs 等十余个子项目 | [NAVM.rs](https://github.com/ARCJ137442/NAVM.rs) ｜ [BabelNAR.rs](https://github.com/ARCJ137442/BabelNAR.rs) |

## 候选与待收录

最近一次盘点 ARCJ137442、patham9、ntoxeg、poerlang 等 NARS 作者的公开仓库，识别到一批与 NARS / AGI 主题相关但本轮未单独建项目页的候选：

### ARCJ137442 名下（fork / 实验类）

- [BabelNAR-CLI.rs](https://github.com/ARCJ137442/BabelNAR-CLI.rs) / [BabelNAR_Implements](https://github.com/ARCJ137442/BabelNAR_Implements) / [BabelNAR-NAL-test-suite](https://github.com/ARCJ137442/BabelNAR-NAL-test-suite) — 已收入 [[babelnar\|BabelNAR 项目集]]主页，本节不再单列
- [NAVM.jl](https://github.com/ARCJ137442/NAVM.jl) / [NAVM_Implements](https://github.com/ARCJ137442/NAVM_Implements) — 已收入 [[babelnar\|BabelNAR 项目集]]主页
- [JuNarsese.jl](https://github.com/ARCJ137442/JuNarsese.jl) / [JuNarseseParsers](https://github.com/ARCJ137442/JuNarseseParsers) / [JuNEI.jl](https://github.com/ARCJ137442/JuNEI.jl) / [PyNEI](https://github.com/ARCJ137442/PyNEI) — Narsese 数据结构与 NARS 具身接口；与 BabelNAR 项目集一致，本节不再单列
- [NAR-dev-utils](https://github.com/ARCJ137442/NAR-dev-utils) — NARS 项目通用工具包，亦归 BabelNAR 项目集
- [Narsese.rs](https://github.com/ARCJ137442/Narsese.rs) — 同上
- [NARS-Car-Test](https://github.com/ARCJ137442/NARS-Car-Test) — 小车碰撞实验 demo
- [NARS-FighterPlane](https://github.com/ARCJ137442/NARS-FighterPlane) — NARS 控制战机游戏（GitHub fork 元数据缺失 parent 字段，可能因 fork 来源仓库被删除；本轮未纳入"已收录"）

### poerlang 名下

- [he4o](https://github.com/poerlang/he4o) / [HELIX_THEORY](https://github.com/poerlang/HELIX_THEORY) — "螺旋论 / 熵减机"理论及配套 AGI 系统；与 NARS 间接相关，等项目方明确学术联系后再决定
- [mininars](https://github.com/poerlang/mininars) — 项目方声明"又一个 NARS 精简版"；属于 OpenNARS 系列的 fork 链（`fork:true`，parent `patham9/opennars_declarative_core`，source `opennars/opennars_googlecode`），按查重纪律在 fork 链透明度确认前不入"已收录"
- [PyNARS](https://github.com/poerlang/PyNARS)（poerlang fork）— "pynars version editted by Tory Li"；同上，待主线 PyNARS 项目方确认

### NARS-GPT / Agent 方向

- [narsgpt/NARS-GPT](https://github.com/narsgpt/NARS-GPT) — 2023 AAAI 匿名提交；学术性质独立仓库，本轮未纳入"已收录"
- [petit-object-a/NARS-GPT-Agentic-test](https://github.com/petit-object-a/NARS-GPT-Agentic-test) — NARS-GPT Agentic 测试 fork，本轮未纳入

### 其他候选

- [SolevarLive/NARS-EdAgent](https://github.com/SolevarLive/NARS-EdAgent) — NARS 教育 Agent
- [donyedwakefield/nars_multi_agent_env](https://github.com/donyedwakefield/nars_multi_agent_env) — NARS 多智能体环境

> [!info] 收录口径
> 仅收录与 NARS（理论、内核、NAL、Narsese）有直接关系的衍生项目，并按 §"收录 NARS 实现的查重纪律"做来源溯源：fork 链透明 + 有明确二次改造（如建模、统一接口、Agent 包装、可视化、跨语言迁移）的可入"已收录"；仅 fork 上游不做二次工作的，本轮暂入"候选与待收录"。
