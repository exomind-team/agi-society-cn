---
title: 动手试玩 NARS
order: 2
comments: true
---

# 动手试玩 NARS

这一页用两个小实验认识 NARS：先输入判断并提问，再到小世界里观察感知、操作与反馈。入口都在浏览器中，可以先试，再带着观察到的问题读理论。

## 第一站：在终端问一个问题

打开 [OpenNARS 304 TS 终端](https://arcj137442.github.io/opennars-304-ts-lab/terminal.html)，按顺序提交下面四行：

```text
<bird --> animal>.
<robin --> bird>.
<robin --> animal>?
:cycles 100
```

前两行告诉系统“鸟是动物”“知更鸟是鸟”，第三行问“知更鸟是动物吗”，最后一行让它继续运行推理周期。接着在输出中找与问题匹配的判断，并看它附带的真值信息。终端也会显示刚才的输入，要把这类回显与推理答案分开。

没找到回答时，先查输入是否被接受、推理周期是否推进，再看输出有没有解析错误。把输入顺序和完整输出留下来，与 [[opennars304ts#从哪里开始|项目页的终端示例]] 对照，通常比只记一句“没有反应”更便于定位问题。

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

试完后，记下入口、种子、知识模式和运行时长，再把看到的输入、操作与反馈写在一起。短暂得分上升、一次避障或一次获胜，还不足以单独证明长期学习收益；性能与尚未证明的能力边界见 [[opennars304ts#这些实验能证明什么|项目页的实验说明]]。

## 想在本机运行 Java 版？

先取 [官方 v3.0.4 完整预编译包](https://github.com/opennars/opennars-lab/releases/tag/v3.0.4)，不用把 GitHub 的 Source code ZIP 当成可执行发行物。该历史包包含 Lab 与 Applications 两个 JAR；下载及包内容已于 2026-10-19 核验，尚未运行验收。

<details>
<summary>包里有什么？从示例回到源码</summary>

|想观察什么|包内模块与源码|本轮核验边界|
|---|---|---|
|词性与语法实验|Lab 的 [LanguageGUI](https://github.com/opennars/opennars-lab/blob/v3.0.4/src/main/java/org/opennars/lab/language/LanguageGUI.java)，附 language_knowledge.nal|源码、启动器连接及 JAR 类/资源存在；不是通用中文 NLP 产品|
|小世界代理行为|Lab 的 [SimNAR](https://github.com/opennars/opennars-lab/blob/v3.0.4/src/main/java/org/opennars/lab/microworld/SimNAR.java)|源码、启动器连接及 JAR 类存在；未验收学习曲线|
|概念与关系图|GUI 的 [NARGraphPanel、InheritanceGraph、ImplicationGraph](https://github.com/opennars/opennars-gui/tree/v3.0.4/src/main/java/org/opennars/gui/graph)|类已打入 Lab JAR；未证明与其他实验共享完整工作流|
|路口与关系映射|[Applications 启动器](https://github.com/opennars/opennars-applications/blob/v3.0.4/src/main/java/org/opennars/applications/Launcher.java)中的 Crossing、Identity mapping|源码调用与 JAR 存在；不同于 C 语言 ONA|

官方包的两个入口分别是 bin_lab/opennars-lab-3.0.4-SNAPSHOT.jar 与 bin_applications/opennars-applications-3.0.4-SNAPSHOT.jar；未发现一键启动脚本。README 的 Java 8+ 为上游历史要求，本轮没有验证各平台/JDK兼容性。

[核心源码](https://github.com/opennars/opennars/tree/v3.0.4)与 Java Applications 使用 MIT；Lab 与 GUI 使用 GPL v3，各组件许可应分别保留。[v3.1.0 发布说明](https://github.com/opennars/opennars/releases/tag/v3.1.0)明确实验架构与过程学习限制，因此不按更大的版本号默认推荐。

本次下载文件 SHA-256：de616fb31301d6d5f5550a41c35a034cb1f29ba6228880d073f202f19956ace7（本次计算，非上游签名）。此处提供上游发行物，没有声称已制作新的综合包或完成端到端运行验收。

</details>

转到 [[opennars|OpenNARS 项目页]] 继续查阅原始资料。

页面下方的 [[opennars#快速入门-迁移自官网|历史快速入门]] 保留了旧版 Windows 目录、截图和命令，适合对照历史资料；先核对版本、依赖与文件路径，再使用其中的步骤。这里不把旧教程当作已在当前环境验证过的安装方案。

接下来可以 [[learn/projects|选择一个项目深入]]，或到 [[learning_resources|学习资源链接]] 补上理论背景。
