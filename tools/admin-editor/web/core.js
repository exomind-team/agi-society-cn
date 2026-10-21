(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EditorCore = api;
})(globalThis, function () {
  'use strict';
  const clone = x => JSON.parse(JSON.stringify(x));

  // A deliberately simple block comparison. The UI discloses this is not a minimal line diff.
  function changedLines(before, after) {
    const a = before.split('\n'), b = after.split('\n');
    let start = 0;
    while (start < a.length && start < b.length && a[start] === b[start]) start++;
    if (start === a.length && start === b.length) return [];
    let endA = a.length, endB = b.length;
    while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
      endA--;
      endB--;
    }
    return [
      ...a.slice(start, endA).map((text, i) => ({kind: 'removed', line: start + i + 1, text})),
      ...b.slice(start, endB).map((text, i) => ({kind: 'added', line: start + i + 1, text}))
    ];
  }

  function createHttpAdapter(fetcher = fetch) {
    return {
      async list() { return request('/api/pages'); },
      async action(action, args = {}) {
        return request('/api/action', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({action, ...args})
        });
      }
    };
    async function request(url, options) {
      const response = await fetcher(url, options);
      let data;
      try {
        data = await response.json();
      } catch {
        throw Object.assign(new Error('服务器返回了无法读取的结果，输入仍保留。'), {code: 'INVALID_RESPONSE'});
      }
      if (!response.ok) {
        const error = new Error(data.error?.message || '操作未完成，输入仍保留。');
        error.code = data.error?.code || 'REQUEST_FAILED';
        error.status = response.status;
        throw error;
      }
      return data;
    }
  }

  function createDemoAdapter() {
    let revision = 1, draftSeq = 0;
    const pages = [
      {id: 'wiki/about.md', title: '关于协会', content: '# 关于协会\n\n这是管理员编辑流程的示例内容，不是官网正式内容。\n\n我们连接通用人工智能研究者与实践者。\n'},
      {id: 'wiki/meeting.md', title: '学术活动', content: '# 学术活动\n\n在这里试写一则活动介绍。\n\n来源：https://www.agi-society.cn/\n'}
    ];
    const drafts = new Map(), versions = [];
    function snapshot(summary) {
      versions.unshift({revision: String(revision), summary, date: new Date().toISOString(),
        contents: Object.fromEntries(pages.map(p => [p.id, p.content]))});
    }
    snapshot('示例初始内容');
    const fail = (code, message) => { throw Object.assign(new Error(message), {code, status: 409}); };
    return {
      async list() {
        return {pages: pages.map(({id, title}) => ({id, title})), revision: String(revision)};
      },
      async action(action, args = {}) {
        if (action === 'syncStatus') return {state: 'disabled', reason: '演示内容仅保留在当前页面内，未连接服务器或外部托管。'};
        const p = pages.find(p => p.id === args.id);
        if (!p) throw Error('页面不存在');
        const draft = drafts.get(p.id);
        if (action === 'read') {
          const annotated = draft ? {...draft, status: draft.content === p.content ? 'matches-published' : 'draft', stale: draft.baseRevision !== String(revision)} : null;
          return clone({id: p.id, content: p.content, revision: String(revision), draft: annotated});
        }
        if (action === 'saveDraft') {
          if (args.baseRevision !== String(revision)) fail('CONFLICT', '正式内容已有更新，请先比较并重新保存。');
          if ((draft?.draftRevision || null) !== args.expectedDraftRevision) fail('DRAFT_CONFLICT', '草稿已有更新，请先查看最新版。');
          const value = {id: p.id, content: args.content, baseRevision: String(revision), draftRevision: String(++draftSeq)};
          drafts.set(p.id, value);
          return clone(value);
        }
        if (action === 'preview') {
          if (!draft) throw Error('请先保存草稿');
          return clone(draft);
        }
        if (action === 'history') return {versions: versions.map(({revision, summary, date}) => ({revision, summary, date}))};
        if (action === 'readVersion') {
          const v = versions.find(v => v.revision === args.targetRevision);
          if (!v) throw Error('版本不存在');
          return {content: v.contents[p.id], revision: v.revision};
        }
        if (action === 'publish') {
          if (args.expectedRevision !== String(revision)) fail('CONFLICT', '正式内容已有更新，尚未发布。');
          if (!draft || draft.draftRevision !== args.expectedDraftRevision) fail('DRAFT_CONFLICT', '草稿已有更新，尚未发布。');
          p.content = draft.content;
          revision++;
          snapshot('发布内容');
          return {revision: String(revision), publishedToWebsite: false, synced: false};
        }
        if (action === 'restore') {
          if (args.expectedRevision !== String(revision)) fail('CONFLICT', '正式内容已有更新，尚未恢复。');
          const v = versions.find(v => v.revision === args.targetRevision);
          if (!v) throw Error('版本不存在');
          p.content = v.contents[p.id];
          revision++;
          snapshot('恢复历史内容');
          return {revision: String(revision), publishedToWebsite: false, synced: false};
        }
        throw Error('不支持此操作');
      }
    };
  }

  class Session {
    constructor(adapter) {
      this.adapter = adapter;
      this.page = null;
      this.text = '';
      this.savedText = '';
      this.generation = 0;
      this.reconcileRequired = false;
      this.lastMutationResult = null;
      this.mutationOutcomeUnknown = false;
    }
    get dirty() { return this.text !== this.savedText; }
    assertWritable() {
      if (this.reconcileRequired) throw Object.assign(new Error('请先载入最新版确认写入结果，不要重复提交。'), {code: 'RECONCILE_REQUIRED'});
    }
    async load(id) {
      const gen = ++this.generation;
      const data = await this.adapter.action('read', {id});
      if (gen !== this.generation) return false;
      this.page = data;
      this.text = data.draft?.content ?? data.content;
      this.savedText = this.text;
      this.reconcileRequired = false;
      this.mutationOutcomeUnknown = false;
      return true;
    }
    async save() {
      this.assertWritable();
      if (!this.page) throw Error('请先选择页面');
      const captured = this.text, id = this.page.id, gen = this.generation;
      let result;
      try {
        result = await this.adapter.action('saveDraft', {
          id, content: captured, baseRevision: this.page.revision,
          expectedDraftRevision: this.page.draft?.draftRevision ?? null
        });
      } catch (error) {
        if (!error.status || error.status >= 500) {
          this.reconcileRequired = true;
          this.mutationOutcomeUnknown = true;
        }
        throw error;
      }
      if (gen !== this.generation) return false;
      this.page.draft = result;
      this.savedText = captured;
      return true;
    }
    async publish() {
      this.assertWritable();
      if (this.dirty) throw Error('请先保存当前修改，再发布。');
      if (!this.page?.draft) throw Error('没有待发布草稿');
      return this.adapter.action('publish', {
        id: this.page.id, expectedRevision: this.page.revision,
        expectedDraftRevision: this.page.draft.draftRevision
      });
    }
    async commitAndReload(mutation) {
      this.assertWritable();
      const id = this.page.id;
      let result;
      try {
        result = await mutation();
      } catch (error) {
        if (!error.status || error.status >= 500) {
          this.reconcileRequired = true;
          this.mutationOutcomeUnknown = true;
        }
        throw error;
      }
      this.lastMutationResult = result;
      this.reconcileRequired = true;
      this.mutationOutcomeUnknown = false;
      try {
        await this.load(id);
        return {result, refreshError: null};
      } catch (refreshError) {
        return {result, refreshError};
      }
    }
  }
  return {changedLines, createHttpAdapter, createDemoAdapter, Session};
});
