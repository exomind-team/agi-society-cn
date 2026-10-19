---
comments: true
---

# OpenNARS Channels

> **层级**：A1. 运行时集成 — 把 OpenNARS NAR shell 接进自然语言/知识库/传感器

- 全名：**Channels**（Sensory / Knowledge / Sensorimotor channels for OpenNARS）
- 编程语言：Python
- 仓库：<https://github.com/opennars/Channels>
- 维护者：opennars 项目
- 仓库平台创建日：2021-07-19

## 项目简介

README：「Channels — Sensory channels, knowledge channels and sensorimotor channels for OpenNARS.」

给出示例 `NLPAndKnowledgeChannel.py`：把自然语言输入、`<cat --> mammal>` 类陈述、问题等从 Python 直接送进 OpenNARS 的 NAR shell，演示从 Narsese 语句到 NARS 推理回环的端到端体验。

## 收录与归属

本页属于 [[index|NARS衍生项目]]。它是 OpenNARS 周边工程的"输入/输出"桥梁，让 OpenNARS 主线引擎能直接对接自然语言、知识库与传感器层。

## 来源溯源

- GitHub fork 链：`fork:false`、`parent:null`、`source:null` —— 非 fork，独立项目
- 仓库元数据：stars：0；归档状态：未归档
- 使用：`python3 NLPAndKnowledgeChannel.py | ./NAR shell`
