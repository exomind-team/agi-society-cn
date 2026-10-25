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
  let reviewWorkflow = false;
  let reviewRole = 'editor';
  let dialogAction = null;
  const dialogForm = $('dialog').querySelector('form');

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
    const draft = p?.draft;
    const reviewStatus = draft?.reviewStatus || 'draft';
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
    const canEdit = !reviewWorkflow || reviewRole === 'editor';
    $('review-simulation').hidden = !reviewWorkflow;
    $('review-role').value = reviewRole;
    $('review-status').textContent = !draft ? '先保存草稿，再提交审核。'
      : reviewStatus === 'in-review' && draft.stale ? '待审核草稿基于旧正式版本；编辑者需先比较并保存新修订。'
        : reviewStatus === 'in-review' ? `待审核修订 ${String(draft.reviewRevision || '').slice(0, 8)}；提交后修改草稿会使本次审核失效。`
          : reviewStatus === 'approved' && sameAsPublished && draft.baseRevision !== p.revision ? `已批准修订 ${String(draft.reviewRevision || '').slice(0, 8)} 已写入本地正式版本；网站未更新。`
            : reviewStatus === 'approved' && sameAsPublished ? '批准的草稿与当前正式内容相同，无需重复写入。'
              : reviewStatus === 'approved' ? `修订 ${String(draft.reviewRevision || '').slice(0, 8)} 已由模拟审核员批准，可确认写入本地正式版本。`
                : reviewStatus === 'returned' ? `已退回修改：${draft.reviewReason || '请修订后重新提交。'}`
                  : '草稿尚未提交审核。该状态流程仅用于本机体验，不代表真实人员身份。';
    const eventLabels = { 'draft-saved': '保存新草稿', submitted: '提交审核', approved: '模拟批准', returned: '模拟退回' };
    const reviewEvents = Array.isArray(draft?.reviewEvents) ? draft.reviewEvents.slice(-8).reverse() : [];
    $('review-events').replaceChildren();
    for (const event of reviewEvents) {
      const item = document.createElement('li');
      const date = new Date(event.at);
      const timestamp = Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
      item.textContent = `${timestamp} · ${eventLabels[event.action] || '审核状态更新'} · ${String(event.draftRevision || '').slice(0, 8)}${event.reason ? ' · ' + event.reason : ''}`;
      $('review-events').append(item);
    }
    $('review-submit').hidden = !reviewWorkflow || reviewRole !== 'editor';
    $('review-submit').disabled = !draft || draft.stale || dirty || locked || reviewStatus === 'in-review' || reviewStatus === 'approved' || (reviewStatus === 'returned' && draft.reviewRevision === draft.draftRevision);
    const canDecide = reviewWorkflow && reviewRole === 'reviewer' && reviewStatus === 'in-review' && !draft?.stale;
    $('review-approve').hidden = !canDecide;
    $('review-return').hidden = !canDecide;
    $('review-approve').disabled = locked;
    $('review-return').disabled = locked;
    $('save').disabled = !p || locked || !canEdit || (!dirty && !(p?.draft?.stale && !sameAsPublished));
    $('publish').disabled = !p?.draft || dirty || locked || sameAsPublished || !canEdit || (reviewWorkflow && reviewStatus !== 'approved');
    $('publish').textContent = reviewWorkflow ? '确认本地正式版本…' : '确认正式版本…';
    $('editor').disabled = !p || operation || readOnly || !canEdit;
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

  dialogForm.addEventListener('submit', event => {
    const action = dialogAction;
    dialogAction = null;
    if (event.submitter?.value !== 'confirm' || !action) return;
    event.preventDefault();
    $('dialog').close('confirm');
    action();
  });
  $('dialog').addEventListener('cancel', () => { dialogAction = null; });

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
    const reviewInvalidated = reviewWorkflow && ['in-review', 'approved'].includes(session.page?.draft?.reviewStatus);
    if (stale || reviewInvalidated) {
      const title = stale ? '以当前正式版本重新保存草稿？' : '修改会使当前审核失效';
      const message = stale
        ? '正式内容已在其他编辑中发生变化。请先查看变化，确认你的文字仍然适用。这次保存只更新草稿，不覆盖正式内容。'
        : '保存会创建新的草稿修订，并撤回待审核或已批准状态。之后需要重新提交审核。';
      showDialog(title, message, stale ? '重新保存草稿' : '保存新修订', write);
    } else {
      await write();
    }
  }
  $('save').onclick = save;

  $('review-role').addEventListener('change', () => {
    const nextRole = $('review-role').value === 'reviewer' ? 'reviewer' : 'editor';
    if (session.dirty && nextRole !== reviewRole) {
      $('review-role').value = reviewRole;
      notice('请先保存草稿或下载当前文字，再切换本机模拟角色。', true);
      return;
    }
    reviewRole = nextRole;
    update();
  });

  $('review-submit').onclick = () => {
    if (!reviewWorkflow || reviewRole !== 'editor' || session.dirty || !session.page?.draft || operation || session.reconcileRequired || composing) return;
    run(async () => {
      const id = session.page.id;
      await mutateThenRead(() => adapter.action('submitForReview', {
        id,
        expectedRevision: session.page.revision,
        expectedDraftRevision: session.page.draft.draftRevision
      }), '已把当前草稿修订加入本机审核流程；这没有认证操作者身份。');
    });
  };

  $('review-approve').onclick = () => {
    if (!reviewWorkflow || reviewRole !== 'reviewer' || !session.page?.draft || operation || session.reconcileRequired || composing) return;
    showDialog('批准此草稿修订？',
      '本机流程演示会记录一个模拟审核决定。当前服务没有真实登录或角色权限，不能把此结果用于生产审核。',
      '模拟批准', () => run(async () => {
        const id = session.page.id;
        await mutateThenRead(() => adapter.action('decideReview', {
          id,
          expectedDraftRevision: session.page.draft.draftRevision,
          decision: 'approve'
        }), '演示审核已批准；仍需编辑者切回模拟角色并确认写入本地正式版本。网站没有更新。');
      }));
  };

  $('review-return').onclick = () => {
    if (!reviewWorkflow || reviewRole !== 'reviewer' || !session.page?.draft || operation || session.reconcileRequired || composing) return;
    const field = document.createElement('div');
    const label = document.createElement('label');
    label.htmlFor = 'review-return-reason';
    label.textContent = '退回原因';
    const input = document.createElement('textarea');
    input.id = 'review-return-reason';
    input.maxLength = 500;
    input.rows = 4;
    input.required = true;
    input.placeholder = '说明需要作者修改的内容';
    field.append(label, input);
    showDialog('退回草稿修改', field, '退回修改', () => run(async () => {
      const reason = input.value.trim();
      if (!reason) {
        notice('请填写退回原因。', true);
        return;
      }
      const id = session.page.id;
      await mutateThenRead(() => adapter.action('decideReview', {
        id,
        expectedDraftRevision: session.page.draft.draftRevision,
        decision: 'return',
        reason
      }), '草稿已退回模拟编辑者；该状态仅保存在本机原型。');
    }));
  };

  async function mutateThenRead(mutation, successMessage) {
    const outcome = await session.commitAndReload(mutation);
    if (outcome.refreshError) {
      if (outcome.result?.reviewStatus && session.page?.draft) {
        // The mutation reply is authoritative for that completed review event;
        // keep it visible while the failed read leaves newer state unknown.
        session.page.draft = {...session.page.draft, ...outcome.result};
      }
      $('conflict').hidden = false;
      const revision = outcome.result?.revision ?? outcome.result?.draftRevision;
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
    '保存草稿不会公开内容。“查看变化”用 + / − 展示与正式内容的不同。“确认正式版本”只写入本机内容仓库，本原型不执行网站上线或对外同步。文字预览不执行页面代码。键盘可用 Ctrl / ⌘ + S 保存。'
      + ' 全局内容称谓规则：不得用面向学生/下级的称谓称呼教师、导师；涉及上级时可写“副院长”；已毕业且具有导师头衔者，不写“博士”头衔。'
      + (reviewWorkflow ? ' 本机审核演示中的角色切换没有真实身份认证或权限保护。' : ''));

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
    reviewWorkflow = result.capabilities?.reviewWorkflow === 'local-simulation';
    $('review-simulation').hidden = !reviewWorkflow;
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
