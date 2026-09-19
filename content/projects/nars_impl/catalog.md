---
title: NARS 实现基础资料总表
comments: true
---

# NARS 实现基础资料总表

本表是 NARS 各实现的基础资料集中索引，数据源为 data/nars-implementations.json。字段只记录本轮从项目 README、官方仓库元数据或用户提供资料中确认的事实；未知字段保持“未知”，不根据公开提交日期推断维护状态。

> [!info] 核验边界
> 最近公开提交日期只表示仓库元数据观察值，不等同于项目维护状态。NAL 覆盖范围只有在 README、测试材料或源码中明确出现时才写入。

**最后核验：** 2026-09-19

| 实现 | 实现对象/代际 | 语言 | 代码仓库 | 许可证 | Narsese / NAL 资料边界 | 运行或 Demo | 最近公开提交 | 维护状态 | 核验日期 |
|---|---|---|---|---|---|---|---|---|---|
| [[ona\|ONA]] | OpenNARS for Applications | C | [仓库](https://github.com/opennars/OpenNARS-for-Applications) | MIT | README 明确定位为基于 NARS 与 AIKR 的通用推理组件；本轮未将 NAL 层级写成未经源码核验的结论 | 源码目录运行 ./build.sh；运行 ./NAR shell；README 提供测试、示例和视频教程 | 2025-05-30 | 未判定 | 2026-09-19 |
| [[narjure\|Narjure]] | OpenNARS 2.0 | Clojure | [仓库](https://github.com/opennars/narjure) | GPL-2.0 | README 确认其为 NARS 的 Clojure 实现；NAL 覆盖范围本轮未确认 | README 建议使用 Cursive/IntelliJ 打开项目、进入 REPL 并加载 Lense.clj | 2017-02-24 | 未判定 | 2026-09-19 |
| [[opennars\|OpenNARS]] | OpenNARS 1.x / 3.x；相关研究版 3.1.1 | Java | [仓库](https://github.com/opennars/opennars) | MIT | README 明确描述 Narsese、memory、inference engine 与 control mechanism；仓库 README 未将完整 NAL 层级作为单一字段声明 | Java 8+、Maven；README 列出 Lab、Applications、示例 Narsese 和 GUI 运行方式 | 2021-03-31 | 未判定 | 2026-09-19 |
| [[nars_cxin_py_to_ts\|NARS CXin Py to TS]] | Python 到 TypeScript 的迁移实现 | TypeScript（仓库 API 未声明语言） | [仓库](https://gitee.com/poerlang/nars_cxin_py_to_ts) | 未声明 | 本轮未从仓库元数据确认 NAL 覆盖范围 | 本轮未核实统一运行命令 | 2024-04-12 | 未判定 | 2026-09-19 |
| OpenNARS 304 TS | OpenNARS 3.0.4 的 TypeScript 实现方向 | TypeScript | [仓库](https://github.com/ARCJ137442/OpenNARS-304-ts) | 未公开 | 项目尚未开源，本轮不推测 NAL 覆盖范围 | [在线 Demo](https://arcj137442.github.io/opennars-304-ts/) | 未公开 | 活跃开发中（用户提供信息） | 2026-09-19 |
| [[openjunars\|OpenJunars]] | Junars 的开源版本 | Julia | [仓库](https://github.com/AIxer/OpenJunars) | GPL-3.0 | README 明确写出 NAL 1–6，用于教育和演示 | Julia 包安装；README 提供 REPL、NaCore 和交互式终端示例 | 2023-08-16 | 未判定 | 2026-09-19 |
| [[nars_python\|NARS-Python]] | 独立 Python 实现 | Python | [仓库](https://github.com/ccrock4t/NARS-Python) | MIT | README 确认是 Python NARS 实现；本轮未确认完整 NAL 层级 | README 给出 pyinstaller --onefile main.py；仓库包含 GUI 与架构图 | 2025-08-19 | 未判定 | 2026-09-19 |
| [[pynars\|PyNARS]] | OpenNARS 4 / Python；原仓库已迁移 | Python | [仓库](https://github.com/bowen-xu/PyNARS) | MIT | 原仓库 README 表明其参考 OpenNARS 3.0.4 与 3.1.0；当前仓库 README 已标记 deprecated | 原 README 给出 pip install pynars 与 python -m pynars.Console；后续应优先查看 OpenNARS 4 | 2024-09-03 | 已标记 deprecated | 2026-09-19 |
| [[20nar1\|20NAR1]] | 受 NARS 启发的 GMI 系统 | Rust | [仓库](https://github.com/PtrMan/20NAR1) | MIT | README 明确写出 NAL 1–6、NAL 7–8；NAL 9 仅由特殊操作符支持 | cargo test && cargo run --release it；README 另列 srv、envPong3 与问答评测 | 2021-08-21 | 未判定 | 2026-09-19 |
| [[narst\|NARst]] | 实验性 Rust NARS 实现 | Rust | [仓库](https://github.com/ntoxeg/narst) | Apache-2.0 | README 仅确认是实验性 NARS 实现，并明确不承诺完全兼容；NAL 覆盖范围未声明 | 本轮未从 README 核实统一构建/运行命令 | 2023-09-21 | 未判定 | 2026-09-19 |
| [[narust\|NARust-158]] | OpenNARS 1.5.8 的 Rust 重实现 | Rust | [仓库](https://github.com/ARCJ137442/NARust-158) | Apache-2.0 | README 以 OpenNARS 1.5.8 为复刻对象，并提供 NAL-1–6 测试对照材料；不据此推测 NAL 7–9 | cargo install narust-158；narust_158_shell / narust_158_batch；提供 WebAssembly Demo | 2026-05-23 | 未判定 | 2026-09-19 |
| [[nars_swift\|NARS-Swift]] | Swift NAL/NARS 实现 | Swift | [仓库](https://github.com/maxeeem/NARS-Swift) | 未按 SPDX 声明（GitHub API 返回 NOASSERTION） | README 明确展示 Narsese DSL、NAL logic 与 control 的分层；控制部分仍标为 TBD | swift run / swift build；提供 WebAssembly 在线 Demo与 playground | 2025-07-01 | 未判定 | 2026-09-19 |

## 项目备注

- [[ona|ONA]]：README 明确说明它不是从旧 OpenNARS 代码库分支出来的独立平台，并包含控制机制与应用实验资料（[[ona|项目页]]）
- [[narjure|Narjure]]：适合作为 OpenNARS 2.0 历史实现归档，不把仓库长期未更新直接等同于项目废弃（[[narjure|项目页]]）
- [[opennars|OpenNARS]]：相关仓库：[OpenNARS-for-Research 3.1.1](https://github.com/opennars/OpenNARS-for-Research)；[OpenNARS declarative core](https://github.com/patham9/opennars_declarative_core)（[[opennars|项目页]]）
- [[nars_cxin_py_to_ts|NARS CXin Py to TS]]：Gitee API 当前返回默认分支 master；需要后续直接阅读源码与构建配置（[[nars_cxin_py_to_ts|项目页]]）
- OpenNARS 304 TS：仓库链接已按用户提供资料保留；由于源码未公开，暂不生成独立项目页（暂无独立项目页）
- [[openjunars|OpenJunars]]：README 提示旧的多种实现方式已舍弃，后续应以当前仓库源码为准（[[openjunars|项目页]]）
- [[nars_python|NARS-Python]]：与 PyNARS/OpenNARS 4 是不同仓库，不能因名称相近合并记录（[[nars_python|项目页]]）
- [[pynars|PyNARS]]：README 明确指向 [OpenNARS 4](https://github.com/opennars/OpenNARS-4)，本页不再把它描述为当前主线（[[pynars|项目页]]）
- [[20nar1|20NAR1]]：项目自称 NARS-inspired GMI，不应不加限定地描述为标准 OpenNARS 克隆（[[20nar1|项目页]]）
- [[narst|NARst]]：应保留“实验性、非完全兼容”这一原始限定（[[narst|项目页]]）
- [[narust|NARust-158]]：README 还明确列出 language、entity、inference、control、storage、vm 等模块，可作为 NAC 源码分析入口（[[narust|项目页]]）
- [[nars_swift|NARS-Swift]]：在线 Demo 主要用于演示，README 明确提示 WebAssembly 性能限制（[[nars_swift|项目页]]）

## 后续资料采集

- 代码级控制机制资料见 [[research/nars/theory/nac/source-materials|非公理控制原始资料索引]]。
- 年会、组会与实现演示的关联资料仍以各会议页面为准。
- 更新 data/nars-implementations.json 后执行 npm run nars:catalog；B 站视频候选使用 npm run audit:bilibili。
