// Controlled DOM tests: event/state logic only, not layout, focus, IME or browser evidence.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Core = require('../web/core.js');

class Element {
  constructor(id = '') {
    this.id = id;
    this.value = '';
    this.textContent = '';
    this.children = [];
    this.dataset = {};
    this.listeners = {};
    this.attributes = {};
    this.hidden = false;
    this.disabled = false;
    this.open = false;
    this.classList = {toggle() {}};
  }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  setAttribute(name, value) { this.attributes[name] = value; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  showModal() { this.open = true; }
  click() { if (!this.disabled) return this.onclick?.(); }
}
const settle = async () => {
  for (let n = 0; n < 5; n++) await new Promise(resolve => setImmediate(resolve));
};
async function host({readOnly = false, afterMutationReadFails = false} = {}) {
  const adapter = Core.createDemoAdapter();
  let failedRead = false, mutations = 0;
  const nodes = new Map();
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, new Element(id));
    return nodes.get(id);
  };
  const tabs = ['edit', 'changes', 'preview'].map(view => {
    const el = new Element();
    el.dataset.view = view;
    return el;
  });
  const document = {
    body: {dataset: {}},
    getElementById: node,
    createElement: () => new Element(),
    querySelectorAll: selector => selector === '[data-view]' ? tabs : node('pages').children,
    addEventListener(name, fn) { this[name] = fn; }
  };
  const fetch = async (url, options) => {
    try {
      if (url === '/api/pages') {
        return {ok: true, json: async () => ({...await adapter.list(), capabilities: {readOnly}})};
      }
      const {action, ...args} = JSON.parse(options.body);
      if (action === 'read' && failedRead) throw new Error('lost refresh');
      const data = await adapter.action(action, args);
      if (action === 'publish' || action === 'restore') {
        mutations++;
        failedRead = afterMutationReadFails;
      }
      return {ok: true, json: async () => data};
    } catch (e) {
      if (!e.status) throw e;
      return {ok: false, status: e.status, json: async () => ({error: {code: e.code, message: e.message}})};
    }
  };
  const context = {
    document, window: {addEventListener() {}}, EditorCore: Core,
    Blob, URL, setTimeout, fetch
  };
  // Ensure adapter closes over this injected transport, not Node's global fetch.
  context.EditorCore = {...Core, createHttpAdapter: () => Core.createHttpAdapter(fetch)};
  vm.runInNewContext(fs.readFileSync('web/app.js', 'utf8'), context);
  await settle();
  return {
    node, tabs, document, get mutations() { return mutations; },
    async input(text) { node('editor').value = text; node('editor').listeners.input(); await settle(); },
    async confirm() {
      node('dialog').returnValue = 'confirm';
      node('dialog').open = false;
      node('dialog').listeners.close();
      await settle();
    }
  };
}

test('actual app readonly capability keeps text viewing but disables mutations', async () => {
  const h = await host({readOnly: true});
  assert.equal(h.node('editor').disabled, true);
  assert.equal(h.node('save').disabled, true);
  assert.equal(h.node('publish').disabled, true);
  assert.match(h.node('state').textContent, /只读/);
});

test('actual app save then formal commit shows retained matching draft truthfully', async () => {
  const h = await host();
  await h.input('管理员修改后的正文。');
  await h.node('save').click();
  assert.equal(h.node('publish').disabled, false);
  h.node('publish').click();
  await h.confirm();
  assert.equal(h.mutations, 1);
  assert.match(h.node('state').textContent, /草稿与正式内容相同/);
  assert.match(h.node('notice').textContent, /网站尚未更新/);
  assert.equal(h.node('publish').disabled, true);
});

test('actual app preserves successful receipt on failed refresh and blocks duplicate commit', async () => {
  const h = await host({afterMutationReadFails: true});
  await h.input('管理员修改后的正文。');
  await h.node('save').click();
  h.node('publish').click();
  await h.confirm();
  assert.equal(h.mutations, 1);
  assert.match(h.node('notice').textContent, /正式内容版本已保存/);
  assert.match(h.node('notice').textContent, /版本凭据：2/);
  assert.equal(h.node('conflict').hidden, false);
  assert.equal(h.node('save').disabled, true);
  assert.equal(h.node('publish').disabled, true);
  await h.node('publish').click();
  assert.equal(h.mutations, 1);
});

test('actual app composition click save is ignored, normal save works afterwards', async () => {
  const h = await host();
  await h.input('正在输入');
  h.node('editor').listeners.compositionstart();
  await h.node('save').click();
  assert.match(h.node('state').textContent, /未保存/);
  h.node('editor').listeners.compositionend();
  await h.node('save').click();
  assert.match(h.node('state').textContent, /草稿已保存/);
});

test('actual app preview treats potentially executable strings as plain text', async () => {
  const h = await host();
  const text = '<img src=x onerror=alert(1)>{{danger}}';
  await h.input(text);
  h.tabs[2].click();
  assert.equal(h.node('preview').textContent, text);
  assert.equal(h.node('preview').children.length, 0);
});
