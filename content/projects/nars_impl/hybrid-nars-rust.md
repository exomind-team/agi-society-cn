---
comments: true
---

# Hybrid NARS Rust

> **层级**：A2. 理论实现 — 独立 Rust 实现 NAL/Narsese 推理

- 全名：**Hybrid NARS Rust**
- 编程语言：Rust
- 仓库：<https://github.com/maxeeem/hybrid_nars_rust>
- 维护者：maxeeem
- 仓库平台创建日：2026-01-01；最后一次 push：2026-01-01

## 项目简介

仓库 README：「A Rust implementation of a Hybrid Non-Axiomatic Reasoning System (NARS).」

在 NARS 经典推理（演绎、归纳、溯因、修正）之上，叠加连续向量表征：使用 GloVe embeddings 把概念"接地"到连续空间；支持等价算子 `<|>`、`</>`、`<\>` 与区间处理；带概念漂移检测、基于置信度的答案过滤；提供命令行 REPL 供人机交互。

## 收录与归属

本页属于 [[index|NARS各版实现]]。它用 Rust 直接实现 NARS 推理引擎，并叠加 Hybrid 嵌入，是当代轻量级的独立实验实现。

## 来源溯源

- GitHub fork 链：`fork:false`、`parent:null`、`source:null` —— 非 fork，独立项目
- 仓库元数据：license 字段未声明；stars：0
