# 内容与代码维护细则

## Wikilink 编写规范

### 死命令

**Obsidian 中能正常打开的链接，部署到网站必须同样有效并能打开。**

### 命名原则

- **能不用路径就不用路径**：`[[ona|ONA]]` 而非 `[[impls/ona|ONA]]`
- 同名文件（如 `index.md` 有 29 个、`ona.md` 有 2 个）必须保留最小父目录前缀消歧义：`[[impls/ona|ONA]]`
- 跨目录引用父级：`[[../index|NARS]]`
- 全站统一使用 `[[wikilink]]`，**禁止**写 `[text](./path/to/file.md)` 形式的 Markdown 内链

### 表格内的 wikilink

表格中 `[[target|display]]` 的 `|` 会被 Markdown 解析为列分隔符，必须用反斜杠转义：

```markdown
| 届次 | 详情 |
|------|------|
| [[2016\|第一届]] | ... |
```

### 全站内链转换

- 所有指向 `.md` 文件的内链必须转为 `[[wikilink]]` 格式
- 外部链接（B站、GitHub、优酷）保持 `[text](url)` 不变
- 图片链接保持 `![alt](url)` 不变

---

## Patch 规范（node_modules 修补）

### 何时使用

依赖包的 Bug 或缺失功能影响业务需求，且不适合 fork/等上游修复时。

### TDD 流程

1. 写最小复现测试钉住问题（`temp/test-xxx.js`）
2. 修改 `node_modules` 中对应文件
3. 测试通过后，运行 `npx patch-package <package-name>` 生成 patch
4. `rm -rf node_modules && npm install` 验证 patch 自动生效（Unix 系列命令，无 Unix 环境则需使用等价命令）

### 共享逻辑提取

如果需要修改双入口包（`.cjs` + `.mjs`），将公共逻辑提取到一个 `.cjs` 文件，两个入口分别导入。**CJS 可以作为 CJS 和 ESM 的共同导入目标。**

### 配置

- `package.json` 的 `postinstall` 脚本已配置 `patch-package`，无需手动执行
- `patches/` 目录随仓库提交

---

## 链接与渲染

### 渲染异常诊断流程

Markdown → markdown-it 转译 → Vue 模板编译 → SSR → 客户端 hydration。每一层都可能出问题。

- 查看构建产物的 SSR HTML 确认组件是否正确渲染
- 查看编译后的 JS（`.lean.js`）确认 `resolveComponent` 调用
- 第三方包有 bug 时在 VitePress 配置层禁用，不直接改 `node_modules`（除 TDD patch 流程外）

### 脚本输出的 Markdown 必须构建验证

`vitepress build` 后检查表格渲染为 `<table>` / `<th>` / `<td>`（不是 `<p>` 内嵌 `|`）。

### 构建失败时优先清缓存

```bash
rm -rf dist .vitepress/cache node_modules/.vite
npx vitepress build
```

> 注：以上为 Unix 系列命令，无 Unix 环境则需使用等价命令。

---

## 内容补全

### 历史数据恢复三层策略

1. **Git 历史** — `git show <commit> -- <file>` 提取原始内容
2. **平台 API** — B站 `pagelist` 接口获取分P时间戳
3. **浏览器搜索** — web-access / CDP 搜索缺失条目

每层完成确认无遗漏后再进下一层。

### 中文语义分割—脚本初稿，人工校验

顿号 `、` 分隔的多人名、英文名、课题组名、"群体讨论"等非人名，脚本跑完必须人工复查。

---
