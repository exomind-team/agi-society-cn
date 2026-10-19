---
comments: true
---

# NarsGPT（NARS-GPT）

<!-- BEGIN GENERATED NARS PROFILE -->

## 基础资料

> 本节由 data/nars-implementations.json 生成；项目特有教程和源码观察仍在本页维护。

| 字段 | 已核验信息 |
|---|---|
| 代际 / 定位 | A NARS implemented as a GPT model prompted to invoke reasoning steps（patham9 版；含 AAAI 2023 匿名提交版） |
| 编程语言 | Python |
| 作者 / 维护组织 | patham9；narsgpt 组织（AAAI 2023 匿名提交） |
| 代码仓库 | [仓库](https://github.com/patham9/NarsGPT) |
| 许可证 | MIT（patham9/NarsGPT）；narsgpt/NARS-GPT 匿名提交仓库元数据未声明 |
| Narsese / NAL 边界 | patham9 版 README 明示「以 GPT 模型提示方式调用推理步骤，把 NARS 记忆与控制机制用 Python 落地」；AAAI 提交版具体 NAL 边界待论文公开版为准 |
| 运行 / Demo | 运行方式本轮未统一核实 |
| 最近公开提交 | 2024-02-01 patham9/NarsGPT；2023-08-17 narsgpt/NARS-GPT（仅为仓库元数据观察值） |
| 维护状态 | patham9 版 2024-02 最后一次 push；AAAI 提交版 2023-08 最后一次 push；当前无活跃进展 |
| 最后核验 | 2026-09-20 |

<!-- END GENERATED NARS PROFILE -->

> **层级**：A2. 理论实现 — 独立实现 NARS 推理循环，借 GPT 提示工程包装为对话式 NARS 引擎

以 GPT 模型提示方式一步步调用推理步骤，把 NARS 的记忆与控制机制用代码落地的一类项目。同名仓库有两份主流实现，互相独立，无 fork 关系。

## patham9/NarsGPT

- 仓库：<https://github.com/patham9/NarsGPT>
- 维护者：patham9
- 许可证：MIT
- 编程语言：Python
- 仓库平台创建日：2023-04-16；最后一次 push：2024-02-01
- 仓库方说明：「A NARS implemented as a GPT model prompted to invoke reasoning steps, with NARS-based memory and control machinery implemented in Python.」

## narsgpt/NARS-GPT（AAAI 2023 匿名提交版）

- 仓库：<https://github.com/narsgpt/NARS-GPT>
- 仓库方说明：「NARS-GPT repository for anonymous AAAI submission」
- 仓库平台创建日：2023-08-16；最后一次 push：2023-08-17

这是 AAAI 2023 匿名评议提交所用的同名仓库，专门以独立组织账号 `narsgpt` 公开源码、暂时不公开作者信息。论文细节请以正式发表版（AAAI Proceedings）为准。

## 收录与归属

本页属于 [[index|NARS衍生项目]]。两份实现都把 NARS 视作"记忆 + 控制 + 推理循环"的整体，借大模型的提示工程重新搭建，并不直接重写 NARS 引擎内核。

## 来源溯源

- 两份仓库均 `fork:false`、`parent:null`、`source:null`，明确独立
- 仓库方说明均自报项目语境
