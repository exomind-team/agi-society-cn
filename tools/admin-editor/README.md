# AGI 官网管理员文字编辑原型

一个可运行的服务端本地 Git 内容库原型，管理员界面不要求理解 Git。它验证“编辑文字 → 私有草稿 → 查看变化 → 确认正式版本 → 恢复历史”，不等同于已上线的官网 CMS。

## 直接启动

需要已有 Node.js 20+、Git。不需要安装 npm 包。

```sh
cd tools/admin-editor
node server/cli.mjs init-v7-fixture ./v7-editor-data
node server/cli.mjs serve ./v7-editor-data 8787
```

打开 http://127.0.0.1:8787 。选择“Obsidian指南 · 正文说明”，编辑的是先锋 v7 一段真实正文中的普通文字片段。服务端 Git 保留原文件完整内容，只替换已登记的文字片段；其余 YAML、链接、表格、callout、组件等保持原字节。原始文件来源与 commit、blob 在 fixtures/upstream/manifest.json。这个独立数据库不会覆盖真实官网仓库。

也可在另外的空目录初始化纯演示资料：

```sh
node server/cli.mjs init-demo ./local-editor-data
node server/cli.mjs serve ./local-editor-data 8787
```

不要把两种初始化命令指向同一目录。初始化拒绝覆盖已有或不完整的数据目录。网页静态文件位于 web/。独立 HTML 演示如果存在，仅是内存交互，不代表服务端保存。

## 已实现

- 本地真实 Git 正式版本，草稿单独保存在 Git 外。
- 保存草稿不会改正式版本；确认正式版本不会自动上线或推送。
- 草稿版本与正式版本双重乐观并发检查；跨进程写入锁及 Git ref CAS。
- 旧草稿、旧确认弹窗、外部 writer 抢先更新时拒绝覆盖。
- 历史恢复生成新提交，不改写旧历史；保留私有草稿并标明它与正式版的关系。
- 文件/操作白名单、同源请求检查、只读服务选项、固定静态资源清单。
- v7 普通文字片段受保护编辑。不是任意 Markdown/Vue 的安全编辑器，也不能改所有页面。

## 实际测试

```sh
node --test tests/*.test.mjs tests/*.test.cjs
```

当前整套自动化共 50 项；后端测试用临时真实 Git 仓库；HTTP 集成测试通过真实 loopback HTTP 请求验证 v7 片段保存、预览、正式版本、恢复及拒绝跨源访问。浏览器视觉、输入法与交互验证应参照后续实际浏览器报告，不能用 API 测试代替。

## 上线前还缺什么

此服务仅监听本机 127.0.0.1，无生产登录、角色和会话系统。不要直接暴露到公网，也不能仅加一个反向代理就当作认证完成。

正式版本目前只代表“服务器内容版本确认”，没有运行 VitePress 构建、部署正式站或同步 GitHub。线上发布需要独立构建检查与原子切换；GitHub 同步需要私有草稿排除、分叉/冲突处置和经授权的凭据。图片上传、格式编辑、公开贡献与审核留待下一阶段。

API、数据目录、恢复和故障边界见 server/API.md；发布前检查见 docs/RELEASE-GATES.md；与实际网站的边界见 docs/INTEGRATION-BOUNDARY.md。

## 放入现有先锋仓库

本目录可以整体作为 tools/admin-editor/ 新增，不改变现有站点构建或部署流程。独立 package.json 明确 CommonJS 浏览器逻辑测试边界，避免继承主仓库 type:module 导致测试加载错误；服务器仍用 .mjs。运行数据必须留在忽略目录或仓库外，不得推送私有草稿。这个原型默认不挂入公网导航，不自动启动服务。
