---
title: AGI 资源与社群
order: 7
comments: true
---

<span id="关于资料和q群"></span>

# AGI 资源导读：带着问题，走到实验

AGI 资料中的“智能”并不总指同一件事。读到一个项目时，可以先问：它要解决什么问题，采用什么定义，又怎样判断有没有进展？有了这些问题，再读论文或试代码，会更容易找到要看的部分。

本页从协会原有资源清单整理而来，包含 NARS / OpenNARS、OpenCog 及相关中文资料线索。收录范围有限，条目用于查找资料，不按优劣给 AGI 项目排名。

**资料核验：2026 年 10 月 19 日。** 有的资料已读过相关原文，有的只核对了目录；源码尚未运行、视频未能访问等情况也分别注明。展开条目可查看作者、出处、适用读者与核验记录。

## 从这里开始，不必一次读完

### 先给“通用”一个具体含义

想弄清“机器能聊天，是否就算拥有通用智能”，可以先读[王培的 AGI 入门导读](https://cis.temple.edu/~pwang/AGI-Intro.html)，再对照[智能定义论文](https://cis.temple.edu/tagit/publications/PAGI-TR-9.pdf)。阅读时留意作者怎样描述系统的任务、限制和评价标准。下面的 S09、S01 记录了原文入口与核验范围。

这里也值得停一下：AGI 与 strong AI 不能不加说明地画等号。前者通常讨论能力的通用性；Searle 在 1980 年的哲学语境里讨论的是程序是否真正具有理解和认知状态。两种问题可以相遇，却不应被一个标签抹平。参见 [Searle 原文](https://www.cs.tufts.edu/comp/50cog/readings/searle.html)及 S02。

### 再让一个小问题进入系统

想先试代码，可以从[浏览器终端与六路感知教程](/learn/try)开始：输入两条判断，问第三条能否成立；再到虫脑里观察输入、推理、操作和环境反馈。先把这几步分清，记录实际输出，再讨论系统做到了什么。

准备改代码时，再读 [OpenNARS 仓库说明](https://github.com/opennars/opennars)或 [AtomSpace](https://github.com/opencog/atomspace)的构建与示例文档。两者用途不同，需要分别查看。S07、S08 只核对了源码说明，尚未运行；这里保留安装资料，方便继续尝试。

### 最后回到理论，解释你看到的东西

NARS 并不是一个可以用“改造的贝叶斯网络”概括的系统。它将真值和意义联系到已有经验，并把推理与有限资源下的控制放在一起研究。[经验语义论文](https://www.cis.temple.edu/~pwang/Publication/semantics.pdf)是继续往下读的起点。

例如，在王培 [2001 年的置信度论文](https://www.cis.temple.edu/~pwang/Publication/confidence.pdf)中，频率 f=w+/w 表达正证据比例，置信度 c=w/(w+k)、k>0 保留证据量的信息。两组经验可以有相同的正证据比例，却有不同的证据量；这正是两个数而不是一个数有用的地方。置信度不等同于“命题为真的概率”。论文中的贝叶斯比较是作者的论证，也不意味着整个领域已经接受了同一结论。

需要接着读理论，可以从[知识地图](/learn/map)查找正文；想了解某位作者的工作，可查看[人物研究资料](/about/people)中的著作与会议报告。

## 按用途选资料

### 原始理论
<details class="resource-entry" id="resource-s01">
<summary><strong>S01 · On Defining Artificial Intelligence</strong><span>已核对相关原文</span></summary>

[打开原始资料](https://cis.temple.edu/tagit/publications/PAGI-TR-9.pdf)

- **作者 / 提供者**：Pei Wang
- **核验日期与范围**：2026-10-19；已核对相关原文
- **内容与证据**：PDF第1页摘要与第15–16页讨论定义，特别指出Strong AI在部分AGI语境中的用法不同于Searle原义。
- **适合谁**：希望澄清术语的读者
- **可以继续做什么**：分别写出某个项目的智能定义、目标与评价标准。
- **限制与不确定性**：作者立场，不等于领域共识；本文仅核对相关段落，未逐页评审。

</details>

<details class="resource-entry" id="resource-s02">
<summary><strong>S02 · Minds, Brains, and Programs (1980)</strong><span>已核对相关原文</span></summary>

[打开原始资料](https://www.cs.tufts.edu/comp/50cog/readings/searle.html)

- **作者 / 提供者**：John R. Searle
- **核验日期与范围**：2026-10-19；已核对相关原文
- **内容与证据**：开篇对strong AI的定义涉及程序计算机真正具有理解及认知状态；出版标识doi:10.1017/S0140525X00005756。
- **适合谁**：关心AGI与心灵哲学区别的读者
- **可以继续做什么**：辨别能力目标与“是否真正理解”的哲学命题。
- **限制与不确定性**：链接为大学课程页转载原论文；不把作者反对strong AI的论证写成公认定论。

</details>

<details class="resource-entry" id="resource-s03">
<summary><strong>S03 · Confidence as Higher-Order Uncertainty (2001)</strong><span>已核对相关原文</span></summary>

[打开原始资料](https://www.cis.temple.edu/~pwang/Publication/confidence.pdf)

- **作者 / 提供者**：Pei Wang
- **核验日期与范围**：2026-10-19；已核对相关原文
- **内容与证据**：第2–3页：f=w+/w，c=w/(w+k)，k>0；第4页修正规则要求不重复计数；第7–8页比较Bayesian及higher-order probability。
- **适合谁**：有基础代数、想理解NAL真值的读者
- **可以继续做什么**：手算同频率不同证据量时的置信度，并解释重复证据问题。
- **限制与不确定性**：这是该论文的形式化；confidence不是“命题为真的概率”；未对所有NARS版本进行一致性检查。

</details>

<details class="resource-entry" id="resource-s04">
<summary><strong>S04 · Experience-Grounded Semantics: A theory for intelligent systems</strong><span>已核对摘要与框架</span></summary>

[打开原始资料](https://www.cis.temple.edu/~pwang/Publication/semantics.pdf)

- **作者 / 提供者**：Pei Wang
- **核验日期与范围**：2026-10-19；已核对摘要与框架
- **内容与证据**：摘要把真值和意义联系到系统经验；第一页区分逻辑与记忆/控制。
- **适合谁**：想理解NARS语义基础的进阶读者
- **可以继续做什么**：区分真值、词项意义、推理规则和资源控制。
- **限制与不确定性**：作者网站预印本标注2004-08-23，作者目录给出的期刊出版年为2005；二者不应混为版本错误。

</details>

<details class="resource-entry" id="resource-s05">
<summary><strong>S05 · Selected Papers of Pei Wang</strong><span>已核对目录</span></summary>

[打开原始资料](https://cis.temple.edu/~pwang/papers.html)

- **作者 / 提供者**：Pei Wang
- **核验日期与范围**：2026-10-19；已核对目录
- **内容与证据**：作者目录含NARS、NAL、AGI定义及不确定性等分组；注明在线稿可能与发表版略异。
- **适合谁**：准备系统阅读NARS的读者
- **可以继续做什么**：按研究问题找到原文、作者和发表信息。
- **限制与不确定性**：目录存在不代表每篇全文都已读；作者目录也不能替代独立效果评估。

</details>

<details class="resource-entry" id="resource-s06">
<summary><strong>S06 · Non-Axiomatic Logic: A Model of Intelligent Reasoning；Rigid Flexibility: The Logic of Intelligence</strong><span>仅核对作者书目</span></summary>

[打开原始资料](https://cis.temple.edu/~pwang/papers.html)

- **作者 / 提供者**：Pei Wang
- **核验日期与范围**：2026-10-19；仅核对作者书目
- **内容与证据**：目录列NAL第二版2025与Rigid Flexibility 2006；后者描述NARS 4.3。
- **适合谁**：准备长期研读逻辑体系的读者
- **可以继续做什么**：确认书名与版本，再通过出版社或图书馆查找合法版本。
- **限制与不确定性**：出版社链接本轮读取失败；未取得或阅读群文件、整本书，也未确认群内NAL是哪一版。

</details>

### 可运行实现
<details class="resource-entry" id="resource-s07">
<summary><strong>S07 · OpenNARS for Research 3.0+</strong><span>已核对README，未运行</span></summary>

[打开原始资料](https://github.com/opennars/opennars)

- **作者 / 提供者**：OpenNARS项目贡献者
- **核验日期与范围**：2026-10-19；已核对README，未运行
- **内容与证据**：README有Java/Maven构建流程、相关仓库和Narsese示例入口。
- **适合谁**：具备Java/Maven基础的开发者
- **可以继续做什么**：按README构建并复现实例，记录输入、输出、版本与失败情况。
- **限制与不确定性**：“可运行实现”指提供源码和运行说明，不代表本轮构建通过；不能据此声称已实现人类水平AGI。

</details>

<details class="resource-entry" id="resource-s08">
<summary><strong>S08 · AtomSpace</strong><span>已核对README相关部分，未运行</span></summary>

[打开原始资料](https://github.com/opencog/atomspace)

- **作者 / 提供者**：OpenCog项目贡献者
- **核验日期与范围**：2026-10-19；已核对README相关部分，未运行
- **内容与证据**：自述为超图数据库及图重写系统；有示例、构建与单元测试说明。
- **适合谁**：熟悉图结构、愿意配置开发环境的读者
- **可以继续做什么**：创建小型知识图并练习查询或图操作。
- **限制与不确定性**：它是构件，不是装完即获得完整AGI；本轮未构建、未审计全部依赖。

</details>

### 导读与会议
<details class="resource-entry" id="resource-s09">
<summary><strong>S09 · Artificial General Intelligence — A Gentle Introduction</strong><span>已核对导读内容</span></summary>

[打开原始资料](https://cis.temple.edu/~pwang/AGI-Intro.html)

- **作者 / 提供者**：Pei Wang
- **核验日期与范围**：2026-10-19；已核对导读内容
- **内容与证据**：页面讨论AGI目标、理论/模型/实现与多种研究路径；标注2026年9月更新。
- **适合谁**：零基础但愿意读英文的读者
- **可以继续做什么**：先比较研究目标，再选一个系统深入。
- **限制与不确定性**：这是有明确作者立场的导读，不是全领域唯一分类，也不是零基础视频替代品。

</details>

<details class="resource-entry" id="resource-s10">
<summary><strong>S10 · 2012–2020年AGI会议资料线索</strong><span>仅核对部分会议论文书目</span></summary>

[打开原始资料](https://cis.temple.edu/~pwang/papers.html)

- **作者 / 提供者**：各年作者及会议组织方；具体群文件未知
- **核验日期与范围**：2026-10-19；仅核对部分会议论文书目
- **内容与证据**：作者目录含AGI-12论文及AGI-20论文，并有会议链接。
- **适合谁**：需要按年代寻找论文的读者
- **可以继续做什么**：从具体题名、作者、年份回溯正式论文记录。
- **限制与不确定性**：并未核验完整九年会议文集；本轮2012/2020会议链接读取失败；群文件未访问，不能断言完整或有再分发授权。

</details>

### 历史线索
<details class="resource-entry" id="resource-s11">
<summary><strong>S11 · OpenCog旧主仓库</strong><span>已核对维护声明</span></summary>

[打开原始资料](https://github.com/opencog/opencog)

- **作者 / 提供者**：OpenCog项目贡献者
- **核验日期与范围**：2026-10-19；已核对维护声明
- **内容与证据**：README明确声明本仓库不再维护，并指向AtomSpace等子项目。
- **适合谁**：研究OpenCog历史或寻找后续入口的读者
- **可以继续做什么**：沿README查找具体组件；避免把旧主仓库当新手默认安装入口。
- **限制与不确定性**：不把旧仓库停止维护扩大解释为整个OpenCog生态停止。

</details>

<details class="resource-entry" id="resource-s12">
<summary><strong>S12 · 机器之心2018链接（原文标题待核）</strong><span>未取得正文</span></summary>

[打开原始资料](https://www.jiqizhixin.com/articles/2018-11-15-6)

- **作者 / 提供者**：作者待核；网站为机器之心
- **核验日期与范围**：2026-10-19；未取得正文
- **内容与证据**：读取结果只有文章库导航和登录提示。
- **适合谁**：愿意补齐历史报道的读者
- **可以继续做什么**：若能合法打开，补录标题、作者、日期和原文引用。
- **限制与不确定性**：不能由URL日期推断完整发表信息，不能评价正文或声称读完。

</details>

<details class="resource-entry" id="resource-s13">
<summary><strong>S13 · 博客链接（旧清单称“破尔狼”）</strong><span>本轮读取失败</span></summary>

[打开原始资料](https://moketao.gitee.io/2019/10/11/agi-and-ai/)

- **作者 / 提供者**：旧清单称破尔狼；页面署名未核
- **核验日期与范围**：2026-10-19；本轮读取失败
- **内容与证据**：研究工具无法访问该URL。
- **适合谁**：整理早期中文讨论的读者
- **可以继续做什么**：取得原文后核对其引用，再决定是否列为辅助阅读。
- **限制与不确定性**：失败不等于永久失效；未核对标题、内容、署名或理论准确性。

</details>

### 未核验
<details class="resource-entry" id="resource-s14">
<summary><strong>S14 · 零基础视频（原始标题待核）</strong><span>本轮读取失败</span></summary>

[打开原始资料](http://www.dushuren123.com/dushuren/video/share.html?id=1679351024)

- **作者 / 提供者**：未知
- **核验日期与范围**：2026-10-19；本轮读取失败
- **内容与证据**：工具无法读取；返回中展示HTTPS地址。
- **适合谁**：视频型入门读者，待内容审核后决定
- **可以继续做什么**：目前仅可作为追查线索。
- **限制与不确定性**：未确认标题、讲者、授权、难度或内容质量；暂不推荐为第一课。

</details>

<details class="resource-entry" id="resource-s15">
<summary><strong>S15 · B站视频BV1zA411u7rC（旧清单称刘凯_AGI）</strong><span>本轮读取失败</span></summary>

[打开原始资料](https://www.bilibili.com/video/BV1zA411u7rC)

- **作者 / 提供者**：讲者/上传者待核
- **核验日期与范围**：2026-10-19；本轮读取失败
- **内容与证据**：未取得视频页面正文或字幕。
- **适合谁**：偏好中文讲解的读者，待核
- **可以继续做什么**：补齐标题、账号、日期与字幕后，再核对主张。
- **限制与不确定性**：账号显示名不能单独证明身份；未观看。

</details>

<details class="resource-entry" id="resource-s16">
<summary><strong>S16 · B站视频BV1wf4y1k7Yh第21分P（旧清单称朱松纯/暗物智能）</strong><span>本轮读取失败</span></summary>

[打开原始资料](https://www.bilibili.com/video/BV1wf4y1k7Yh?p=21)

- **作者 / 提供者**：讲者/上传者待核
- **核验日期与范围**：2026-10-19；本轮读取失败
- **内容与证据**：未取得视频页面正文或字幕。
- **适合谁**：希望了解另一条研究路线的读者，待核
- **可以继续做什么**：确认第21分P具体主题及原始演讲来源。
- **限制与不确定性**：未确认分P标题、发布方和内容，不为该视频背书。

</details>

<details class="resource-entry" id="resource-s17">
<summary><strong>S17 · Google Scholar学者页（旧清单称王培）</strong><span>本轮读取失败</span></summary>

[打开原始资料](https://scholar.google.com/citations?hl=en&user=-EYJLoMAAAAJ)

- **作者 / 提供者**：待页面确认
- **核验日期与范围**：2026-10-19；本轮读取失败
- **内容与证据**：未获取学者页内容。
- **适合谁**：查论文与引用的读者
- **可以继续做什么**：优先用S05作者网站核对具体论文。
- **限制与不确定性**：未核实该profile当前身份及统计；引用次数不用于证明理论正确。

</details>

<details class="resource-entry" id="resource-s18">
<summary><strong>S18 · SingularityNET YouTube频道</strong><span>仅取得频道标题</span></summary>

[打开原始资料](https://www.youtube.com/channel/UCbTE8vfz5zuEK5uRnc2yjrw)

- **作者 / 提供者**：频道标题显示SingularityNET；与官网关联待复核
- **核验日期与范围**：2026-10-19；仅取得频道标题
- **内容与证据**：工具返回SingularityNET - YouTube，正文极少。
- **适合谁**：希望查找该生态演讲及演示的读者
- **可以继续做什么**：找到单条视频后记录讲者、时间、主张及对应论文。
- **限制与不确定性**：未获取列表、字幕或看完视频；本轮未从官网核实该精确channel ID，不能保证官方归属。

</details>

<details class="resource-entry" id="resource-s19">
<summary><strong>S19 · YouTube检索词：OpenNARS</strong><span>仅保留检索提示</span></summary>

- **作者 / 提供者**：不适用
- **核验日期与范围**：2026-10-19；仅保留检索提示
- **内容与证据**：旧清单只有搜索建议，没有确定资源。
- **适合谁**：寻找演示视频的读者
- **可以继续做什么**：优先选择能关联论文、代码版本和实验输入的演示。
- **限制与不确定性**：不是已核验课程或频道；没有可引用的具体内容链接。

</details>

<details class="resource-entry" id="resource-s20">
<summary><strong>S20 · QQ群367446800；QQ群528053635</strong><span>仅核对旧清单中的群号线索</span></summary>

- **作者 / 提供者**：群主及管理方未知
- **核验日期与范围**：2026-10-19；仅核对旧清单中的群号线索
- **内容与证据**：旧清单分别称“协会QQ群”和“贴吧群”。
- **适合谁**：愿意人工核实社群的读者
- **可以继续做什么**：核实组织身份、群规和文件来源后，再决定是否加入。
- **限制与不确定性**：未访问群、未加群；不保证有效、官方或安全，不能宣传为经认证协会入口。

</details>

<details class="resource-entry" id="resource-s21">
<summary><strong>S21 · 公众号名称：赛先生</strong><span>仅名称线索</span></summary>

- **作者 / 提供者**：主体与账号ID待核
- **核验日期与范围**：2026-10-19；仅名称线索
- **内容与证据**：旧清单未提供账号ID或具体文章。
- **适合谁**：偏好中文阅读的读者，待核
- **可以继续做什么**：取得唯一账号标识及文章链接后逐篇核验。
- **限制与不确定性**：名称可能同名或改名；不冒认官方，不推断运营主体。

</details>

<details class="resource-entry" id="resource-s22">
<summary><strong>S22 · 公众号名称：反朴</strong><span>仅名称线索</span></summary>

- **作者 / 提供者**：主体与账号ID待核
- **核验日期与范围**：2026-10-19；仅名称线索
- **内容与证据**：旧清单未提供账号ID或具体文章。
- **适合谁**：偏好中文阅读的读者，待核
- **可以继续做什么**：取得唯一账号标识及文章链接后逐篇核验。
- **限制与不确定性**：名称可能同名或改名；不冒认官方，不推断运营主体。

</details>

<details class="resource-entry" id="resource-s23">
<summary><strong>S23 · 公众号名称：混沌巡洋舰</strong><span>仅名称线索</span></summary>

- **作者 / 提供者**：主体与账号ID待核
- **核验日期与范围**：2026-10-19；仅名称线索
- **内容与证据**：旧清单未提供账号ID或具体文章。
- **适合谁**：偏好中文阅读的读者，待核
- **可以继续做什么**：取得唯一账号标识及文章链接后逐篇核验。
- **限制与不确定性**：名称可能同名或改名；不冒认官方，不推断运营主体。

</details>

<details class="resource-entry" id="resource-s24">
<summary><strong>S24 · 公众号名称：真正的人工智能</strong><span>仅名称线索</span></summary>

- **作者 / 提供者**：主体与账号ID待核
- **核验日期与范围**：2026-10-19；仅名称线索
- **内容与证据**：旧清单未提供账号ID或具体文章。
- **适合谁**：偏好中文阅读的读者，待核
- **可以继续做什么**：取得唯一账号标识及文章链接后逐篇核验。
- **限制与不确定性**：名称可能同名或改名；不冒认官方，不推断运营主体。

</details>

## 把线索变成可引用的资料

- 找到具体题名、作者、时间与原始出处，再引用观点；账号名称、群聊转述和搜索词先作为线索。
- 实验记录保留版本、环境、输入、输出和失败情况。演示成功与通用能力证明，是不同层次的结论。
- 会议文集与教材优先通过作者、出版社、会议或图书馆取得。群文件的完整性和再分发授权需要另查。
- 本次访问失败，只说明这次未能核验；不据此断言链接永久失效或内容不存在。

旧视频的标题和讲者、博客原文、失效链接的新地址，都是有用的补充。找到后可以按[贡献指南](/contact/contributing/formats)提交，并注明从哪里查到，便于下一位读者核对。
