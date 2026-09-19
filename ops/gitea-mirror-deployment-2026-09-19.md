# Gitea 中转部署记录（2026-09-19）

## 目标

把 GitHub Actions 构建出的腾讯云根路径静态产物先发布到 Gitea，再由腾讯云服务器主动拉取。这样大文件不再由 GitHub Runner 直接持续上传到国内服务器；当前 GitHub → 腾讯云的 SCP 仍保留为失败回退路径。

分支策略：`dev` 推送只更新 GitHub Pages 预览；只有 `main` 推送或从 `main` 手动触发 workflow 时，才发布 Gitea Release 并同步腾讯云。

## 当前链路

```text
main 推送
  -> GitHub Actions 构建 dist-mirror
  -> Gitea Release: deploy-<40 位 commit SHA>
     - wiki-mirror-<SHA>.tar.gz
     - wiki-mirror-<SHA>.tar.gz.sha256
  -> SSH 发送短命令 sync-gitea <SHA>
  -> 腾讯云从 Gitea 下载并校验 SHA256
  -> /var/www/agi-wiki 原子激活
```

Gitea Release 只承载已构建产物，不作为源码分支的替代品。Gitea 源码镜像同步与生产静态产物发布可以独立维护。

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
