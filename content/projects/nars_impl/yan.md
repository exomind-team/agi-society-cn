---
comments: true
---

# YAN（Yet Another NARS）

> **层级**：A2. 理论实现 — 独立 C 实现 NAL，专注控制与传感器运动

- 全名：**YAN**（Yet Another NARS）
- 编程语言：C
- 仓库：<https://github.com/PtrMan/YAN>
- 维护者：PtrMan（fork 自 patham9/YAN）
- 仓库平台创建日：依 fork 上游；2020 年起在 PtrMan 名下维护

## 项目简介

README：「A complete and mature next generation NARS implementation in C, built on top of Minimal Sensorimotor Component (MSC, a stripped down ANSNA with Compound Terms instead of SDR's). Differently than OpenNARS, YAN focuses on inference control and overall reliability. It is an attempt to close the loop from sensor input to goal-driven action. The most crucial NAL inference rules are implemented in the system, while experimental NARS features (such as NAL-9 and self-regulation) are not part of YAN, and neither are inference rules which are hard to control, such as multi-conditional syllogisms.」

「YAN sacrifices some flexibility for extreme reliability; its strengths lie in sensorimotor (control tasks, robotics), story understanding, real-time applications and its ability to run uninterrupted. Additionally, the system's memory footprint can be strictly limited, allowing it to be used in embedded systems. It has already been tested on various ARM processors.」

## 收录与归属

本页属于 [[index|NARS各版实现]]。它用 C 直接实现 NAL 推理机，面向控制、机器人、故事理解、实时应用等场景，并在多种 ARM 处理器上测试。

## 来源溯源

- GitHub fork 链：`fork:true`、`parent:patham9/YAN`、`source:patham9/YAN` —— fork 透明
- 上游 patham9/YAN 本身以 MSC（Minimal Sensorimotor Component，patham9 的另一个子项目）为基础；PtrMan 的 fork 在控制、传感器运动方向上做了二次命名与维护
- 编译：`./build.sh`，在 GCC / Clang（x64 / x86 / ARM）上测试
