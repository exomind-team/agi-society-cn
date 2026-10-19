---
comments: true
---

# BabelNAR 项目集 / NAVM 模型

本页聚合同一作者（ARCJ137442）名下围绕 NAVM 模型（Non-Axiomatic Virtual Machine）与 CINs（NARS Computer Implementations，统一输入输出接口）展开的项目群。

## 核心：NAVM（非公理虚拟机）

- **NAVM.rs**（Rust）：模型定义与 API；仓库描述「Definitions and APIs for the NAVM model」；Apache-2.0；2024-03-04 创建
  - <https://github.com/ARCJ137442/NAVM.rs>
- **NAVM.jl**（Julia）：基于 JuNarsese、启发自 LLVM 架构的抽象 CIN 接口；2023-08-23
  - <https://github.com/ARCJ137442/NAVM.jl>
- **NAVM_Implements**（Jupyter Notebook）：NAVM.jl 在若干 CIN 上的具体实现；2024-01-21
  - <https://github.com/ARCJ137442/NAVM_Implements>

## 工具与运行时

- **BabelNAR.rs**（Rust）：NAVM 模型的实现与应用支撑；topics 标记 nars / non-axiomatic-reasoning；2024-03-04 创建，2024-12-15 最后一次 push
  - <https://github.com/ARCJ137442/BabelNAR.rs>
- **BabelNAR-CLI.rs**（Rust）：BabelNAR.rs 的命令行接口；2024-09-12
  - <https://github.com/ARCJ137442/BabelNAR-CLI.rs>
- **BabelNAR.jl**（Julia）：统一 CINs 输入输出接口；2023-11-03
  - <https://github.com/ARCJ137442/BabelNAR.jl>
- **BabelNAR_Implements**（Julia）：BabelNAR.jl 在特定 CIN 上的实现；2024-01-22
  - <https://github.com/ARCJ137442/BabelNAR_Implements>
- **BabelNAR-NAL-test-suite**（Python）：基于 BabelNAR CLI 的 NARS 自动化测试套件；2024-05-29
  - <https://github.com/ARCJ137442/BabelNAR-NAL-test-suite>
- **NAR-dev-utils**（Rust）：NARS 相关项目开发的实用工具包；2024-03-13
  - <https://github.com/ARCJ137442/NAR-dev-utils>

## 衍生接口

- **Narsese.rs**（Rust）：Narsese 的 Rust 实现；2024-02-19
  - <https://github.com/ARCJ137442/Narsese.rs>
- **JuNarsese.jl**（Julia）：Narsese 数据结构与转换接口；2023-07-24
  - <https://github.com/ARCJ137442/JuNarsese.jl>
- **JuNarseseParsers**：JuNarsese 的解析器扩展；2023-08-08
  - <https://github.com/ARCJ137442/JuNarseseParsers>

## 具身接口

- **JuNEI.jl**（Julia）：NARS-Embodied-Interface；2023-07-01
  - <https://github.com/ARCJ137442/JuNEI.jl>
- **PyNEI**（Python）：NARS-Embodied-Interface in Python；2023-06-30
  - <https://github.com/ARCJ137442/PyNEI>

## 实验与应用

- **NARS-Car-Test**（Python）：基于 NARS 的小车碰撞实验；2023-11-09
  - <https://github.com/ARCJ137442/NARS-Car-Test>

## 收录与归属

本页属于 [[index|NARS衍生项目]]。整个项目群围绕"用统一接口把各 NARS 实现接起来"这一工程目标，是 NARS 在工程化、可互操作层面上的实质性扩展——不属于"换名复刻"。

## 来源溯源

- 所有条目均 `fork:false`、`parent:null`、`source:null`，明确为独立开发
- 项目方描述都自报项目方/简介，无需借助 fork 推断
