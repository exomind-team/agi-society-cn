import { validatePlainText, extractTextBlock, replaceTextBlock } from "./text-block.mjs";
import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { randomUUID, createHash } from "node:crypto";
class EditorError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
const fail = (code, message, status) => {
  throw new EditorError(code, message, status);
};
class ContentStore {
  constructor(root, { beforeAdvance } = {}) {
    this.root = path.resolve(root);
    this.repo = path.join(this.root, "content.git");
    this.private = path.join(this.root, "private-drafts");
    this.beforeAdvance = beforeAdvance;
  }
  git(args, input, env = {}) {
    return execFileSync("git", ["--git-dir", this.repo, "-c", "core.hooksPath=/dev/null", ...args], { input, encoding: "utf8", env: { ...process.env, ...env }, stdio: ["pipe", "pipe", "pipe"] }).trimEnd();
  }
  // 📌 Cooperating processes share this lock; update-ref below also guards external Git writers.
  // Cooperating processes share this lock; update-ref also guards external Git writers.
  async lock(fn) {
    await fs.mkdir(this.root, { recursive: true, mode: 448 });
    const dir = path.join(this.root, ".write-lock");
    try {
      await fs.mkdir(dir);
    } catch (e) {
      if (e.code === "EEXIST") fail("BUSY", "另一个保存正在进行，请稍后重试。", 409);
      throw e;
    }
    let result;
    let failure;
    try {
      result = await fn();
    } catch (error) {
      failure = error;
    }
    try {
      await fs.rmdir(dir);
    } catch (cleanupError) {
      // Do not turn an already committed operation into a false "nothing saved" report.
      if (failure) failure.cleanupError = cleanupError;
      else result = {...result, maintenanceWarning: "操作已完成，但写入锁清理失败，请维护者检查后再继续写入。"};
      console.error("Editor write-lock cleanup failed", cleanupError);
    }
    if (failure) throw failure;
    return result;
  }
  async initialize(pages, mappings = {}) {
    return this.lock(async () => {
      try {
        await fs.access(path.join(this.root, "manifest.json"));
        fail("EXISTS", "内容库已存在。", 409);
      } catch (e) {
        if (e.code !== "ENOENT") throw e;
      }
      if ((await fs.readdir(this.root)).some((name) => name !== ".write-lock")) fail("INCOMPLETE_STORE", "数据目录非空；请检查已有或未完成的初始化，不会覆盖。", 409);
      const manifest = Object.entries(pages).map(([id, content]) => {
        this.validateId(id);
        const mapping = mappings[id];
        if (mapping?.block) this.validateEditable(this.editableText(content, mapping), mapping);
        else this.validateContent(content);
        return { ...mapping, id, title: mapping?.title ?? id.replace(/^content\//, "").replace(/\.md$/, "") };
      });
      if (!manifest.length) fail("EMPTY", "至少需要一个页面。");
      await fs.mkdir(this.private, { recursive: true, mode: 448 });
      await fs.mkdir(this.repo, { recursive: true });
      execFileSync("git", ["init", "--bare", this.repo], { stdio: "pipe" });
      const index = path.join(this.root, `index-${randomUUID()}`);
      const env = { GIT_INDEX_FILE: index };
      try {
        this.git(["read-tree", "--empty"], void 0, env);
        for (const { id } of manifest) {
          const blob = this.git(["hash-object", "-w", "--stdin"], pages[id]);
          this.git(["update-index", "--add", "--cacheinfo", "100644", blob, id], void 0, env);
        }
        const tree = this.git(["write-tree"], void 0, env);
        const commit = this.commit(tree, null, "初始化内容版本");
        this.git(["update-ref", "refs/heads/published", commit]);
        await this.atomic(path.join(this.root, "manifest.json"), JSON.stringify(manifest));
        return { revision: commit };
      } finally {
        await fs.rm(index, { force: true }).catch(error => console.error("Temporary index cleanup failed", error));
      }
    });
  }
  validateId(id) {
    if (typeof id !== "string" || !/^content\/(?:[a-zA-Z0-9_-]+\/)+[a-zA-Z0-9_-]+\.md$/.test(id)) fail("INVALID_PAGE", "页面不在允许编辑的目录中。");
  }
  validateContent(content) {
    if (typeof content !== "string" || content.includes("\0")) fail("INVALID_CONTENT", "需要有效文字内容。");
    if (/<|>|\{\{|\}\}|^\s*(?:import|export)\s|^---\s*$/m.test(content)) fail("UNSAFE_CONTENT", "本阶段仅开放文字及基础 Markdown；HTML、脚本、Vue 表达式及页面配置需由维护者处理。");
  }
  async allowed(id) {
    this.validateId(id);
    const rows = JSON.parse(await fs.readFile(path.join(this.root, "manifest.json"), "utf8"));
    const page = rows.find((p) => p.id === id);
    if (!page) fail("UNKNOWN_PAGE", "该页面尚未开放在线编辑。", 404);
    return page;
  }
  editableText(source, page) {
    if (!page.block) return source;
    try {
      return extractTextBlock(source, page.block);
    } catch (error) {
      fail("STRUCTURE_CHANGED", error.message, 409);
    }
  }
  validateEditable(content, page) {
    if (!page.block) return this.validateContent(content);
    try {
      validatePlainText(content);
    } catch (error) {
      fail("UNSAFE_CONTENT", error.message);
    }
  }
  head() {
    return this.git(["rev-parse", "refs/heads/published"]);
  }
  text(id, revision = this.head()) {
    if (!/^[a-f0-9]{40}$/.test(revision)) fail("INVALID_VERSION", "版本标识无效。");
    try {
      return execFileSync("git", ["--git-dir", this.repo, "show", `${revision}:${id}`], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
    } catch {
      fail("UNKNOWN_VERSION", "找不到该页面版本。", 404);
    }
  }
  draftPath(id) {
    return path.join(this.private, createHash("sha256").update(id).digest("hex") + ".json");
  }
  async draft(id) {
    try {
      return JSON.parse(await fs.readFile(this.draftPath(id), "utf8"));
    } catch (e) {
      if (e.code === "ENOENT") return null;
      throw e;
    }
  }
  async atomic(file, data) {
    const temp = file + "." + randomUUID() + ".tmp";
    try {
      await fs.writeFile(temp, data, { flag: "wx", mode: 384 });
      await fs.rename(temp, file);
    } finally {
      await fs.rm(temp, { force: true }).catch(error => console.error("Temporary draft cleanup failed", error));
    }
  }
  commit(tree, parent, summary) {
    return this.git(["commit-tree", tree, ...parent ? ["-p", parent] : [], "-m", summary], void 0, { GIT_AUTHOR_NAME: "Local administrator prototype", GIT_AUTHOR_EMAIL: "prototype@localhost", GIT_COMMITTER_NAME: "Local administrator prototype", GIT_COMMITTER_EMAIL: "prototype@localhost" });
  }
  async list() {
    return { pages: JSON.parse(await fs.readFile(path.join(this.root, "manifest.json"), "utf8")).map(({ id, title, format }) => ({ id, title, format: format ?? "plain-text-demo" })), revision: this.head() };
  }
  async read({ id }) {
    const page = await this.allowed(id);
    const revision = this.head();
    const content = this.editableText(this.text(id, revision), page);
    const draft = await this.draft(id);
    return { id, content, revision, draft: draft ? { ...draft, status: draft.content === content ? "matches-published" : "draft", stale: draft.baseRevision !== revision } : null };
  }
  async saveDraft({ id, content, baseRevision, expectedDraftRevision }) {
    return this.lock(async () => {
      const page = await this.allowed(id);
      this.validateEditable(content, page);
      this.editableText(this.text(id), page);
      if (baseRevision !== this.head()) fail("VERSION_CONFLICT", "正式内容已更新，请先比较新版，草稿未覆盖。", 409);
      const old = await this.draft(id);
      if (expectedDraftRevision !== (old?.draftRevision ?? null)) fail("DRAFT_CONFLICT", "草稿已被修改，请先读取最新草稿。", 409);
      const draft = { id, content, baseRevision, draftRevision: randomUUID(), updatedAt: (new Date()).toISOString() };
      await this.atomic(this.draftPath(id), JSON.stringify(draft));
      return draft;
    });
  }
  async preview({ id }) {
    await this.allowed(id);
    const draft = await this.draft(id);
    if (!draft) fail("NO_DRAFT", "尚无已保存草稿。", 404);
    return { ...draft, format: "plain-text", published: false };
  }
  // 📌 Prepared Git objects are not visible versions until one compare-and-swap ref update.
  // Website build/deploy is deliberately outside this local content-approval operation.
  // Prepared objects become visible only at the compare-and-swap ref update.
  // This approves local content, not a website build or deployment.
  async advance(id, content, expectedRevision, summary) {
    if (expectedRevision !== this.head()) fail("VERSION_CONFLICT", "正式内容已更新，未发布此次修改。", 409);
    const page = await this.allowed(id);
    this.validateEditable(content, page);
    const previousSource = this.text(id, expectedRevision);
    this.editableText(previousSource, page);
    const source = page.block ? replaceTextBlock({ source: previousSource, block: page.block, text: content }) : content;
    const index = path.join(this.root, `index-${randomUUID()}`);
    const env = { GIT_INDEX_FILE: index };
    try {
      this.git(["read-tree", expectedRevision], void 0, env);
      const blob = this.git(["hash-object", "-w", "--stdin"], source);
      this.git(["update-index", "--cacheinfo", "100644", blob, id], void 0, env);
      const tree = this.git(["write-tree"], void 0, env);
      const revision = this.commit(tree, expectedRevision, summary);
      if (this.beforeAdvance) await this.beforeAdvance();
      try {
        this.git(["update-ref", "refs/heads/published", revision, expectedRevision]);
      } catch {
        fail("VERSION_CONFLICT", "版本已变化，未覆盖他人修改。", 409);
      }
      return { revision, publishedToWebsite: false, synced: false };
    } finally {
      await fs.rm(index, { force: true }).catch(error => console.error("Temporary index cleanup failed", error));
    }
  }
  async publish({ id, expectedRevision, expectedDraftRevision }) {
    return this.lock(async () => {
      await this.allowed(id);
      const draft = await this.draft(id);
      if (!draft) fail("NO_DRAFT", "尚无草稿。", 404);
      if (draft.draftRevision !== expectedDraftRevision) fail("DRAFT_CONFLICT", "草稿已变化，请重新检查。", 409);
      if (draft.baseRevision !== expectedRevision) fail("VERSION_CONFLICT", "草稿基于其他版本。", 409);
      const result = await this.advance(id, draft.content, expectedRevision, `发布文字：${id}`);
      // Retention avoids post-commit cleanup failure being misreported as no publication.
      return { ...result, draftRetained: true };
    });
  }
  async history({ id }) {
    await this.allowed(id);
    const lines = this.git(["log", "refs/heads/published", "--format=%H%x09%cI%x09%s", "--", id]);
    return { versions: lines ? lines.split("\n").map((l) => {
      const [revision, date, ...summary] = l.split("	");
      return { revision, date, summary: summary.join("	") };
    }) : [] };
  }
  async readVersion({ id, targetRevision }) {
    await this.allowed(id);
    if (!/^[a-f0-9]{40}$/.test(targetRevision)) fail("INVALID_VERSION", "版本标识无效。");
    try {
      this.git(["merge-base", "--is-ancestor", targetRevision, this.head()]);
    } catch {
      fail("UNKNOWN_VERSION", "只能读取正式历史中的版本。", 404);
    }
    return { id, content: this.editableText(this.text(id, targetRevision), await this.allowed(id)), revision: targetRevision };
  }
  async restore({ id, targetRevision, expectedRevision }) {
    return this.lock(async () => {
      await this.allowed(id);
      if (!/^[a-f0-9]{40}$/.test(targetRevision)) fail("INVALID_VERSION", "版本标识无效。");
      try {
        this.git(["merge-base", "--is-ancestor", targetRevision, this.head()]);
      } catch {
        fail("UNKNOWN_VERSION", "只能恢复正式历史中的版本。", 404);
      }
      return this.advance(id, this.editableText(this.text(id, targetRevision), await this.allowed(id)), expectedRevision, `恢复页面历史：${id}`);
    });
  }
  // ⚠️ No remote adapter is configured; this is not an implicit GitHub push.
  // No remote adapter is configured: a save or local publication never pushes GitHub.
  async syncStatus() {
    return { state: "disabled", reason: "原型未配置公开托管同步；保存草稿、发布本地版本均不会推送。", localRevision: this.head(), lastSyncedRevision: null };
  }
}
export {
  ContentStore,
  EditorError
};
