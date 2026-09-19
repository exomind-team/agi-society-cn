---
comments: true
---

# 非公理控制

## 简介（拟）

「非公理控制」英文全名为 **Non-Axiomatic Control (NAC)**，即「非公理推理的控制机制」。

「非公理控制」是NARS理论中一套将「非公理逻辑」从抽象理论带到具体系统的知识体系，可谓从「非公理逻辑」到「非公理推理系统」的最后一块拼图。

「非公理控制」之所以成为NARS理论中有别于「非公理逻辑」的一部分，主要原因有：

1. 虽然更涉及底层实现，但也有整体的逻辑结构——推理规则是具体的，但控制机制决定了推理的方向和聚焦点
2. 不同版NARS实现有不同的控制机制方法，甚至是每一版NARS都有独特的控制机制实现——但也可以提炼出一些【足以写进教科书】的原则，比如「AIKR」「单步推理常数时间复杂度」等等
3. NAL中 越到上层（尤其是NAL 7～9），和控制机制的联系就越紧密——一些数据结构的设计和使用，已经超出了「从旧知识推理出新知识」的范畴，不能完全用Narsese、真值函数、逻辑公式描述

（✨持续更新中，欢迎贡献内容）

## 内容目录与原始资料

🕒最后更新：【2026-09-19】

- [[source-materials|非公理控制原始资料索引]] —— 先收集原始论文、官方 README、源码入口和视频，再逐项整理正文。

- [[nac_overview/index|NARS控制机制概览]]
- [[nac_principles/index|NARS控制机制的总体原则]]
    - [[nac_principles/aikr|知识资源相对不足]]
    - [[inference_step_o_n|常数时间的单步推理]]
    - …
- [[nal_and_nac/index|NAL高层与NARS控制机制]]
    - [[nal_7|NAL-7 时间推理：事件缓冲区系统]]
    - [[nal_8|NAL-8 目标推理：目标、事件与操作]]
    - [[nal_9|NAL-9 内省推理：全局指标与心理操作]]
- [[nac_classic_versions/index|NARS经典版本的控制机制]]
    - [[opennars_15x|OpenNARS 1.5.x]]
    - [[opennars_30x|OpenNARS 3.0.x/3.1.0]]
    - [[opennars_31x|OpenNARS 3.1.x]]
    - [[nac_classic_versions/ona|ONA]]
    - [[nac_classic_versions/pynars|PyNARS]]
    - …

（✨持续更新中；本页先固定资料边界，不把尚未核验的推断写成理论结论。）
