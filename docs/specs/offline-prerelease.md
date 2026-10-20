# 全站离线预发行版

## 发布入口与边界

只对先锋分支 `dot/dev-agi-society-cn-20261019` 生效。维护者审阅内容后修改 `release/offline-preview.json` 的 request 标记并推送，触发一次全站打包。普通文档改动不发版。保持 marker 内容可读，不能填写秘密。工作流不修改 main，不部署 Pages、腾讯云或论坛。

保留 `workflow_dispatch`，但 GitHub 要求工作流文件存在默认分支才能手动触发。目前不因此修改 main；先用先锋分支 marker push 触发。日后经授权纳入默认分支后，Run workflow 选择先锋分支即可。

产物是 ZIP：单文件 `wiki-preview.html`、README、源码版本、构建 manifest、SHA256 校验。外附 ZIP 校验与 release manifest。下载后解压即可阅读，无需脚本合并。正文、人物、论文、报告、社区本地草稿演示保持同一快照。

`release-boundary.json` 明列允许页面、附件及不索引原料路径；新增路径必须重新审查。它不是版权/隐私自动判断器，已有页面正文的修改也需要人工审核。只打包已审阅公开 Wiki；不得将受限书稿、译作全文、私有 skill、聊天导出、个人原件放入范围。`unlisted` 仅影响搜索/目录，不提供保密；包内仍可读取已授权公开原始转写。

## 溯源与防覆盖

- 源码 commit 从实际 Git HEAD 读取，另标明源码是否有未提交变更。
- 公共发版拒绝 dirty 源码；本地 QA 可显式 `--allow-dirty`，不得据此声称可复现已发布 commit。
- HTML 内、外 provenance 与 dist manifest SHA256 必须一致。
- ZIP 使用固定成员白名单，打包后逐项读回校验，不打包整个工作区。
- tag 是 `wiki-preview-<完整源码SHA>`；`prerelease=true`、`latest=false`，遇到同一 commit 已有 release 安全停止，不覆盖已有 tag/release，也不自动删除旧版本。
- 使用 GitHub 内建短期 token，仅该 job 有 contents write；不创建 secret 或长期凭据。
- 安装依赖遵循仓库 npm lock，工作流最长20分钟，不安装额外视频/浏览器/转写工具。

## 本地核验

```sh
npm ci
VITEPRESS_PREVIEW=true VITEPRESS_BASE=/ npm run build
npm run check:content-links
node --test tests/community-drafts.test.mjs tests/wiki-relations.test.mjs
node scripts/offline/build.mjs
python3 scripts/offline/release.py
```

本地有未提交工作时，仅作 QA 可以指定 `--allow-dirty --output /tmp/wiki-preview-qa`。输出目录不要复用已有同名 ZIP；脚本拒绝覆盖。

验收顺序：下载ZIP→校验SHA256→解压打开HTML→王伟军独页→论文→引用到社区→保存本地草稿→返回Wiki。核对发布 commit 与 manifest，再确认12份原料不在搜索/目录、但获授权的直接链接可用。此流程不证明外部视频目录已全量最新。

工作流尚需首次远程运行验证 runner、组织权限与 Release 上传；本地测试通过不能冒称 Actions 成功。

来源：[GitHub 手动运行工作流](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)、[gh release create](https://cli.github.com/manual/gh_release_create)。
