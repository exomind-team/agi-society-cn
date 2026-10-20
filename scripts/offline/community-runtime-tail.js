const api=window.__offlineWiki, storage={getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v)};
const routeLink=(route,anchor='')=>api.hashFor({route,anchor});
const exportFile=content=>{const url=URL.createObjectURL(new Blob([content],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='AGI-Wiki-讨论草稿.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
window.__communityMount=state=>{
 const host=document.getElementById('app'), page=api.pages[state.route];
 const ps=Array.from(host.querySelectorAll('.vp-doc p'));ps.forEach((p,i)=>{if(!p.id)p.id='community-p-'+i});
 if(state.route==='/community'||state.route==='/community'){
  const source=state.params.get('source');const reference=source&&api.pages[source]&&!api.pages[source].unlisted?{route:source,title:state.params.get('title')||api.pages[source].title,anchor:state.params.get('anchor')||'',quote:state.params.get('quote')||'',snapshot:state.params.get('snapshot')||COMMUNITY_SNAPSHOT}:null;
  mountDiscussion({root:host,reference,storage,routeLink,exportFile});return;
 }
 if(!page||page.unlisted||page.kind!=='wiki')return;
 const box=host.querySelector('.community-cite');if(!box)return;
 const cite=box.querySelector('button');cite.onclick=()=>{const selection=window.getSelection?.();const node=selection?.anchorNode;const el=node?.nodeType===1?node:node?.parentElement;const p=el?.closest('.vp-doc p')||ps[0];const params=new URLSearchParams({source:state.route,title:page.title,anchor:p?.id||state.anchor||'',quote:(p?.textContent||'').trim().slice(0,800),snapshot:COMMUNITY_SNAPSHOT});location.hash=api.hashFor({route:'/community',params})};
 const drafts=readDrafts(storage).filter(d=>d.reference?.route===state.route);if(drafts.length){const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='本机相关讨论草稿 · '+drafts.length;details.append(summary);for(const d of drafts){const p=document.createElement('p'),a=document.createElement('a');a.textContent=d.title+'（未发布）';a.href=routeLink('/community');p.append(a);details.append(p)}box.append(details)}
};api.render();
