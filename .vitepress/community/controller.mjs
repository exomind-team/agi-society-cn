import releaseMarker from '../../release/offline-preview.json' with { type: 'json' }
export const COMMUNITY_SNAPSHOT = releaseMarker.request
export const DRAFT_KEY = 'agi-wiki-community-drafts-v1'
export const CATEGORIES = ['研究讨论', '实验复现', 'Wiki改进']
export function readDrafts(storage) {
  try { const value = JSON.parse(storage.getItem(DRAFT_KEY) || '[]'); return Array.isArray(value) ? value.filter(d => d && typeof d.title === 'string' && typeof d.body === 'string' && CATEGORIES.includes(d.category) && (!d.reference || (typeof d.reference.route === 'string' && d.reference.route.startsWith('/') && !d.reference.route.startsWith('//')))).slice(-100) : [] } catch { return [] }
}
export function createDraft({title,body,category,reference,id}) {
  if (!title.trim() || !body.trim() || !CATEGORIES.includes(category)) throw Error('请填写标题、内容并选择分类。')
  return {id:id || Date.now().toString(36), title:title.trim().slice(0,200), body:body.trim().slice(0,20000),category,reference, snapshot:COMMUNITY_SNAPSHOT, status:'local-only-not-published'}
}
export function mountDiscussion({root,reference,storage,routeLink,exportFile}) {
  const q = s => root.querySelector(s), drafts = readDrafts(storage)
  let category = '研究讨论'
  const text = (tag,value) => { const e=document.createElement(tag);e.textContent=value;return e }
  const link = ref => routeLink(ref.route,ref.anchor||'')
  function renderDrafts() {
    const list=q('#community-drafts');list.replaceChildren()
    if(!drafts.length) list.append(text('p','还没有草稿。可从 Wiki 条目底部引用，或选择上方讨论类型。'))
    for(const draft of [...drafts].reverse()) { const item=document.createElement('article');item.className='community-draft';item.append(text('h3',draft.title),text('small',draft.category+' · 仅本机，未发布'),text('p',draft.body));if(draft.reference){const a=text('a','返回引用的 Wiki：'+draft.reference.title);a.href=link(draft.reference);item.append(a,text('p',draft.reference.quote||''),text('small','快照：'+draft.reference.snapshot))}list.append(item) }
  }
  function open(value) {category=value;q('#community-editor').hidden=false;q('#community-reference').textContent=reference ? '引用：'+reference.title+' · '+reference.snapshot+'\n'+reference.quote : '未关联 Wiki 来源；这是一份独立本地草稿。';q('#community-topic-title').focus()}
  root.querySelectorAll('[data-community-category]').forEach(b=>b.onclick=()=>open(b.dataset.communityCategory))
  const current=()=>createDraft({title:q('#community-topic-title').value,body:q('#community-topic-body').value,category,reference})
  q('#community-save').onclick=()=>{try{const draft=current();const next=[...drafts,draft].slice(-100);storage.setItem(DRAFT_KEY,JSON.stringify(next));drafts.splice(0,drafts.length,...next);renderDrafts();q('#community-feedback').textContent='已保存到此浏览器，未发布。'}catch(e){q('#community-feedback').textContent=e.message+' 若浏览器禁用存储，请导出草稿。'}}
  q('#community-export').onclick=()=>{try{exportFile(JSON.stringify(current(),null,2));q('#community-feedback').textContent='已生成草稿下载，不会向论坛提交。'}catch(e){q('#community-feedback').textContent=e.message}}
  renderDrafts();if(reference)open(category)
}
