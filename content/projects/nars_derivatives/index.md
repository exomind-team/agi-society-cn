---
comments: true
---

# NARS衍生项目 索引

本页汇总与 NARS 相关的衍生项目：基于 NARS 内核或 NAL 模型，但**不直接实现完整 NARS 推理引擎**的项目（典型如应用、工具、论文附属实现、跨学科扩展）。

若为 NARS 各版实现的直接精简/重写（如 OpenNARS 系列的变种），请见 [[index\|NARS各版实现]]。

## 已收录

| 项目 | 语言 | 维护者 | 简介 | 仓库 |
|---|---|---|---|---|
| [[nace\|NACE]]（Non-Axiomatic Causal Explorer） | Python / Julia | patham9（Python 原版）；ntoxeg（Julia 复刻） | 基于 NARS 的因果探索工具 | [Python 版](https://github.com/patham9/NACE) ｜ [Julia 复刻](https://github.com/ntoxeg/NACE.jl) |
| [[pixel-to-concept-reader\|Pixel-to-Concept Reader]] | TypeScript | poerlang | 阅读友好的"结构化 NAL 词条 + 手写数字识别"论文附属实现 | [仓库](https://github.com/poerlang/pixel-to-concept-reader) |

## 候选与待收录

最近一次盘点 poerlang 的公开仓库，识别到几个与 NARS / AGI 主题相关但尚未决定的候选：

- [mininars](https://github.com/poerlang/mininars)（Java，仓库描述："又一个 NARS 精简版"，许可证 MIT，2020-07-13 创建）—— 属于直接 NARS 实现的简化版，按目录约定应归 [[index\|NARS各版实现]]；本轮未在 nars_implementations.json 收录，待与维护者/项目方确认后再补
- [PyNARS](https://github.com/poerlang/PyNARS)（Python，描述："This is the pynars version editted by Tory Li"）—— 同样是直接 NARS 实现的编辑版，同上待归类确认
- [he4o](https://github.com/poerlang/he4o) / [HELIX_THEORY](https://github.com/poerlang/HELIX_THEORY)（Objective-C）—— "螺旋论 / 熵减机"理论及配套 AGI 系统；与 NARS 间接相关，等项目方明确学术联系后再决定是否收录

> [!info] 收录口径
> 仅收录与 NARS（理论、内核、NAL、Narsese）有直接关系的衍生项目。新增条目以仓库描述、README 或论文说明为依据；先归"候选与待收录"再升格到"已收录"。

> [!todo] 持续扩充
> 后续如有 NARS-GPT 等其他衍生项目，按上述口径补到对应分级即可。
