---
comments: true
---

# NARS各版实现 介绍

在NARS的发展过程中，涌现了一大批研究者按照NARS的运作逻辑，用各种编程语言自己编写NARS核心。

由于版本多，加之理论难度和编程难度都对初学者入门造成了一定的阻碍，因此特地总结各个版本实现的简介和运行教程，让新手也能在自己计算设备上运行NARS，感受其实际效果。

索引页面请参照[[index|这里]]；跨项目的基础字段与核验日期见[[catalog|NARS 实现基础资料总表]]。

## 各版本总览

最经典的是王培教授使用Java语言编写实现的[[opennars#opennars-1x|OpenNARS 1.5.8]]。这一版实现了NAL1-6层，实现效果：稳定无变动。

[ARCJ137442](https://github.com/ARCJ137442)
根据此版本魔改了一版实现，名为[OpenNARS-158-dev](https://github.com/ARCJ137442/OpenNARS-158-dev)
，并且在内补充了详尽的中文注释，可便于学习。

OpenNARS 后续出现了 3.0.4、3.1.1 等历史版本；相关仓库和资料入口见 [[opennars|OpenNARS 项目页]] 与总表。

Python 方向曾有 [[pynars|PyNARS]]，但原仓库 README 已标记为 Deprecated，并指向 [OpenNARS 4](https://github.com/opennars/OpenNARS-4)。因此本页不再把 PyNARS 写成当前唯一主线；不同实现的维护状态和资料边界以总表的逐项核验为准。

> [!info] 后续扩充
> 更多历史版本和相关项目可参考[天普大学 AGI 团队项目页](https://cis.temple.edu/tagit/#projects)。新增条目先进入总表并完成来源核验，再补充独立介绍页。
