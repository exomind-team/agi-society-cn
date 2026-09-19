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
