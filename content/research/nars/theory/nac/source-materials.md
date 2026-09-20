---
title: 非公理控制原始资料索引
comments: true
---

# 非公理控制原始资料索引

本页用于收集和分层整理 **Non-Axiomatic Control（NAC，非公理控制）** 的原始资料。这里先保存“资料在哪里、它直接说明了什么、下一步怎样核验”，不把尚未完成源码考据的解释写成定论。

> [!warning] 资料边界
> NAC 与 NAL 不是同一个层次：NAL 主要描述表示、语义与推理规则；NAC 关注任务、概念、记忆、预算、选择、反馈、循环和环境交互等运行控制。不同实现可能采用不同控制结构，不能把某一实现的机制直接冒充为 NARS 的唯一理论定义。

## 一、理论与基础原始资料

### 1. NARS 与非公理逻辑

- [Non-Axiomatic Logic: A Model of Intelligent Reasoning](https://www.worldscientific.com/worldscibooks/10.1142/8665) —— 王培的技术专著入口；用于核对 NAL、AIKR 与 NARS 的理论边界。
- [AIKR: Insufficient Knowledge and Resources](https://cis.temple.edu/~pwang/Publication/AIKR.pdf) —— AIKR 原始论文入口；当前知识库已有 [[research/nars/theory/nac/nac_principles/aikr|AIKR 页面]]。
- [A General Theory of Intelligence](https://cis.temple.edu/~pwang/GTI-book/) —— 王培的 GTI 原始 eBook；当前知识库已有 [[research/nars/theory/gti/index|本地镜像]]，其第 3、4、5 章是理解推理系统、自组织、传感运动和自我控制的重要背景材料。
- [Temple AGI Team](https://cis.temple.edu/tagit/#projects) —— 官方团队项目与演示入口；用于核对 NARS 实现、论文和 Demo 的归属。

### 2. NARS 运行结构与控制机制的直接描述

- [OpenNARS README](https://github.com/opennars/opennars#theory-overview) —— 明确列出 memory、inference engine、control mechanism 和 working cycle 五步概述；这是 NAC 代码分析的结构化入口。
- [OpenNARS declarative core README](https://github.com/patham9/opennars_declarative_core) —— 明确说明其目标是为不同方式实现 NAL 7/8 提供基础，并保留 Java core、GUI、测试与非回归测试入口。
- [ONA README](https://github.com/opennars/OpenNARS-for-Applications) —— 明确说明 ONA 的控制模型来源、应用取向、编译方式、Narsese shell、评测和示例；适合单独建立“应用型控制机制”分支。
- [ONA: Architecture and Control](https://www.researchgate.net/publication/342713626_%27OpenNARS_for_Applications%27_Architecture_and_Control) —— ONA 架构与控制论文入口；后续需要回到论文原文核对术语。

### 3. Temple AGI Team 公开论文目录

- [TAGIT Publications 公开目录](https://cis.temple.edu/tagit/publications/)
- [An Attentional Control Mechanism for Reasoning and Learning](https://cis.temple.edu/tagit/publications/An%20Attentional%20Control%20Mechanism%20for%20Reasoning%20and%20Learning.pdf)
- [Goal Generation and Management in NARS](https://cis.temple.edu/tagit/publications/Goal_Generation_and_Management_in_NARS.pdf)
- [Memory System and Memory Types for Real-Time Reasoning Systems](https://cis.temple.edu/tagit/publications/Memory_System_and_Memory_Types_for_Real_Time_Reasoning_Systems.pdf)
- [ONA](https://cis.temple.edu/tagit/publications/ONA.pdf)
- [Comparative Reasoning for Intelligent Agents](https://cis.temple.edu/tagit/publications/Comparative_Reasoning_for_Intelligent_Agents.pdf)
- [A Model of Unified Perception and Cognition](https://cis.temple.edu/tagit/publications/A_Model_of_Unified_Perception_and_Cognition.pdf)

## 二、实现源码入口

| 实现 | NAC 重点入口 | 资料状态 |
|---|---|---|
| OpenNARS 1.5.x | [declarative core](https://github.com/patham9/opennars_declarative_core) 的 `nars_core`、测试与 `nars-dist/Examples` | 已定位入口，尚未转录控制流程 |
| OpenNARS 3.x | [opennars/opennars](https://github.com/opennars/opennars) 的 core、lab、applications 与 `src/main/resources/nal` | README 已有 working cycle 摘要，源码对照待做 |
| ONA | [OpenNARS-for-Applications](https://github.com/opennars/OpenNARS-for-Applications) 的 C 源码、`evaluation.py`、examples、README | 已有运行入口，控制模块待分层整理 |
| PyNARS / OpenNARS 4 | [OpenNARS-4](https://github.com/opennars/OpenNARS-4) | PyNARS 原仓库已 deprecated，后续以 OpenNARS 4 为主线核验 |
| 20NAR1 | [20NAR1](https://github.com/PtrMan/20NAR1) 的 `NarInputFacade.rs` 与 README 的 temporal/goals/decision making 部分 | README 已明确 NAL 1–8 与特殊 NAL 9 支持，源码待核验 |
| NARust-158 | [NARust-158](https://github.com/ARCJ137442/NARust-158) 的 `src/control`、`src/storage`、`src/inference`、`src/vm` | 已定位代码模块和 NAL-1–6 测试材料 |
| OpenJunars | [OpenJunars](https://github.com/AIxer/OpenJunars) | README 明确 NAL 1–6；源码控制结构待整理 |
| NARS-Swift | [NARS-Swift](https://github.com/maxeeem/NARS-Swift) 的 `Sources/NAL`、`Sources/NARS`、`Sources/Narsese` | README 明确 logic/control 分层，control 标为 TBD |

## 三、可关联的会议与组会具体报告

以下链接尽量直接定位到视频分 P 的具体报告，而不是只链接整场合集。

### 年会报告

| 年会 | 具体报告 | 视频 |
|---|---|---|
| 2026 | 基于 NARS 资源管理的智能代理知识共享平台 | [B站分 P2](https://www.bilibili.com/video/BV1kuGc6uExY?p=2) |
| 2026 | ARC-AGI3 比赛视角下的 NARS 状态空间搜索问题 | [B站分 P5](https://www.bilibili.com/video/BV1kuGc6uExY?p=5) |
| 2026 | 基于非公理逻辑的“学习—推理协同”应急决策模型 | [B站分 P6](https://www.bilibili.com/video/BV1kuGc6uExY?p=6) |
| 2025 | 基于非公理逻辑的可解释的实体对齐与知识图谱补全研究 | [B站分 P3](https://www.bilibili.com/video/BV1hgNsznEkM?p=3) |
| 2025 | 融合深度学习和非公理化逻辑的城市火灾应急管理 | [B站分 P3](https://www.bilibili.com/video/BV1uiNUzDEYc?p=3) |
| 2025 | 基于非公理推理系统的自主认知修正控制机制的研究 | [B站分 P5](https://www.bilibili.com/video/BV1uiNUzDEYc?p=5) |
| 2024 | 自底向上：AGI 的具身认知发展之路 | [B站分 P2](https://www.bilibili.com/video/BV1dx4y1x7Vn?p=2) |
| 2024 | “看”的感觉：AGI 主动视觉研究进展 | [B站分 P3](https://www.bilibili.com/video/BV1dx4y1x7Vn?p=3) |
| 2023 | 让机器婴儿“看见”——AGI 主动视觉发展初探 | [B站分 P1](https://www.bilibili.com/video/BV1rp4y157qy?p=1) |
| 2022 | 机器婴儿主动视觉的初步发展 | [B站分 P2](https://www.bilibili.com/video/BV16G411n7F4?p=2) |
| 2022 | 通用人工智能视角下的新常识观 | [B站分 P5](https://www.bilibili.com/video/BV16G411n7F4?p=5) |
| 2022 | 何为情绪？基于生成认知的情绪衍生论 | [B站分 P6](https://www.bilibili.com/video/BV16G411n7F4?p=6) |
| 2021 | “两种世界”假设与通用解悖框架 | [B站](https://www.bilibili.com/video/BV15m4y1Q7yD?p=1) |
| 2021 | 机器教育系列：NARS 与自然语言处理相关报告 | [B站分 P6](https://www.bilibili.com/video/BV1ND4y1w7M5?p=6) |
| 2020 | 何为“常识”？ | [B站分 P9](https://www.bilibili.com/video/BV1y64y1f7Nf?p=9) |
| 2020 | 人类婴儿启发下的机器教育 | [B站分 P12](https://www.bilibili.com/video/BV1y64y1f7Nf?p=12) |

### 组会中的源码与理论报告

| 学年 | 具体报告入口 | 视频 |
|---|---|---|
| 2023–2024 | NAL-7 | [B站分 P3](https://www.bilibili.com/video/BV1o94y1r7hB?p=3) |
| 2023–2024 | NARS 8–9 | [B站分 P4](https://www.bilibili.com/video/BV1o94y1r7hB?p=4) |
| 2023–2024 | NARS 接口与非公理虚拟机 | [B站分 P8](https://www.bilibili.com/video/BV1o94y1r7hB?p=8) |
| 2023–2024 | NARS 代码阅读 | [B站分 P9](https://www.bilibili.com/video/BV1o94y1r7hB?p=9) |
| 2023–2024 | NARS 代码阅读 | [B站分 P10](https://www.bilibili.com/video/BV1o94y1r7hB?p=10) |
| 2023–2024 | OpenNARS walkthrough | [B站分 P11](https://www.bilibili.com/video/BV1o94y1r7hB?p=11) |
| 2020–2021 | NARS in Game AI | [B站分 P5](https://www.bilibili.com/video/BV1wf4y1k7Yh?p=5) |
| 2020–2021 | NARS 代码阅读 / 实现讨论 | [B站分 P6](https://www.bilibili.com/video/BV1wf4y1k7Yh?p=6) |
| 2020–2021 | OpenNARS 问答 | [B站分 P19](https://www.bilibili.com/video/BV1wf4y1k7Yh?p=19) |
| 2019–2020 | 论意识 | [B站分 P3](https://www.bilibili.com/video/BV1hV411t7CG?p=3) |
| 2019–2020 | Artificial consciousness | [B站分 P8](https://www.bilibili.com/video/BV1hV411t7CG?p=8) |

年会与组会的页面索引见 [[conference/annual/index|历届年会]] 与 [[conference/group/index|历届组会]]；具体报告链接用于后续把公开内容、实现源码和论文逐条关联。

## 四、后续整理顺序

1. 先按实现建立统一代码观察表：任务入口、工作循环、记忆结构、概念选择、任务选择、推理调用、反馈/预算、输出与环境接口。
2. 再比较 OpenNARS 1.5.x、OpenNARS 3.x、ONA、PyNARS/OpenNARS 4 与 NARust-158，不先假设它们拥有相同的控制机制。
3. NAL 7–9 的正文整理暂不在本页直接展开；先保存原始代码、论文、测试和视频定位信息。
4. 每项结论记录“来源 URL、源码路径、核验日期、是否为实现特例”，避免把实现事实升级为理论定论。
