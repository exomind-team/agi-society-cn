# 腾讯云与 GitHub 双向网络基线（2026-09-18）

本记录用于判断部署链路的瓶颈究竟来自哪一个方向：

```text
GitHub Actions ──跨境链路──> 腾讯云 120.53.232.88
腾讯云 120.53.232.88 ──跨境链路──> GitHub / GitHub Pages
```

## 腾讯云 → GitHub

测试主机：`VM-0-7-opencloudos`（腾讯云公网 IP `120.53.232.88`）

测试时间：2026-09-18 13:31（Asia/Shanghai）

| 目标 | DNS/连接结果 | 观测值 |
| --- | --- | --- |
| `github.com` | HTTPS 200 | TCP 0.124 s；TLS 0.253 s；TTFB 1.218 s；总计 10.481 s；下载 311,036 B |
| `raw.githubusercontent.com` | HTTPS 200 | TCP 0.219 s；TLS 0.461 s；总计 1.128 s；下载 4,223 B |
| `api.github.com` | HTTPS 200 | TCP 0.135 s；TLS 0.817 s；TTFB 1.468 s；总计 1.999 s；下载 7,163 B |
| `exomind-team.github.io/agi-society-cn/` | HTTPS 200 | TCP 0.205 s；TLS 0.670 s；TTFB 0.876 s；总计 1.413 s；下载 41,860 B |
| `git ls-remote` | 成功 | 能读取 `main` 分支，返回提交 `7e4b84b...` |
| `ping github.com` | 成功 | 4/4，0% 丢包，平均 RTT 132.039 ms |

补充：`wiki.agi-society.cn` 当时 HTTPS 连接失败（curl 状态 000）。这不是 GitHub 链路问题，而是该域名仍沿用旧 DNS/旧服务器链路，后续要单独修复 DNS 或镜像域名配置。

## GitHub Actions → 腾讯云

此前成功运行：`35308649662`，提交 `a317dba`。

- 服务器在 12:53:46 接收到来自 `48.211.210.112` 的 `wiki-deploy` 公钥登录；该地址属于 GitHub Actions 地址段。
- 17,233,920 B 的归档在约 19 分 33 秒后完成部署，按整个上传到作业完成时间估算约为 14.7 KB/s。
- 这条链路明显慢于腾讯云 → GitHub Pages 的普通 HTTPS 请求，说明当前主要瓶颈在 GitHub Actions Runner 到腾讯云的文件上传方向。
- 该估算不是精确 SCP 计时；后续工作流已增加 HTTP 探测、SCP 开始/结束时间、字节数和实际 bytes/s 输出，以获得可比较的精确数据。

## 初步结论

目前不能简单地说“GitHub 或腾讯云单方面不可用”：

1. 腾讯云访问 GitHub、GitHub API、GitHub Pages 和 Git 协议均可用，延迟尚可；
2. GitHub Actions 访问腾讯云也可建立 SSH 并完成部署，但大文件上传速度很低；
3. 当前架构把“用户访问 GitHub Pages 的困难”置换成了“GitHub Actions 向腾讯云上传的慢链路”，但腾讯云镜像方案仍能工作；
4. 如果未来构建包继续增大，应优先考虑 Gitee/国内对象存储中转、腾讯云内拉取，或在腾讯云部署自托管 Runner，避免每次由 GitHub Runner 直接推送 17 MB 以上文件。

## 后续每次部署应记录

- GitHub Actions Run ID、提交号、构建包字节数；
- Runner → 腾讯云的 HTTP 探测时间；
- SCP 开始时间、结束时间、总秒数和 bytes/s；
- 腾讯云端 `git ls-remote`、GitHub Pages HTTPS 和 DNS 结果；
- 若失败，区分 DNS、TCP/SSH 建连、文件上传、远端解包、Nginx 激活五个阶段。
