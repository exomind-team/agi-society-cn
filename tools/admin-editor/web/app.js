(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const demo = document.body.dataset.demo === 'true';
  const C = EditorCore;
  const adapter = demo ? C.createDemoAdapter() : C.createHttpAdapter();
  const session = new C.Session(adapter);
  let pages = [];
  let view = 'edit';
  let operation = false;
  let composing = false;
  let readOnly = false;
  let dialogAction = null;

  $('demo-banner').hidden = !demo;
  $('mode').textContent = demo ? '离线交互演示' : '本机内容服务 · 非生产后台';

  function notice(text, error = false) {
    $('notice').textContent = text;
    $('notice').classList.toggle('error', error);
    $('notice').hidden = !text;
  }

  function fail(error) {
    notice(session.mutationOutcomeUnknown
      ? '未能确认写入结果。输入仍保留；请先载入最新版核对，不要重复提交。'
      : (error.message || '操作未完成，输入仍保留。'), true);
    if (error.status === 409 || /CONFLICT/.test(error.code || '') || session.reconcileRequired) {
      $('conflict').hidden = false;
    }
  }

  function update() {
    const p = session.page;
    const dirty = session.dirty;
    const sameAsPublished = p?.draft && p.draft.content === p.content;
    let state = '当前为正式版本';
    if (p?.draft && !sameAsPublished) state = '草稿已保存，尚未成为正式版本';
    if (p?.draft && sameAsPublished) state = '草稿与正式内容相同';
    if (p?.draft?.stale && !sameAsPublished) state = '草稿基于旧版本，请查看变化后重新保存';
    if (dirty) state = '有未保存修改';
    if (readOnly) state = '只读服务 · 可以查看，不能保存';
    if (session.reconcileRequired) state = '已完成写入，待读取确认；暂不重复提交';
    if (session.mutationOutcomeUnknown) state = '写入结果未确认，请先载入最新版';
    if (operation) state = '正在处理…';
    $('state').textContent = p ? state : '载入内容后即可开始。';
    const locked = operation || readOnly || session.reconcileRequired;
    $('save').disabled = !p || locked || (!dirty && !(p?.draft?.stale && !sameAsPublished));
    $('publish').disabled = !p?.draft || dirty || locked || sameAsPublished;
    $('editor').disabled = !p || operation || readOnly;
    $('counts').textContent = Array.from(session.text).length.toLocaleString() + ' 字';
    $('history').disabled = !p || operation;
    document.querySelectorAll('.page-button').forEach(b => b.disabled = operation);
    const diff = p ? C.changedLines(p.content, session.text) : [];
    $('change-count').textContent = diff.length ? String(diff.length) : '';
    if (view === 'changes') renderDiff(diff);
    if (view === 'preview') $('preview').textContent = session.text;
  }

  function renderDiff(rows) {
    $('diff').replaceChildren();
    if (!rows.length) {
      const p = document.createElement('p');
      p.className = 'empty';
      p.textContent = '与正式内容相同。';
      $('diff').append(p);
      return;
    }
    for (const row of rows) {
      const el = document.createElement('div');
      el.className = 'diff-row ' + row.kind;
      const label = document.createElement('span');
      label.className = 'diff-label';
      label.textContent = (row.kind === 'added' ? '+ 新增' : '− 删除') + ' ' + row.line;
      const text = document.createElement('span');
      text.className = 'diff-text';
      text.textContent = row.text || ' ';
      el.append(label, text);
      $('diff').append(el);
    }
  }

  function renderPages() {
    const query = $('search').value.trim().toLocaleLowerCase();
    $('pages').replaceChildren();
    for (const p of pages.filter(p => p.title.toLocaleLowerCase().includes(query))) {
      const b = document.createElement('button');
      b.className = 'page-button';
      b.textContent = p.title;
      b.setAttribute('aria-current', session.page?.id === p.id ? 'page' : 'false');
      b.disabled = operation;
      b.onclick = () => select(p.id);
      $('pages').append(b);
    }
    if (!$('pages').children.length) {
      const p = document.createElement('p');
      p.textContent = '没有匹配页面';
      p.className = 'empty';
      $('pages').append(p);
    }
  }

  async function run(fn) {
    if (operation) return;
    operation = true;
    update();
    try {
      await fn();
    } catch (error) {
      fail(error);
    } finally {
      operation = false;
      update();
    }
  }

  function showDialog(title, body, confirmLabel, action) {
    $('dialog-title').textContent = title;
    $('dialog-body').replaceChildren();
    if (typeof body === 'string') {
      const p = document.createElement('p');
      p.textContent = body;
      $('dialog-body').append(p);
    } else {
      $('dialog-body').append(body);
    }
    $('dialog-confirm').hidden = !confirmLabel;
    $('dialog-confirm').textContent = confirmLabel || '确认';
    dialogAction = action || null;
    $('dialog').returnValue = '';
    if (!$('dialog').open) $('dialog').showModal();
  }

  $('dialog').addEventListener('close', () => {
    const action = dialogAction;
    dialogAction = null;
    if ($('dialog').returnValue === 'confirm' && action) action();
  });

  async function load(id) {
    await run(async () => {
      if (await session.load(id)) {
        $('title').textContent = pages.find(p => p.id === id)?.title || '正文';
        $('editor').value = session.text;
        $('conflict').hidden = true;
        session.reconcileRequired = false;
        notice('');
        renderPages();
      }
    });
  }

  function select(id) {
    if (operation || id === session.page?.id) return;
    if (session.dirty) {
      showDialog('切换页面？',
        '当前文字尚未保存。返回并保存草稿，或确认放弃这次未保存的修改。',
        '放弃修改并切换', () => load(id));
    } else {
      load(id);
    }
  }

  $('search').addEventListener('input', renderPages);
  $('editor').addEventListener('input', () => {
    session.text = $('editor').value;
    update();
  });
  $('editor').addEventListener('compositionstart', () => composing = true);
  $('editor').addEventListener('compositionend', () => composing = false);

  async function save() {
    const stale = session.page?.draft?.stale === true;
    if ((!session.dirty && !stale) || !session.page || readOnly || session.reconcileRequired || composing) return;
    const write = () => run(async () => {
      await session.save();
      $('conflict').hidden = true;
      notice(demo ? '示例草稿已保存到当前页面内，刷新即重置。'
        : '草稿已保存到本机内容服务，未成为正式版本，也未对外同步。');
    });
    if (stale) {
      showDialog('以当前正式版本重新保存草稿？',
        '正式内容已在其他编辑中发生变化。请先查看变化，确认你的文字仍然适用。这次保存只更新草稿，不覆盖正式内容。',
        '重新保存草稿', write);
    } else {
      await write();
    }
  }
  $('save').onclick = save;

  async function mutateThenRead(mutation, successMessage) {
    const outcome = await session.commitAndReload(mutation);
    if (outcome.refreshError) {
      $('conflict').hidden = false;
      const revision = outcome.result?.revision;
      notice(successMessage + (revision ? ' 版本凭据：' + revision + '。' : '')
        + ' 但读取最新内容失败；请勿重复提交，保留当前文字并载入最新版。', true);
    } else {
      $('editor').value = session.text;
      $('conflict').hidden = true;
      notice(successMessage);
    }
    return outcome.result;
  }

  $('publish').onclick = () => {
    if (readOnly || session.reconcileRequired || composing) return;
    showDialog('确认成为正式版本？',
      demo ? '这只会更新演示内的正式内容，不会修改任何网站。'
        : '这会把已保存草稿写入服务器内容仓库的正式版本。本原型尚未连接网站构建和上线流程，也不会同步到公开托管平台。',
      '确认正式版本', () => run(() => mutateThenRead(
        () => session.publish(),
        demo ? '演示内正式版本已更新，未修改官网。'
          : '正式内容版本已保存；网站尚未更新，对外同步尚未执行。'
      )));
  };

  for (const b of document.querySelectorAll('[data-view]')) {
    b.onclick = () => {
      view = b.dataset.view;
      document.querySelectorAll('[data-view]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      for (const v of ['edit', 'changes', 'preview']) $(v + '-panel').hidden = v !== view;
      update();
    };
  }

  function download() {
    const blob = new Blob([session.text], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '未保存的正文.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  $('download-local').onclick = download;
  $('reload').onclick = () => showDialog('载入服务器最新版？',
    '此操作会替换编辑框中的文字。请先下载当前文字留作对照；服务器上的草稿不会被本次读取覆盖。',
    '载入最新版', () => load(session.page.id));

  $('sync').onclick = () => run(async () => {
    const data = await adapter.action('syncStatus');
    showDialog('对外同步', data.state === 'disabled'
      ? '尚未启用。' + (data.reason || '')
      : '当前状态：' + data.state + '。此处不等同于官网已上线。');
  });
  $('help').onclick = () => showDialog('先保存，再确认正式版本',
    '保存草稿不会公开内容。“查看变化”用 + / − 展示与正式内容的不同。“确认正式版本”只写入本机内容仓库，本原型不执行网站上线或对外同步。文字预览不执行页面代码。键盘可用 Ctrl / ⌘ + S 保存。');

  async function showVersion(id, version) {
    await run(async () => {
      const result = await adapter.action('readVersion', {id, targetRevision: version.revision});
      const contents = document.createElement('div');
      const note = document.createElement('p');
      const pre = document.createElement('pre');
      note.textContent = '恢复会创建新的正式版本，不删除历史。不会上线或对外同步；已有草稿可能需要重新比较。';
      pre.className = 'historical-text';
      pre.textContent = result.content;
      contents.append(note, pre);
      showDialog('历史内容预览', contents, readOnly || session.reconcileRequired ? null : '恢复为正式版本', () => {
        if (session.dirty) {
          notice('当前仍有未保存修改，请先保存或下载，再进行版本恢复。', true);
          return;
        }
        run(() => mutateThenRead(
          () => adapter.action('restore', {
            id,
            targetRevision: version.revision,
            expectedRevision: session.page.revision
          }),
          '已创建恢复版本；网站尚未更新，对外同步尚未执行。'
        ));
      });
    });
  }

  $('history').onclick = () => run(async () => {
    const id = session.page.id;
    const result = await adapter.action('history', {id});
    const box = document.createElement('div');
    for (const v of result.versions) {
      const row = document.createElement('div');
      row.className = 'version-row';
      const text = document.createElement('div');
      text.textContent = v.summary || '内容更新';
      const date = document.createElement('small');
      date.textContent = new Date(v.date).toLocaleString();
      text.append(date);
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = '查看此版本';
      b.onclick = () => showVersion(id, v);
      row.append(text, b);
      box.append(row);
    }
    if (!result.versions.length) box.textContent = '暂无历史版本';
    showDialog('历史版本', box);
  });

  document.addEventListener('keydown', e => {
    if (e.defaultPrevented || composing || e.isComposing || e.altKey || e.repeat || $('dialog').open) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && session.page) {
      e.preventDefault();
      save();
    }
  });
  window.addEventListener('beforeunload', e => {
    if (session.dirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  run(async () => {
    const result = await adapter.list();
    readOnly = result.capabilities?.readOnly === true;
    pages = result.pages;
    renderPages();
    if (pages.length) {
      await session.load(pages[0].id);
      $('title').textContent = pages[0].title;
      $('editor').value = session.text;
      renderPages();
    } else {
      notice('当前没有允许编辑的页面。');
    }
  });
})();
