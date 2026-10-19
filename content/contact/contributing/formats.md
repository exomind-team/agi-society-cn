---
comments: true
---

# 编辑格式

[🔗Markdown 标准（英文）](https://commonmark.org/)

[🔗VitePress 官方文档](https://vitepress.dev/)

本 Wiki 在 VitePress 基础上集成了 [Nólëbase](https://nolebase.ayaka.io/) 与 [markdown-it-obsidian-callouts](https://github.com/ebullient/markdown-it-obsidian-callouts)，兼容 Obsidian 风格的 Callout 语法。

## 正文与页面组件的编辑边界

正文作者可以维护标题、段落、列表、引用、简单表格、代码围栏、外部链接及相对路径图片。图片需保留替代文字、来源和许可；frontmatter 的 title、order、comments 等字段保持原有类型。同名页面使用明确路径，修改后检查网站预览中的实际链接目标。

首页布局、交互组件、导航，以及独立 JSON 人物与资料数据由工程维护者修改。Obsidian 能打开这些源文件，不代表能直接所见即所得编辑组件，或无损还原整站布局。复杂 HTML/Vue、未知字段和未知块应原样保留，不能被编辑器静默删除。

目前未完成真实 Obsidian 编辑、重命名、移动附件后再发布的全流程验收；也未提供管理员在线可视化编辑器。后续先以同名链接、中文锚点、表格别名、图片、Callout 与未知块建立兼容样本，再验证网站与编辑器往返一致。管理员编辑计划将文案与受控布局分别建模，保存草稿、预览、审核发布及回退，不要求作者手改 Vue 或 JSON。

## 文件规范

> [!warning] 文件名规范
>
> ***所有 Markdown 文件，不论是否专名（如 "NARS"），文件名一律使用 snake_case 蛇形命名规范***
>
> - ⚠️实际网站运行中**区分大小写**，所以请务必确保文件名符合规范
>
> 在 Git 提交上，若需更改，编辑时请在 `.git/config` 中将 `core.ignorecase` 设置为 **`false`**
>
> ```bash
> git config --global core.ignorecase false
> ```
>
> > [!example] 专名亦要全小写
> >
> > ❌ `NARS.md`
> >
> > ✅ `nars.md`
>
> > [!example] 首字母亦要小写
> >
> > ❌ `Lazero.md`
> >
> > ✅ `lazero.md`
>
> > [!example] 下划线 `_` 而非短斜杠 `-`
> >
> > ❌ `web-arch.md`
> >
> > ✅ `web_arch.md`
>
> > [!example] 下划线分隔而非驼峰分隔
> >
> > ❌ `WebArch.md` `webArch.md`
> >
> > ✅ `web_arch.md`

## Callout 提示块

使用 Obsidian 风格的 Callout 语法，由 `markdown-it-obsidian-callouts` 渲染：

```markdown
> [!note] 标题
>
> 正文内容
```

### 支持的类型

以下 Callout 类型均有对应样式：

| 类型 | 用途 |
|------|------|
| `note` | 一般备注 |
| `info` | 补充信息 |
| `tip` | 操作技巧 |
| `success` | 成功/正确示范 |
| `question` | 提问/疑问 |
| `warning` | 警告/注意事项 |
| `danger` | 危险/严重警告 |
| `failure` | 失败/错误示范 |
| `bug` | 已知问题 |
| `example` | 示例说明 |
| `abstract` | 摘要/概述 |
| `quote` | 引用 |
| `todo` | 待办事项 |
| `important` | 重要 |
| `caution` | 谨慎 |
| `check` | 核对项 |
| `done` | 已完成 |
| `help` | 帮助 |
| `faq` | 常见问题 |
| `attention` | 注意 |

> [!note] 使用示例
>
> ````markdown
> > [!tip] 小技巧
> >
> > 在 VSCode 中按 `Ctrl+Shift+V` 可以预览 Markdown 渲染效果。
> ````
>
> 渲染效果：
>
> > [!tip] 小技巧
> >
> > 在 VSCode 中按 `Ctrl+Shift+V` 可以预览 Markdown 渲染效果。

### 可折叠 Callout

在类型后添加 `-`（默认折叠）或 `+`（默认展开）：

````markdown
> [!note]- 点击展开
>
> 这里的内容默认折叠
````

渲染效果：

> [!note]- 点击展开
>
> 这里的内容默认折叠

````markdown
> [!example]+ 默认展开
>
> 即使设置了 `+`，用户也可以手动折叠
````

### 嵌套 Callout

Callout 内可以嵌套其他 Callout，用于组织层级信息：

> [!warning]- 折叠块也能改变类型
>
> 我竟然被二向箔打了两遍
>
> > [!example]+ 强制不折叠
> >
> > 这不是套娃吗？

（2026-05-10 其它有待扩充）

## 数学公式

本 Wiki 支持 LaTeX 数学公式，由 MathJax 3 渲染：

```markdown
行内公式：$E = mc^2$

块级公式：
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

## 双向链接

Nólëbase 支持 Obsidian 风格的 `[[wikilinks]]` 双向链接：

```markdown
[[index|NARS 概述]]
```

这会在构建时自动转换为指向对应页面的链接，并生成反向链接关系。

## 代码块

始终标注代码块的语言类型：

````markdown
```python
def hello():
    print("Hello, AGI Society!")
```
````
