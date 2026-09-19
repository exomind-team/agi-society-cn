---
comments: true
---

# NARS各版实现 索引

综合NARS在各处的实现情况，本文添加了NARS各版实现索引。

> [!info] 基础资料总表
> 各实现的语言、仓库、许可证、Narsese/NAL 资料边界、运行方式和最近公开提交日期，集中维护在 [[catalog|NARS 实现基础资料总表]]。总表最后核验于 2026-09-19；未知字段不会用推测补齐。

该索引将专注于NARS各版实现的分类存档。索引将以**编程语言**为主要分类依据，内部排序大部分将按**实现时间/发布时间**组织。编程语言的排序不分先后。

> [!note] 收录边界
> 当前索引收录 12 个实现或实现方向。项目页用于保存项目特有的教程、截图和源码观察；跨项目可比较字段以基础资料总表为准。

> [!warning] 注意
> 本板块不讨论编程语言。
>
> 若想讨论与编程语言自身相关的话题，可移步至其它技术论坛网站。

## 索引

### C

- [[ona|ONA]] (OpenNARS for Applications)

### Clojure

- [[narjure|Narjure]] (OpenNARS 2.x)

### Java

- [[opennars|OpenNARS]] (OpenNARS 1.x / 3.x)

### JavaScript/TypeScript

- [[nars_cxin_py_to_ts|NARS CXin Py to TS]]
- [OpenNARS 304 TS](https://github.com/ARCJ137442/OpenNARS-304-ts) — TypeScript；项目正在活跃开发中，尚未开源（[在线 Demo](https://arcj137442.github.io/opennars-304-ts/)）

### Julia

- [[openjunars|OpenJunars]]

### Python

- [[nars_python|NARS-Python]]
- [[pynars|PyNARS]]

### Rust

- [[20nar1|20NAR1]]
- [[narst|Narst]]（截止至2024-07-26，尚不完整）
- [[narust|NARust]]

### Swift

- [[nars_swift|NARS-Swift]]

## 版本收录&投稿

> [!question] 需要添加自己的版本？
>
> 若实现者有自己的一版 NARS 实现，可[在 GitHub 提 issue](https://github.com/exomind-team/agi-society-cn/issues/new)，或在文末评论区发言。
>
> 同样也欢迎贡献者对遗漏的版本投稿！
>
> 投稿NARS实现前，可检查以下几点：
>
> 1. 有GitHub/Gitee代码仓库
>     - 推荐开源
> 2. 有Narsese语言实现
>     - 不论是内建数据结构，还是借助外部语法解析库
> 3. 有NAL实现
>     - 不限层级，不限算法
> 4. 有Demo演示
>     - 可为视频，也可为在线交互页面
