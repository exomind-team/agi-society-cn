# Gitea 中转部署记录（2026-09-19）

## 目标

把 GitHub Actions 构建出的腾讯云根路径静态产物先发布到 Gitea，再由腾讯云服务器主动拉取。这样大文件不再由 GitHub Runner 直接持续上传到国内服务器；当前 GitHub → 腾讯云的 SCP 仍保留为失败回退路径。

分支策略：`dev` 推送只更新 GitHub Pages 预览；只有 `main` 推送或从 `main` 手动触发 workflow 时，才发布 Gitea Release 并同步腾讯云。

## 当前链路

```text
main 推送
  -> GitHub Actions 构建三种站点产物
     - GitHub Pages: /agi-society-cn/
     - 腾讯云根路径: /
     - WordPress 子路径: /wiki/
  -> GitHub main/dev 源码同步到 Gitea
  -> main 额外创建 Gitea Release: deploy-<40 位 commit SHA>
     - wiki-mirror-<SHA>.tar.gz
     - wiki-wordpress-wiki-<SHA>.tar.gz
     - 两个对应的 .sha256 文件
  -> SSH 发送短命令 sync-gitea <SHA>
  -> 腾讯云从 Gitea 下载、校验 SHA256，并原子激活两个静态站目录
```

Gitea Release 只承载已构建产物；Gitea 的 `main`、`dev` 则作为 GitHub 的源码镜像，二者独立维护。

## 手动 SSH 授权边界

本地运维对话中的“ssh exe”专指使用 ssh-as-executable 构建的 exe，通过该 exe 的专用程序代理连接。除非维护者明确扩大授权，授权仅限所指单个任务、单次使用；不能推定为持续访问权限，也不能挪用于后续任务。

## 腾讯云公开根目录核验（2026-10-26）

`www.agi-society.cn` 的 Nginx vhost（`wordpress.local.conf`）实际以 `/var/www/agi-society-pioneer/current` 为站点根目录。仓库内 `ops/agi-wiki-deploy` 的 `activate` 命令目前只切换 `/var/www/agi-wiki/current`；这两个目录不是同一个站点根目录，因此部署 helper 报成功并不必然代表 `www` 已更新。

经维护者授权，本轮从已校验的 `/var/www/agi-wiki/releases/6ce495b9db48a72f4308aa40c90de7625e7c6e64` 将同版静态内容复制到 Pioneer release，并原子切换 `/var/www/agi-society-pioneer/current`。旧 release `b719c21c079f8f1c1026be209aac96206c67864` 保留；Nginx 配置未修改、服务未重载。公网核验确认修订标记匹配，贾敏、齐海滨和王涛人物页均返回 HTTP 200，人物名与预期来源链接存在。

**自动化缺口仍存在：** Gitea 拉取和 SCP 回退使用的服务器 `agi-wiki-deploy` 仍只激活 `agi-wiki` 根目录。后续要让常规 Tencent workflow 持续更新 `www`，需审阅并发布相应的部署 helper/workflow 改动；对服务器 helper 的生产配置写入需另有明确授权。本轮仅修复当前站点内容版本。

源码同步使用 Gitea 原生镜像接口 `POST /api/v1/repos/agiteam/agi-society-cn/mirror-sync`，而不是向镜像仓库执行 `git push`。这是必要的：该仓库在 Gitea 中被标记为只读镜像，直接 push 会得到 `mirror repository is read-only`；工作流触发同步后，会轮询并核验 Gitea 的 `main`、`dev` 提交哈希均与 GitHub 一致。

腾讯云 WordPress 站点通过 Nginx `/wiki/` 反向代理到本机 `127.0.0.1:8085`，后者读取 `/var/www/agi-wiki-wordpress/current`。专用 `/wiki/` 构建产物保证资源和内部链接继续带有 `/wiki/` 前缀。

内部代理的 `location /` 还会把带尾斜杠的平面页面路径内部重写为无尾斜杠形式，再按 `$uri.html` 查找文件；因此 `/wiki/conference/annual/2026` 与 `/wiki/conference/annual/2026/` 均可访问，且不会把内部主机名暴露给浏览器。该配置的服务器备份为 `/www/server/panel/vhost/nginx/agi-wiki-wordpress-subpath.conf.codex-20260919.bak`。

## 凭据边界

当前使用同一枚 Gitea 仓库读写 token，但使用位置分开：

- GitHub Actions Secret：`GITEA_CI_PUBLISH_TOKEN`，用于创建 Release、上传附件及清理旧部署 Release；
- 腾讯云：`/home/wiki-deploy-20260918-5f921eef/.config/agi-wiki/gitea-token`，权限 `0600`，仅受限部署用户读取；
- 仓库、组织、用户管理权限不需要开放。

token 不写入仓库、workflow 文件或普通日志。若将来 Gitea 支持更细粒度 token，应将 CI 发布和服务器读取拆为两个 token。

## 保留策略

发布脚本只匹配 `deploy-[0-9a-f]{40}`，最多保留最近 16 个部署 Release，并同步删除对应 tag。不会删除人工 Release、源码分支或其他 tag。

腾讯云当前部署脚本只保留最近 5 个已激活目录，作为更严格的本地磁盘保护。

## 回退策略

Gitea 发布失败、腾讯云拉取失败或 SHA256 校验失败时，GitHub Actions 回退到原有的 SCP 上传和 `activate` 流程。回退不会放宽 `wiki-deploy-20260918-5f921eef` 的强制命令权限。
