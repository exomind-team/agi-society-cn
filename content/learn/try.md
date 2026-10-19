---
title: 动手试玩 NARS
order: 2
comments: true
---

# 动手试玩 NARS

先输入两条判断，再看一次推理；然后进入小世界，追踪感知如何变成操作。不需要先安装开发环境，也不需要先读完理论。

## 第一站：在终端问一个问题

打开 [OpenNARS 304 TS 终端](https://arcj137442.github.io/opennars-304-ts-lab/terminal.html)，按顺序提交下面四行：

```text
<bird --> animal>.
<robin --> bird>.
<robin --> animal>?
:cycles 100
```

前两行分别表达“鸟是动物”“知更鸟是鸟”，第三行询问“知更鸟是动物吗”，最后一行推进推理周期。留意输出中是否出现与问题匹配的判断，以及它附带的真值信息；不要把输入回显当成推理答案。

如果没有找到回答，先查看输入是否被接受、推理周期是否推进，以及输出里有没有解析错误。保留完整输入顺序和输出，便于与 [[opennars304ts#从哪里开始|项目页的终端示例]] 对照。

这一步用来认识输入、问题与推理输出。一次回答不代表系统已掌握任意自然语言，也不代表其他实现接受完全相同的终端命令。

## 第二站：跟着六路感知看一次行动

打开 [经典虫脑 Microworld](https://arcj137442.github.io/opennars-304-ts-lab/microworld.html)，同时展开“经验观察”和“性能诊断”。按这条顺序看：

1. 在 SENSORY FIELD 找到 G1–G3、B1–B3，观察好、坏食物的六路感知强度。
2. 在 NARS EXECUTION 读出最近一次操作，区分 NARS 操作与 babble 探索；left、right 是相对虫子身体的转向。
3. 在 OUTCOME / REWARD 观察操作后的反馈，并对照经验观察中的信念变化。
4. 在性能诊断中分别看世界步进 TPS 与推理周期 RPS。画面在动，不等于每一步都完成了新的推理。

需要认清每个窗口时，打开 [[opennars304ts#经典虫脑-六个小窗口看见一个大问题|六路感知与观察面板教程]]。项目页还解释了同步、异步模式，以及经验观察与原始派生任务的区别。

普通入口使用随机起点与空白探索。如果想对照示例先验，可以另开 [固定种子与 starter 知识入口](https://arcj137442.github.io/opennars-304-ts-lab/microworld.html?seed=19&knowledge=starter)。记录自己使用的模式：starter 显式注入示例知识，不能据此声称系统从零学会了规则。

## 第三站：只改变一个条件

- 想改变空间：打开 [Grid Microworld](https://arcj137442.github.io/opennars-304-ts-lab/gridworld.html)，选择一种网格，拖动虫体或食物，再对照同一组感知和操作面板。操作说明见 [[opennars304ts#格中虫脑-世界变了-观测方式不变|格中虫脑教程]]。
- 想观察跨局记忆：打开 [NARS × 2048](https://arcj137442.github.io/opennars-304-ts-lab/nars2048.html)。项目页说明棋盘结束后自动重开、NARS 记忆默认保留；先记录多局结果，再讨论表现是否有变化。
- 想换一个任务：从 [Demo Lab](https://arcj137442.github.io/opennars-304-ts-lab/) 选择 Pong 或其他环境，继续追踪“感知—推理—操作—反馈”。

记录入口、种子、知识模式、运行时长，以及观察到的输入、操作和反馈。短暂得分上升、一次避障或一次获胜，都不足以单独证明长期学习收益；性能与尚未证明的能力边界见 [[opennars304ts#这些实验能证明什么|项目页的实验说明]]。

## 想在本机运行 Java 版？

转到 [[opennars|OpenNARS 项目页]]，从其仓库入口查看准备使用的版本。该页记录的环境信息为 Java 8+、Maven，README 提供 Lab、Applications、示例 Narsese 与 GUI 入口。

页面下方的 [[opennars#快速入门-迁移自官网|历史快速入门]] 保留了旧版 Windows 目录、截图和命令，适合对照历史资料；先核对版本、依赖与文件路径，再使用其中的步骤。这里不把旧教程当作已在当前环境验证过的安装方案。

接下来可以 [[learn/projects|选择一个项目深入]]，或到 [[learning_resources|学习资源链接]] 补上理论背景。
