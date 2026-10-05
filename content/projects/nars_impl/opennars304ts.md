---
title: OpenNARS 304 TS
comments: true
---

# OpenNARS 304 TS

<img src="https://raw.githubusercontent.com/ARCJ137442/OpenNARS-304-ts/main/brand/opennars-ts-logo.svg" alt="OpenNARS TypeScript Logo" width="280">

> [!tip] 先玩起来
> 不用安装，直接打开 [OpenNARS 3.0.4 Demo Lab](https://arcj137442.github.io/opennars-304-ts-lab/)。先点进经典 Microworld，再打开右侧的经验观察和性能诊断。你会同时看到虫子的六路感知、NARS 的推理周期、世界步进和它真正发出的操作。

<!-- BEGIN GENERATED NARS PROFILE -->

## 基础资料

> 本节由 data/nars-implementations.json 生成；项目特有教程和源码观察仍在本页维护。

| 字段 | 已核验信息 |
|---|---|
| 代际 / 定位 | OpenNARS 3.0.4 的 TypeScript 实现 |
| 编程语言 | TypeScript |
| 作者 / 维护组织 | ARCJ137442 |
| 代码仓库 | [仓库](https://github.com/ARCJ137442/OpenNARS-304-ts) |
| 许可证 | MIT（Core；Demo 素材与改写按各自来源声明） |
| Narsese / NAL 边界 | 以 OpenNARS 3.0.4 可观察语义为基线；当前已通过 M1′、M2、strict markerless 与 Node/API 门，具体能力以源码和证据为准 |
| 运行 / Demo | [Demo Lab](https://arcj137442.github.io/opennars-304-ts-lab/)，[源码 Demo](https://github.com/ARCJ137442/OpenNARS-304-ts-web-demo) |
| 最近公开提交 | Core 2a84811；Demo 87d7f64；Pages ccfd0a2（2026-10-05）（仅为仓库元数据观察值） |
| 维护状态 | 公开研究 / 集成 fix release（v1.0.7） |
| 最后核验 | 2026-10-05 |

<!-- END GENERATED NARS PROFILE -->

## 这不是又一个“把 Java 改写一遍”的故事

很多 NARS 项目在 README 里看起来都差不多，都是输入一段 Narsese，然后让系统运行若干周期。真正开始用时，差别一下子就出来了：有的只能在命令行里看一串输出，有的只能看静态截图，还有的 Demo 让你看见了一个会动的世界，却看不见 NARS 为什么在这个时间点选择了这个操作。

OpenNARS 304 TS 把这几件事放在同一个可观察闭环里。核心是 OpenNARS 3.0.4 的 TypeScript 实现，外面接 Node.js CLI、ESM API 和浏览器 Worker；再往外，是一组可以直接玩的环境。你移动虫子、拖动食物、改变网格拓扑，或者让棋盘自动重开，NARS 的感知、目标、推理、操作和结果会沿着同一条时间线出现。

这里的“经验”也不是把日志换一个更好听的名字。经验观察的主视图读取概念袋中经过时间投影的信念，按期望排序，显示信念、期望、频率、信度和 NAR 时钟；原始派生任务只放在按需展开的证据层。这样，当 NARS 的内部状态稳定下来时，读者看到的不是一串恰好发生过的事件，而是相对稳定的知识候选。

## 从哪里开始

如果你只想感受一次完整闭环，进入 [经典虫脑 Microworld](https://arcj137442.github.io/opennars-304-ts-lab/microworld.html)。普通入口使用随机种子和空白探索，每次打开都会得到新的起点；想复现实验，再使用 microworld.html?seed=19&knowledge=starter。knowledge=starter 是显式的示例先验开关，不是“系统从零学会了一条规则”的证据。

如果你更喜欢可控的实验，先记住三条入口：

| 入口 | 你会看到什么 | 适合怎样玩 |
|---|---|---|
| [Microworld](https://arcj137442.github.io/opennars-304-ts-lab/microworld.html) | 六路感知、好坏食物、身体转向与奖励 | 观察连续世界中的感知—操作闭环 |
| [Grid Microworld](https://arcj137442.github.io/opennars-304-ts-lab/gridworld.html) | 正方形、正三角形、正六边形环面 | 对照离散拓扑，并拖动虫体和食物 |
| [NARS 终端](https://arcj137442.github.io/opennars-304-ts-lab/terminal.html) | Narsese 输入、周期推进、推理输出 | 先做一个最小的推理实验 |

终端里可以直接输入：

    <bird --> animal>.
    <robin --> bird>.
    <robin --> animal>?
    :cycles 100

若你想看记忆是否跨局保留，可以打开 [NARS × 2048](https://arcj137442.github.io/opennars-304-ts-lab/nars2048.html)。棋盘结束后会自动重开，NARS 记忆默认不清空；这让“下一局是不是更会玩了”变成可以反复观察的实验问题，而不是一次截图里的感觉。

## 经典虫脑，六个小窗口看见一个大问题

Microworld 的虫子只有六个离散感受点，前三个是好食物方向，后三个是坏食物方向。每个格子不是简单的亮或灭，而是有 0% 到 100% 的强度，右侧会标出 G1 到 G3、B1 到 B3 和当前百分比。

好食物带来正反馈，坏食物带来负反馈。虫子的 left 是相对身体的逆时针转向，right 是顺时针转向，forward 才是沿当前朝向前进。这个细节听起来很小，却决定了“左”到底是屏幕左边，还是智能体自己的左边；我们把它单独写进了模型合同和测试。

右侧的三个核心区域各自承担不同职责：

- NARS EXECUTION 保留最后一次真实 NARS 或 babble 操作，空闲步不会把它抹掉，给人足够时间读完；
- SENSORY FIELD 显示六路感知的具体强度，颜色、边框和强度条同时表达方向与程度；
- OUTCOME / REWARD 显示当前反馈、好食物数、坏食物数和好坏比。

性能诊断默认折叠，展开后才显示 FPS、TPS、RPS、实际/目标 TPS、NARS 延迟、概念袋、任务袋和 Worker 状态。这里严格区分三种速度：FPS 是画面刷新，TPS 是世界步进，RPS 是 NARS 实际完成的推理周期。同步模式下，世界会等 NARS；异步模式下，世界按自己的时钟走，NARS 慢了就是慢半拍。

## 格中虫脑，世界变了，观测方式不变

Grid Microworld 不是另做一套“差不多的右侧面板”。它和经典 Microworld 共用同一套观测面板 DOM、CSS、操作缓存、经验观察和时间投影逻辑，差别只在世界数据与网格坐标。

你可以在同一个页面切换三种世界：

- 正方形格，最容易理解的四邻域运动；
- 正三角形格，邻接方向与朝向关系更紧；
- 正六边形格，移动方向更接近蜂窝式离散空间。

它们都是环面世界，走出边界会从另一侧回来。虫子和食物都可以直接拖到格子里，六路感知仍然以同一组 G1–G3 / B1–B3 语义呈现。现在打开“经验观察”后，Top-N 信念会定期请求最新概念袋快照，期望值以标签和强度条同步变化，不需要反复收起再展开。

这件事的价值不在于多了三个几何选项，而在于可以做一个很干净的对照：把世界从连续坐标换成离散拓扑，尽量保持感知、操作和 NARS 面板不变，看变化究竟来自环境，还是来自展示方式。

## 还有几种玩法

[Pong](https://arcj137442.github.io/opennars-304-ts-lab/pong.html) 把单个 NARS、双控制器和多角色玩法放进同一页面，每个角色使用独立 Worker，面板会分别显示角色状态和 RPS。[Shot](https://arcj137442.github.io/opennars-304-ts-lab/shot.html) 则把 NARust-o 的射击、相对位置和进化世界接入 OpenNARS 的具身接口，适合观察多个 NARS 角色如何面对同一个受限世界。

首页上的 Alien、BandRobot、CartPole、Hunt、TicTacToe、Grid2D TestChamber、FighterPlane 和 Echo Relay，是一组更小的实验场。它们共享 Worker、操作记录、经验观察和性能 HUD，因此你可以把同一套问题带到不同环境里：感知改变时，目标有没有改变；目标改变后，推理有没有推进；推理推进后，是否产生了非 babble 操作；操作之后，世界有没有给出对应反馈。

这也是它和“游戏截图 Demo”的区别。画面只是入口，真正要看的，是闭环有没有接上。

## 源码里发生了什么

项目把核心推理器和宿主环境分开。核心 src 不直接依赖 Node.js 或浏览器 API；文件、时钟、序列化、终端和网络等能力由宿主注入，Node.js CLI 与浏览器 Worker 在 src/platform 一侧装配。npm 运行时不再依赖 jree，audit:jree 的直接导入和出现计数为 0/0。

这条边界不是为了好看。它让同一个 NARS 核心可以被终端、Node API 和浏览器 Worker 使用，也让性能问题更容易定位：到底是推理器慢、概念增长慢、垃圾回收慢，还是环境正在同步等待。

在 Java 迁移到 TypeScript 的过程中，项目保留了有证据的语义合同，例如 UTF-16 字符串行为、Java hash、浮点与长整数边界、集合插入顺序、迭代器移除和事件身份；对于只是复用 Java 标准库的地方，则逐步改为原生 TypeScript 类型、模板字符串、原生 Map/Set 和宿主能力。读者可以从 Core 的 [开发者指南](https://github.com/ARCJ137442/OpenNARS-304-ts/blob/main/docs/developer-guide.md)、[架构说明](https://github.com/ARCJ137442/OpenNARS-304-ts/blob/main/docs/architecture.md) 和 [集成指南](https://github.com/ARCJ137442/OpenNARS-304-ts/blob/main/docs/integration-guide.md) 继续往下追。

## 这些实验能证明什么

当前公开版本已经通过当前 HEAD 的 M1′ 主体 243/243、额外 #246、#245 降周期、strict markerless、M2 514/514、非增量 typecheck、release package、Node/API、平台审计和真实浏览器 Demo 门。Core v1.0.7 已发布，两个 GitHub 仓库已经公开，Demo Lab 在 Pages 上运行。

这些证据证明的是“代码可以按记录的合同运行，并且关键入口可复现”。它们不自动证明三件更大的事：

1. Microworld 示例知识模式已经持续达到 20 TPS；
2. TypeScript 在同一台机器上已经和 Java 具有相同推理性能；
3. Shot 或 2048 已经证明了长期学习收益。

这三件事仍然是实验问题。性能优化候选在重复低收益后按维护者决定停止，剩余瓶颈和未证明边界继续公开记录。把没测到的结果写成胜利，反而会让 Demo 失去它最有价值的地方：它本来就是拿来观察、质疑和复现实验的。

## 许可证与来源

Core 仓库采用 MIT License，OpenNARS 3.0.4 的来源与改写边界见 Core 的 NOTICE。Demo Lab 是独立仓库，Microworld、ONA、Jev 2048 等素材和改写分别保留对应来源与许可证文本。使用前请同时阅读 [Core 许可证](https://github.com/ARCJ137442/OpenNARS-304-ts/blob/main/LICENSE)、[来源说明](https://github.com/ARCJ137442/OpenNARS-304-ts/blob/main/NOTICE) 和 [Demo Security Policy](https://github.com/ARCJ137442/OpenNARS-304-ts-web-demo/blob/main/SECURITY.md)。

如果你只打开过一次 NARS，不妨从一个最小实验开始：打开终端输入一条判断，切到 Microworld 观察一只虫子，再切到 Grid 看同一套面板如何承载三个离散世界。你会发现，NARS 最有意思的地方并不是它能输出一句看起来聪明的话，而是你可以追问这句话从哪条感知来、经过了哪几步推理、是否真的改变了行动，以及行动之后世界有没有认真回答它。
