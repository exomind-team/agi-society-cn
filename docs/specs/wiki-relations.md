# 人物、反向链接与关系候选

当前入口是 `content/wiki/people/`。现有六位人物的事实资料继续由 `data/people-profiles.json` 维护，新增人物只在 `data/people-identities.json` 登记身份；两份目录不得有重复 ID。人物页面的 `personId` 与目录匹配，显示层不按姓名合并身份。

## 新增论文或人物

1. 登记人物稳定 ID，创建同名 ID 的人物 Markdown 页并使用 `<PersonProfile />`。同名人物必须用不同 ID；不要为了消除同名提示强行合并。`aliases` 只放已确认的字符串别名。
2. 论文写到 `content/wiki/papers/`，写清书目、摘要和来源。在 frontmatter 的 `relations` 指定 `{ person, role, source, status, confidence }`。当前角色是 `author`、`speaker`、`subject`，维护者明确提供的导师记录另用 `doctoral-advisor`、`postdoctoral-advisor`；`status` 为 `confirmed` 或 `maintainer-provided`。源为可访问的外部 URL 或说明证据的站内页面锚点。
3. 运行构建。论文目录、人物署名列表、显式内链的反向链接均由同一次 Markdown 扫描派生，不手工复制人物的论文列表。论文自身署名必须有证据；不能把正文提及的人写成作者。

会议报告从现有 Markdown 表格的「报告人／主讲人／主讲／讲者」与「报告标题／报告题目／主题／题目／内容」列抽取。精确匹配登记姓名才建立 `agenda-speaker-column` 关系；同名有多个 ID 时不匹配。来源记录是议程证据，不表示已观看视频。更换表头后需更新解析与对应测试，不用按固定列号猜身份。

## 已记录事实与待核候选

构建数据由 `.vitepress/relations/index.mjs` 生成，VitePress 的 `relations.data.ts` 负责文件监听。每条边保留 rule、source、status、confidence。

- `explicit-wikilink` / `explicit-markdown-link`：已存在的指向，不证明链接双方观点相同。
- `editorial-evidence`：人工录入并给出来源的署名或主题关系。
- `agenda-speaker-column`：会议表格的署名记录。
- `unique-name-mention`：唯一登记姓名的字面提及，始终是 `candidate / name-only`，不自动升为作者、导师或同一个人的身份确认。
- `shared-explicit-tag`：共同人工标签生成的延伸阅读候选，始终是 `candidate / topic-only`，不生成师生或理论等同关系。

规则候选在页面按需展开，不用一张全局大图取代阅读路径。导师关系按维护者原话记录于刘凯页，明确未作公开独立核验；不由共同署名推断。

## 原始转写的发现边界

`discovery: unlisted` 是唯一发现策略，search、sidebar、知识地图、关系索引与候选均遵守。构建同时设置 robots noindex/nofollow、search:false、sidebarHide:true、sitemap:false，隐藏前后页、编辑与更新时间入口。当前站点未生成 sitemap；未来启用 sitemap 时必须按同一策略过滤，不把 sitemap:false 误认为框架会自动识别。

原始转写在 `content/sources/transcripts/`，没有总目录，不从导航批量列出。普通研究条目可明确链接其中一份来源；该来源页本身及正文不产生索引或回链片段。正文以转义纯文本显示，防止把原材料的 HTML/Vue/frontmatter 当可执行配置。页面说明自动转写、具体 AI 校对记录与未获讲者审核；不能笼统称所有材料均由 Claude 校对。原件字节留存于交付工作区，不随站点发布；展示转换记录原件 SHA-256，不默改转写错字。

这些机制不提供访问控制。公开 GitHub 分支中的源文件仍可直接访问和检索，不能把不进站内索引描述为私密；本轮转写按维护者明确允许链接访问的公开报告资料范围收录。部署仍须沿用户授权的私有预览范围，不能因设置 noindex 就擅自公开部署。不得将私有 NARS 书稿混入来源页。

## 年度目录与验证

年会与组会总览从年度／学年 Markdown 文件发现条目，已有表格行只负责保留地点、备注、场次等元数据；新增年份或学年自动出现，未填元数据明确显示待补充。会议主入口复用相同函数。逐页资料覆盖数据在 `data/conference-coverage.json`，本地核对时间与外部核验时间分开，不因本次构建伪造最新覆盖。

执行 `VITEPRESS_PREVIEW=true VITEPRESS_BASE=/ npm run build`、`VITEPRESS_BASE=/ npm run check:content-links`、`node tests/wiki-relations.test.mjs` 与相关既有测试。静态 HTML 与单元测试不能代替真实浏览器的键盘、触摸和视觉检查。
