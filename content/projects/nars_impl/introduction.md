---
comments: true
---

# NARS各版实现 介绍

在NARS的发展过程中，涌现了一大批研究者按照NARS的运作逻辑，用各种编程语言自己编写NARS核心。

由于版本多，加之理论难度和编程难度都对初学者入门造成了一定的阻碍，因此特地总结各个版本实现的简介和运行教程，让新手也能在自己计算设备上运行NARS，感受其实际效果。

索引页面请参照 [[index|NARS各版实现 索引]]；各项目的基础字段与核验日期直接维护在对应项目页。

## 各版本总览

最经典的是王培教授使用Java语言编写实现的[[opennars#opennars-1x|OpenNARS 1.5.8]]。这一版实现了NAL1-6层，实现效果：稳定无变动。

[ARCJ137442](https://github.com/ARCJ137442)
根据此版本魔改了一版实现，名为[OpenNARS-158-dev](https://github.com/ARCJ137442/OpenNARS-158-dev)
，并且在内补充了详尽的中文注释，可便于学习。

OpenNARS 后续出现了 3.0.4、3.1.1 等历史版本；相关仓库和资料入口见 [[opennars|OpenNARS 项目页]] 与总表。

Python 方向的 [[opennars4|OpenNARS 4 (PyNARS)]] 延续了 PyNARS 的历史线索；原仓库 README 已标记为 Deprecated，并指向 OpenNARS 4。不同实现的维护状态和资料边界以各项目页的逐项核验为准。

> [!info] NARS 实现的准入门槛
> 本索引 (`nars_impl`) 只收录**真正实现 NARS 推理器**的项目，须同时满足：
> 1. **原创 NARS 推理器代码**——自己实现 Narsese 解析、NAL 规则、控制机制等核心组件；可以是 fork 后做大量二次改造（如 OpenNARS 系列的 C / Clojure / TypeScript / Swift / Python / Julia / Rust 重写），但不能是只换名搬运的纯 fork
> 2. **对外提供基于 Narsese 的推理服务**——用户可向程序提交 Narsese 输入，得到 NARS 推理输出
>
> 只"受 NARS 启发"但用其他技术栈（LLM 提示工程、神经符号、强化学习等）的项目**不算** NARS 实现，归 [[../index|NARS衍生项目]]；仅调用 NARS 作为子模块的项目（如 Agent 框架、可视化、教学），也归衍生项目。
>
> 更多历史版本和相关项目可参考[天普大学 AGI 团队项目页](https://cis.temple.edu/tagit/#projects)。新增条目先进入总表并完成来源核验，再补充独立介绍页。
