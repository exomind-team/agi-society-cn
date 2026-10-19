---
comments: true
---

# NARS-FighterPlane

> **层级**：A3. 框架与应用 — 把 OpenNARS / ONA 当游戏 AI 子模块的应用层衍生

- 全名：**NARS-FighterPlane**
- 编程语言：Python（pygame 渲染；调用外部 OpenNARS 或 ONA 引擎）
- 仓库：<https://github.com/Noctis-Xu/NARS-FighterPlane>
- 维护者：**Boyang Xu**（GitHub 用户 Noctis-Xu；丹麦技术大学 MSc 学生，研究方向自主系统）
- 许可证：仓库元数据未声明
- 仓库平台创建日：2021-05-10；stars：8

## 项目简介

仓库 README：「NARS-FighterPlane is a game in which NARS serves as an AI controlling a fighter plane to hit enemy planes.」

运行方式：玩家 / 实验者安装 Python 3 与 pygame、配置 Cygwin / Java 启动 ONA 或 OpenNARS，运行 `python plane_game.py opennars` 或 `python plane_game.py ONA`。v1.0 与 v2.0 的差别仅在开火控制权交由 NARS 还是游戏自身。维护者 bio 写明身份与背景："I'm Boyang Xu, a MSc student from Technical University of Denmark, studying autonomous systems."

## 学术关联

维护者 Boyang Xu 在丹麦技术大学（DTU）学习自主系统期间围绕 NARS 实施 NARS-FighterPlane；相关学术论文请以正式发表版为准（具体条目留待作者后续补充）。

## 收录与归属

本页属于 [[index|NARS衍生项目]]。NARS-FighterPlane 把 NARS 推理机（OpenNARS 或 ONA）作为游戏 AI 控制器，通过 pygame 渲染战机对抗——属于 A3 框架/应用层的具体游戏 demo，与同门类的 [ccrock4t/NARS-Pong](https://github.com/ccrock4t/NARS-Pong)（NARS-Pong in Unity3D）、NARS-FighterPlane v1.0/v2.0 都属于"用 NARS 控制游戏 NPC"的子门类。

## 来源溯源

- GitHub fork 链：`fork:false`、`parent:null`、`source:null` —— 独立项目，非 fork
- README 自报项目语境；维护者 bio 标明了 DTU MSc 学生背景
- 该项目早于用户当前已收录的其他 NARS-FighterPlane 相关 fork（ARCJ137442/NARS-FighterPlane 等），按 §"挂回原作者"原则，本条目作为唯一权威收录指向 Noctis-Xu 原版
