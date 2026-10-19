---
comments: true
---

# OpenNARS Core（3.1.x）

> **层级**：A2. 理论实现 — OpenNARS 3.1.x 主线版本

- 全名：**OpenNARS Core**（OpenNARS 3.1.x）
- 编程语言：Java
- 仓库：<https://github.com/opennars/opennars_core>
- 维护者：opennars 项目（README 自述上游 patham9/opennars_declarative_core）
- 仓库平台创建日：2021-05-25

## 项目简介

README：「OpenNARS v3.1.x based on OpenNARS v1.5.8, https://github.com/patham9/opennars_declarative_core. It can be considered a new attempt to implement the new architecture which was originally built on top of v3.0.4.」

源码布局：`nars_core_java/`（核心）、`nars_gui/`（Swing GUI），这两个子目录自 Pei Wang 在 `nars/` 目录下的旧代码演变而来。`nars-dist/` 是发行包（可执行、示例、applet 网页）。测试入口位于 `nars_core/src/test/java/nars/main_nogui/TestReasoning0.java`。

## 收录与归属

本页属于 [[index|NARS各版实现]]。它是 OpenNARS 3.x 系列里的一个里程碑版本，将 patham9 在 declarative_core 上的实验成果带入官方组织。

## 来源溯源

- GitHub fork 链：`fork:false`、`parent:null`、`source:null` —— 非 fork，独立项目
- README 自报上游：`patham9/opennars_declarative_core` 与 `opennars/opennars` v3.1.0 tag
- 与 `opennars/OpenNARS-for-Research`（v3.1.1）、`opennars/opennars_v3.1.2`（v3.1.2）README 高度相近，是否互为 fork 关系需逐仓库再核
