# DNS 解析与腾讯云部署线暂存记录（2026-09-18）

状态：等待刘老师在域名 DNS 管理面板完成解析变更；本文件记录当前决策，不在本轮继续操作腾讯云控制台。

## 当前目标

让 `wiki.agi-society.cn` 在浏览器地址栏中保持该域名，同时呈现 GitHub Pages 构建的知识库内容。当前 GitHub Pages 正式站点为：

`https://exomind-team.github.io/agi-society-cn/`

GitHub Pages 当前不设置自定义域名，避免再次形成 GitHub Pages 的 CNAME 重定向；腾讯云镜像 `120.53.232.88` 已验证能够通过纯 IP 和 Host 访问同一份静态站点。

## 待 DNS 操作者执行

1. 先确认 `agi-society.cn` 的权威 DNS 服务商；当前观测到的 NS 为 HiChina（`dns9.hichina.com`、`dns10.hichina.com`），因此只在实际权威面板中添加记录。
2. 将 `wiki.agi-society.cn` 指向腾讯云服务器 `120.53.232.88`。若采用 A 记录，记录名为 `wiki`；若后续要扩展子站点，再在同一权威面板增加 `*` 泛域名 A 记录指向同一 IP。
3. 暂不改动根域名 `@` 和 `www`，也不要把泛域名 CNAME 指向 GitHub Pages。

DNS 生效后，再分别验证：

- `wiki.agi-society.cn` 是否解析到 `120.53.232.88`；
- HTTP/HTTPS 是否由腾讯云 Nginx 正常响应；
- GitHub Pages 原地址是否仍保持 `exomind-team.github.io/agi-society-cn/`；
- GitHub Actions 是否仍能完成 Pages 部署和腾讯云受限镜像部署。

## 当前已验证的部署链路

```text
Obsidian 仓库提交
  -> GitHub Actions 构建
  -> GitHub Pages（主预览）
  -> 腾讯云静态镜像（国内访问入口，等待 DNS 切换）
```

腾讯云服务器到 GitHub、GitHub Pages 的双向网络实测和 GitHub Actions 到腾讯云的上传吞吐，详见：[腾讯云与 GitHub 双向网络基线](./tencent-cloud-network-baseline-2026-09-18.md)。

## 暂存结论

- DNS 解析线已经具备明确的操作方案，等待面板操作者反馈后再做切换验证。
- 服务器部署线已经可用，并已迁移到受限的新部署账号；旧 `wiki-deploy` 账号已删除。
- 内容迭代可以与 DNS 线并行，GitHub Pages 继续作为当前可直接预览的公开版本。
