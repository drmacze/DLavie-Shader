(() => {
  'use strict';

  const SUPABASE_URL='https://ydaeukhqwishlrjyfktk.supabase.co';
  const SUPABASE_KEY='sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const DOWNLOAD_KEY='dlavie.download.history.v1';
  const RETURN_KEY='dlavie.account.return.v1';
  const AUTH_HINT='dlavie.auth.state.v1';
  let sb=null,session=null,loading=null;

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];

  function injectStyle(){
    if($('#dlavieAccountBridgeStyle'))return;
    const style=document.createElement('style');
    style.id='dlavieAccountBridgeStyle';
    style.textContent=`
      .dlv-save-project{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:40px;padding:0 12px;border:1px solid var(--border,#343840);border-radius:8px;background:var(--surface,#202228);color:inherit;font:700 12px/1 Inter,system-ui,sans-serif;cursor:pointer;white-space:nowrap;transition:.16s ease}
      .dlv-save-project svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8}.dlv-save-project:hover{transform:translateY(-1px);border-color:#4b515a}.dlv-save-project.is-saved{color:#08793a;background:rgba(31,207,103,.12);border-color:rgba(31,207,103,.38)}
      html[data-theme="light"] .dlv-save-project{background:#fff;border-color:#d7dfd9;color:#303732}html[data-theme="light"] .dlv-save-project.is-saved{color:#08793a;background:#e8faef;border-color:#a8e6bf}
      .project-action-row .dlv-save-project{min-height:42px}
      @media(max-width:760px){.project-action-row .dlv-save-project{height:38px;min-height:38px;padding:0 10px;font-size:10.5px;border-radius:7px}.project-action-row .dlv-save-project span{display:none}}
    `;
    document.head.appendChild(style);
  }

  function hasAuthHint(){
    try{
      const raw=localStorage.getItem(AUTH_HINT);
      if(!raw)return false;
      const p=JSON.parse(raw);return p===true||p?.signedIn===true||!!p?.userId;
    }catch{return false;}
  }

  function loadSupabase(){
    if(window.supabase?.createClient)return Promise.resolve(window.supabase);
    if(loading)return loading;
    loading=new Promise((resolve,reject)=>{
      const existing=$('script[data-dlv-supabase]');
      if(existing){existing.addEventListener('load',()=>resolve(window.supabase),{once:true});existing.addEventListener('error',reject,{once:true});return;}
      const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';script.async=true;script.dataset.dlvSupabase='1';script.onload=()=>resolve(window.supabase);script.onerror=reject;document.head.appendChild(script);
    });
    return loading;
  }

  async function client(){
    if(sb)return sb;
    const lib=await loadSupabase();
    if(!lib?.createClient)throw new Error('Auth library unavailable');
    sb=lib.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    return sb;
  }

  async function currentSession(){
    if(session)return session;
    try{const c=await client();const {data}=await c.auth.getSession();session=data?.session||null;}catch{session=null;}
    return session;
  }

  function saveReturn(slug){
    try{sessionStorage.setItem(RETURN_KEY,`${location.origin}${location.pathname}#project/${slug}`);}catch{}
  }

  function recordDownload({version='Latest',url='' }={}){
    const item={project:'dlavie-shader',title:'DLavie Shader',version,at:new Date().toISOString(),href:'#project/dlavie-shader'};
    try{
      const old=JSON.parse(localStorage.getItem(DOWNLOAD_KEY)||'[]');
      const list=Array.isArray(old)?old:[];
      const next=[item,...list.filter(x=>!(x.project===item.project&&x.version===item.version&&Date.now()-new Date(x.at).getTime()<15000))].slice(0,20);
      localStorage.setItem(DOWNLOAD_KEY,JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('dlavie:download-history',{detail:item}));
    }catch{}
  }

  function bindDownloadHistory(){
    if(document.documentElement.dataset.dlvDownloadHistoryBound)return;
    document.documentElement.dataset.dlvDownloadHistoryBound='1';
    document.addEventListener('click',e=>{
      const latest=e.target.closest('#downloadLatest');
      if(latest){recordDownload({version:'Latest'});return;}
      const version=e.target.closest('.download-version');
      if(version){
        const card=version.closest('.version-card');
        const title=card?.querySelector('h3')?.textContent||'Versi';
        const match=title.match(/\b\d+\.\d+\.\d+\b/);
        recordDownload({version:match?`v${match[0]}`:'Versi'});
      }
    },true);
  }

  function saveButton(){
    let button=$('#dlvSaveProject');
    if(button)return button;
    const actions=$('.project-action-row');
    if(!actions)return null;
    button=document.createElement('button');
    button.id='dlvSaveProject';button.type='button';button.className='dlv-save-project';button.dataset.slug='dlavie-shader';
    button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-3.7L6 21V4.8Z"/></svg><span>Simpan</span>';
    const download=$('#downloadLatest');
    download?.insertAdjacentElement('afterend',button);
    button.addEventListener('click',()=>toggleSaved(button.dataset.slug));
    return button;
  }

  function setSavedState(isSaved,signedIn=true){
    const button=saveButton();if(!button)return;
    button.classList.toggle('is-saved',!!isSaved);
    button.setAttribute('aria-pressed',String(!!isSaved));
    const label=button.querySelector('span');if(label)label.textContent=isSaved?'Tersimpan':'Simpan';
    button.title=signedIn?(isSaved?'Hapus dari project tersimpan':'Simpan project ke akun'):'Masuk untuk menyimpan project';
  }

  async function syncSaved(){
    if(!location.hash.includes('project/dlavie-shader'))return;
    saveButton();
    if(!hasAuthHint()){setSavedState(false,false);return;}
    const s=await currentSession();
    if(!s){setSavedState(false,false);return;}
    try{
      const c=await client();
      const {data,error}=await c.from('dlavie_saved_projects').select('project_slug').eq('user_id',s.user.id).eq('project_slug','dlavie-shader').maybeSingle();
      if(error)throw error;
      setSavedState(!!data,true);
    }catch{setSavedState(false,true);}
  }

  async function toggleSaved(slug){
    const s=await currentSession();
    if(!s){
      saveReturn(slug);
      location.href='account.html?next=project';
      return;
    }
    const button=saveButton();if(button)button.disabled=true;
    try{
      const c=await client();
      const {data}=await c.from('dlavie_saved_projects').select('project_slug').eq('user_id',s.user.id).eq('project_slug',slug).maybeSingle();
      if(data){
        const {error}=await c.from('dlavie_saved_projects').delete().eq('user_id',s.user.id).eq('project_slug',slug);if(error)throw error;setSavedState(false,true);
      }else{
        const {error}=await c.from('dlavie_saved_projects').insert({user_id:s.user.id,project_slug:slug});if(error)throw error;setSavedState(true,true);
      }
    }catch(error){console.warn('[DLavie saved project]',error);}
    finally{if(button)button.disabled=false;}
  }

  function sync(){injectStyle();bindDownloadHistory();if(location.hash.includes('project/'))syncSaved();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
  window.addEventListener('hashchange',()=>setTimeout(sync,0),{passive:true});
  window.addEventListener('pageshow',()=>setTimeout(sync,0),{passive:true});
  window.addEventListener('focus',()=>{session=null;if(location.hash.includes('project/'))syncSaved();},{passive:true});
  window.addEventListener('storage',e=>{if(e.key===AUTH_HINT){session=null;syncSaved();}});
})();
