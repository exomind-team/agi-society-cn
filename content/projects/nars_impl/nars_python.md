---
comments: true
---

# NARS-Python

<!-- BEGIN GENERATED NARS PROFILE -->

## 基础资料

> 本节由 data/nars-implementations.json 生成；项目特有教程和源码观察仍在本页维护。

| 字段 | 已核验信息 |
|---|---|
| 代际 / 定位 | 独立 Python 实现 |
| 编程语言 | Python |
| 作者 / 维护组织 | Christian Hahm |
| 代码仓库 | [仓库](https://github.com/ccrock4t/NARS-Python) |
| 许可证 | MIT |
| Narsese / NAL 边界 | README 确认是 Python NARS 实现；本轮未确认完整 NAL 层级 |
| 运行 / Demo | README 给出 pyinstaller --onefile main.py；仓库包含 GUI 与架构图 |
| 最近公开提交 | 2025-08-19（仅为仓库元数据观察值） |
| 维护状态 | 未判定 |
| 最后核验 | 2026-09-20 |

<!-- END GENERATED NARS PROFILE -->

[GitHub↗](https://github.com/ccrock4t/NARS-Python)

- 作者：*Christian Hahm*
    - [GitHub↗](https://github.com/ccrock4t)

> [!info] 基础资料
> 官方 README 确认这是 Python NARS 实现，并提供 PyInstaller 构建方式、GUI 和架构图；NAL 覆盖范围本轮未据推测补齐。基础字段见本页下方的“基础资料”。

## 快速入门（迁移自官网）

🕒【2024-07-27 20:43:24】迁移自旧官网；原页面目前已替换为站点创建成功提示，正文保留在本页。

先安装 Python （这里建议使用迅雷下载，因为 Python 官网比较慢）：
<https://www.python.org/ftp/python/3.9.5/python-3.9.5-amd64.exe>

接下来安装 Python 集成开发环境：

一直到最近几年，依然有很多编辑器无法方便快捷的对代码进行定义跳转和重构，所以选一款好的编辑器是比较重要的事情，能极大的提高工作学习的效率。

这里推荐一款 Python IDE 集成开发环境： PyCharm

下载地址：<https://www.jetbrains.com/pycharm/download/>

![1](./images/nars_python/tutorial_1.png)

安装好后，去如下链接下载 NARS Python 版：

<https://gitee.com/opennars/NARS-Python>

或 <https://github.com/ccrock4t/NARS-Python>

前一个是国内镜像，后一个是原版最新地址，如果你能科学上网，推荐后一个链接。

![2](./images/nars_python/tutorial_2.png)

解压到D盘，结构如下：

![3](./images/nars_python/tutorial_3.png)

双击桌面的 PyCharm 图标，然后打开解压后的目录：

![4](./images/nars_python/tutorial_4.png)

（下面这个步骤**不是必要的**）除非编辑器找不到 python.exe 或你想换一个 python.exe 版本：

![5](./images/nars_python/tutorial_5.png)

接下来试着右键点击并启动 main.py （应该会报错，因为缺少某些库）：

![6](./images/nars_python/tutorial_6.png)
