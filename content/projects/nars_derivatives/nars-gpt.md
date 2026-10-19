---
comments: true
---

# NarsGPT（NARS-GPT）

> **层级**：B2. 学术衍生 — 用 GPT 模型模拟 NAL 推理路径；按 CLAUDE.md §"NARS 实现的准入范围"应判定为**不属于 NARS 实现**

以 GPT 模型提示方式一步步调用推理步骤，把 NARS 的记忆与控制机制用代码落地的一类项目。同名仓库有两份主流实现，互相独立，无 fork 关系。

## patham9/NarsGPT

- 仓库：<https://github.com/patham9/NarsGPT>
- 维护者：patham9
- 许可证：MIT
- 编程语言：Python
- 仓库平台创建日：2023-04-16；最后一次 push：2024-02-01
- 仓库方说明：「A NARS implemented as a GPT model prompted to invoke reasoning steps, with NARS-based memory and control machinery implemented in Python.」
- 已迁移公告：仓库 README 自述「REPOSITORY HAS MOVED TO https://github.com/opennars/NARS-GPT」

## narsgpt/NARS-GPT（AAAI 2023 匿名提交版）

- 仓库：<https://github.com/narsgpt/NARS-GPT>
- 仓库方说明：「NARS-GPT repository for anonymous AAAI submission」
- 仓库平台创建日：2023-08-16；最后一次 push：2023-08-17

这是 AAAI 2023 匿名评议提交所用的同名仓库，专门以独立组织账号 `narsgpt` 公开源码、暂时不公开作者信息。论文细节请以正式发表版（AAAI Proceedings）为准。

## 不属于 NARS 实现的原因（核实记录）

按 CLAUDE.md §"NARS 实现的准入范围"，NARS 实现须同时满足两条：(1) 原创 NARS 推理器代码；(2) 对外提供基于 Narsese 的推理服务。NarsGPT 不满足其中任一条：

- 仓库 README 自承「Sentences are not stored in logical/structural form as in other NARS implementations, but in natural language sentences」、「Accurate truth calculations are carried out via an inference machinery invoked by GPT」——核心推理由 GPT 提示调用完成，**不是 Narsese/NAL 引擎**；自然语言句子替代了 Narsese 形式
- 仓库提供一个 `gptONA` 分支（https://github.com/patham9/NarsGPT/tree/gptONA），README 描述「There is also the option to use ONA for reliable reasoning」——分支路径**调用已有的 ONA**（而非自实现 NARS 引擎）
- 因此：NarsGPT 属于"用 GPT 模型模拟 NAL 思想"的衍生项目，**不属于 nars_impl**，归入本页

## 来源溯源

- 两份仓库均 `fork:false`、`parent:null`、`source:null`，明确独立
- 仓库方说明均自报项目语境
