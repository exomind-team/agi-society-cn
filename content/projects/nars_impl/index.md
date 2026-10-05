---
comments: true
---

# NARS各版实现 索引

本页是 NARS 各版实现的入口索引。每个项目页保存该实现自己的基础资料、运行方式、教程、截图和源码观察；不再另设一张重复维护的大型资料表。

> [!info] 资料口径
> 页面中的“基础资料”由 data/nars-implementations.json 维护，并通过 npm run nars:catalog 分发到各项目页。字段只记录已核验事实；未知字段保留“未知”，不根据提交日期推断维护状态。

**最后核验：** 2026-09-20

## 实现索引

| 实现 | 代际 / 定位 | 语言 | 页面与代码 |
|---|---|---|---|
| [[ona|ONA]] | OpenNARS for Applications | C | [[ona|项目页]]；[仓库](https://github.com/opennars/OpenNARS-for-Applications) |
| [[narjure|Narjure]] | OpenNARS 2.0 | Clojure | [[narjure|项目页]]；[仓库](https://github.com/opennars/narjure) |
| [[opennars|OpenNARS]] | OpenNARS 1.x / 3.x；相关研究版 3.1.1 | Java | [[opennars|项目页]]；[仓库](https://github.com/opennars/opennars) |
| [[nars_cxin_py_to_ts|NARS CXin Py to TS]] | Python 到 TypeScript 的迁移实现 | TypeScript（仓库 API 未声明语言） | [[nars_cxin_py_to_ts|项目页]]；[仓库](https://gitee.com/poerlang/nars_cxin_py_to_ts) |
| [[opennars304ts|OpenNARS 304 TS]] | OpenNARS 3.0.4 的 TypeScript 实现 | TypeScript | [[opennars304ts|项目页]]；[仓库](https://github.com/ARCJ137442/OpenNARS-304-ts) |
| [[openjunars|OpenJunars]] | Junars 的开源版本 | Julia | [[openjunars|项目页]]；[仓库](https://github.com/AIxer/OpenJunars) |
| [[nars_python|NARS-Python]] | 独立 Python 实现 | Python | [[nars_python|项目页]]；[仓库](https://github.com/ccrock4t/NARS-Python) |
| [[opennars4|OpenNARS 4 (PyNARS)]] | OpenNARS 4 / Python | Python | [[opennars4|项目页]]；[仓库](https://github.com/opennars/OpenNARS-4) |
| [[20nar1|20NAR1]] | 受 NARS 启发的 GMI 系统 | Rust | [[20nar1|项目页]]；[仓库](https://github.com/PtrMan/20NAR1) |
| [[narst|NARst]] | 实验性 Rust NARS 实现 | Rust | [[narst|项目页]]；[仓库](https://github.com/ntoxeg/narst) |
| [[narust|NARust-158]] | OpenNARS 1.5.8 的 Rust 重实现 | Rust | [[narust|项目页]]；[仓库](https://github.com/ARCJ137442/NARust-158) |
| [[nars_swift|NARS-Swift]] | Swift NAL/NARS 实现 | Swift | [[nars_swift|项目页]]；[仓库](https://github.com/maxeeem/NARS-Swift) |

## 资料与理论入口

- [[introduction|NARS各版实现介绍]]：历史脉络与入门说明。
- [[research/nars/theory/nac/source-materials|非公理控制原始资料索引]]：理论、论文、源码和具体会议报告入口。
- [Temple AGI Team](https://cis.temple.edu/tagit/#projects)：公开项目、论文、演示和活动资料。

## 版本收录与投稿

> [!question] 需要添加自己的版本？
>
> 若实现者有自己的一版 NARS 实现，可[在 GitHub 提 issue](https://github.com/exomind-team/agi-society-cn/issues/new)，或在文末评论区发言。投稿前请提供代码仓库、Narsese/NAL 范围和可运行 Demo；缺少可靠资料的字段保持“未知”。
