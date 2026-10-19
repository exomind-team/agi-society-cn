---
title: 选择项目与工具
order: 3
comments: true
---

# 选择项目与工具

先确定你要做什么，再选择代码。能直接接受 Narsese 的推理器、把推理器接入环境的工具，以及受 NARS 启发的实验，承担的是不同工作。

## 我想先看一次推理和行动

从 [[learn/try|动手试玩 NARS]] 开始。[[opennars304ts|OpenNARS 304 TS]] 提供浏览器终端和 Demo Lab，适合把输入、推理周期、感知、操作放在一起观察。

准备继续读代码时，注意 Core 与 Demo 是不同仓库：前者实现推理核心，后者连接实验环境。项目页统一提供仓库、来源说明与维护信息。

## 我想研究或修改推理内核

先读 [[projects/nars_impl/introduction|实现介绍]]，再用 [[projects/nars_impl/index|实现总览]] 比较语言、代际、Narsese / NAL 边界和运行入口。

- [[opennars|OpenNARS]]：Java 历史版本与相关源码入口，维护归属为 OpenNARS 项目团队。读旧教程时对照对应版本。
- [[opennars304ts|OpenNARS 304 TS]]：ARCJ137442 维护的 TypeScript 实现；从项目页追踪 OpenNARS 3.0.4 来源与宿主接口边界。
- [[projects/nars_impl/ona|ONA]]、[[opennars4|OpenNARS 4]]、[[narust|NARust]]：从各自项目页查看实现方式和适用范围，不把语言差异当成能力排名。

选定后，先跑该仓库自己的最小示例，再研究解析、推理规则和控制机制。版本号、最近提交与许可证以项目页和所链接的原仓库为准。

## 我想把 NARS 接进自己的环境

从 [[projects/nars_derivatives/index|衍生项目索引]] 的 A1「运行时集成」和 A3「框架 / 可视化 / 应用」开始。使用这类项目时，分别确认它调用哪个推理器、如何传递输入，以及操作怎样回到环境。

| 想做的事 | 入口与维护归属 | 与推理器的关系 |
|---|---|---|
| 统一不同实现的输入输出 | [[babelnar\|BabelNAR / NAVM]] · ARCJ137442 | 接口模型、桥接与运行时；不等于新的完整推理内核 |
| 接入自然语言、知识库或传感器 | [[channels\|OpenNARS Channels]] · opennars | 连接 OpenNARS NAR shell 的通道 |
| 搭建受 NARS 控制的智能体 | [[narca\|NARCA]] · ntoxeg | 基于 NARS 的智能体框架 |
| 研究游戏感知与操作循环 | [[nars-fighterplane\|NARS-FighterPlane]] · Noctis-Xu；[[nars-pong\|NARS-Pong]] · ccrock4t | 游戏环境与控制集成；按项目页查看所调用引擎和依赖 |
| 查看 Web 界面工具 | [[nars-web-gui\|NARS-Web-GUI]] · ccrock4t | GUI 项目；先读仓库说明确认连接方式 |

这里保留索引原有分类。框架、示例与内核之间的连接关系，要按具体仓库判断；同一个维护者名下的项目也不一定属于同一内核。

### 找 Java 相关仓库时，先辨认用途

衍生索引中还收录了 opennars 组织的几个 Java 仓库。它们用途不同，不能统称为应用：

- [OpenNARS-for-Research](https://github.com/opennars/OpenNARS-for-Research)：OpenNARS 3.1.1 研究延伸版。
- [opennars_v3.1.2](https://github.com/opennars/opennars_v3.1.2)：3.1.2 release 版本仓库。
- [opennars-demavenized](https://github.com/opennars/opennars-demavenized)：无 Maven、移除部分控制功能的精简版。
- [opennars-applications](https://github.com/opennars/opennars-applications)：OpenNARS v3.0.0+ 应用层。

先在 [[opennars|OpenNARS 项目页]] 确认所需代际，再阅读目标仓库说明。需要复现实验时，记录具体仓库与版本，避免混用研究版、发行版和应用层的运行方法。

## 我想探索 NARS 与其他方法的结合

看衍生索引的 B1「控制 / AGI 应用」和 B2「学术 / 论文附属 / 实验笔记」：

- [[nnesycef|NNeSyCeF]] · PtrMan：借鉴 NAL 真值与 AIKR 的神经符号框架。
- [[nars-gpt|NarsGPT]] · patham9 / narsgpt 相关仓库：用 GPT 模型模拟推理步骤；项目页区分仓库及调用 ONA 的分支。
- [[pixel-to-concept-reader|Pixel-to-Concept Reader]] · poerlang：结构化 NAL 词条与手写数字识别的论文附属实现。

这些入口用来研究结合方式，不作为完整 NARS 推理内核的替代清单。选定一个项目后，先读清楚它实际实现、调用或借鉴了什么，再决定要复现哪一个实验。
