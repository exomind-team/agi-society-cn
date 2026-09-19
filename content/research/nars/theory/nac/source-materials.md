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

## 三、可关联的会议与组会原始视频

- [[conference/annual/2025|2025 年会]]：包含 ONA、OpenNARS、NARS 理论与实现相关报告，应按报告标题逐项建立“视频—源码—论文”关联。
- [[conference/annual/2026|2026 年会]]：包含 ACA、NARS 与机器心理/行为主题，当前第二天上午视频仍待发现。
- [[conference/group/2023-2024|2023–2024 组会]]：第 3、4、8–11 场直接涉及 NAL、NARS 接口、代码阅读和 OpenNARS。
- [[conference/group/2019-2020|2019–2020 组会]]：包含 NARS 工程结构、控制代码研读等历史资料。

## 四、后续整理顺序

1. 先按实现建立统一代码观察表：任务入口、工作循环、记忆结构、概念选择、任务选择、推理调用、反馈/预算、输出与环境接口。
2. 再比较 OpenNARS 1.5.x、OpenNARS 3.x、ONA、PyNARS/OpenNARS 4 与 NARust-158，不先假设它们拥有相同的控制机制。
3. NAL 7–9 的正文整理暂不在本页直接展开；先保存原始代码、论文、测试和视频定位信息。
4. 每项结论记录“来源 URL、源码路径、核验日期、是否为实现特例”，避免把实现事实升级为理论定论。
