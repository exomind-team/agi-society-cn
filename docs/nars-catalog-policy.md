# NARS 项目与资料维护策略

## NARS 与会议资料维护

- 修改 `data/nars-implementations.json` 后运行 `npm run nars:catalog`，不要手工维护总表的重复字段
- B 站候选审计需要先通过 web-access/CDP 打开协会官方空间，再运行 `node scripts/audit-bilibili-conference.mjs --target=<CDP target id> --write`
- B 站脚本只生成候选报告，不自动把视频归入年会或组会；正式入库前必须核对标题、发布时间、合集分页与议程
- NARS 理论原始资料入口维护在 `content/research/nars/theory/nac/source-materials.md`

#### 标准化 NARS 项目收录流程

新项目从发现到正式收录统一走这套（脚本 + 人工两步）：

1. **运行 `scripts/ingest-nars-project.mjs` 起草元数据**
   ```bash
   node scripts/ingest-nars-project.mjs \
     --owner=<owner> --repo=<repo> \
     --target=impl|derivatives \
     --tier=A1|A2|A3|B1|B2 \
     [--page=<page-id>] [--name=<display-name>]
   ```
   脚本自动拉 GitHub 元数据（fork 链 / parent / source / stars / README 前 30 行），按 §"收录 NARS 实现的查重纪律" 做出 PASS / WARN 提示，并把项目页骨架打印到 stdout。脚本**不修改任何文件**

2. **人工根据骨架写项目页**
   - README 取摘要、改正语言、补 author / license / 来源溯源
   - 顶部"层级"标注保留用户的 --tier 提示
   - 写文件到 `content/projects/nars_{impl,derivatives}/<page>.md`

3. **同步索引页 / JSON 数据源**（按目标分类）
   - `target=impl`：在 `data/nars-implementations.json` 加 entry 后跑 `npm run nars:catalog`，render-nars-index.mjs 自动把行加到 nars_impl/index.md
   - `target=derivatives`：手工在 `content/projects/nars_derivatives/index.md` 的"已收录"表格加行；分类体系用 A/B + 子档 1/2/3

4. **commit + push** 后执行 `npm run publish:tencent --confirm=tencent-main` 让腾讯云镜像同步

5. **复核**：`npm run build` + `npm run check:content-links`，确保 wikilink 与表格 `\|` 转义符合 §9

### 收录 NARS 实现的查重纪律

- 在 `data/nars-implementations.json` 新增任何 NARS 实现条目之前，必须做"代码/来源溯源"
- 溯源手段（按可信度排序）：
  1. 通过 `gh api repos/<owner>/<repo> --jq '{fork, parent, source}'` 拿 fork 链，明确上游（fork 透明可接受）
  2. 抽样对比 mininars.nars_core_java/nars/main_nogui/*.java 与本地 OpenNARS v3.x 仓库 `src/nars/main/*.java` 的 package + 起始几行
  3. 必要时整目录 `diff -rq` 或抽样全文比对
- 明确边界：
  - 接受：fork 链透明（GitHub parent/source 可见）+ 有具体二次改造（如精简模块、增 NAL 层、改 GUI、换语言重写）
  - 拒绝：换名复刻（同一份代码换维护者/换项目名，无可核验的二次改造）——除非项目方明确说明
- 文档化：所有 NARS 实现条目须在 `notes` / `generation` 字段写明上游来源与本次精简内容；若属 fork 链一目了然，在项目页正文也要再次注明
- 例外（如特殊说明 fork 即停刊的归档项目）单独评估，且笔记里要写明评估依据

### NARS 实现的准入范围

- NARS 实现（`nars_impl`）须同时满足两条：
  1. **原创 NARS 推理器代码**：自己实现 Narsese 解析、NAL 规则、控制机制等核心组件；可以是他人项目的 fork + 大量二次改造（如 OpenNARS 系列的 C / Clojure / Python / Julia / Rust / TypeScript / Swift 衍生实现），但**不能是只换名搬运**的纯 fork
  2. **对外提供基于 Narsese 的推理服务**：用户能够向程序提交 Narsese 输入并得到 NARS 推理输出
- 只"受 NARS 启发"但用其他技术栈（LLM 提示工程、神经符号、强化学习等）的项目**不算** NARS 实现，归 `nars_derivatives`
- 仅按"调用 NARS 作为子模块"而自己不实现推理器的项目，归 `nars_derivatives`（运行时集成层）

### 衍生项目收录范围

- nars_derivatives 只收录与 NARS（理论、内核、NAL、Narsese）有**直接字样**关联的衍生项目；不属于 NARS 但属于其他 AGI 平行理论的项目（即便作者相邻），不在本页收录
- 当某个仓库跟 NARS 没直接字样、但跟 NARS 作者群有间接关联（fork 关系、共同目录、共同作者），应挂回对应原作者、并告知作者无关

### 挂回原作者 / 范围声明

- 当一个仓库 fork 自其它作者、且 GitHub 上没有清晰可核验的二次改造（PR、commit history、changelog 等），收录时应把候选条目挂在**原作者**名下，fork 仅作为补充链接，避免"换账号搬运"造成的归属漂移
- 反例：把 poerlang 名下的 `he4o` / `HELIX_THEORY`（fork 自 jiaxiaogang/HE、jiaxiaogang/HELIX_THEORY，无独有改造）当作 poerlang 原创收录，会把原作者的署名错挂——应当挂在 jiaxiaogang 名下，且因这俩本质是 jiaxiaogang 的"螺旋抗熵"AGI 平行理论，与 NARS 没有直接字样关联，按 §"衍生项目收录范围"也不在 nars_derivatives 收录清单内
- 普通推送不发布腾讯云生产镜像；生产发布只能执行 `npm run publish:tencent --confirm=tencent-main`，并在 GitHub Actions 手动确认 `publish_tencent=true`

---
