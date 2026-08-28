(() => {
  'use strict';
  const AUTH='dlavie.auth.state.v1';
  const PROFILE='dlavie.profile.cache.v1';
  const AVATARS=new Set(['aurora','orbit','bloom','wave','ember','mono','pixel']);
  const $=(s,r=document)=>r.querySelector(s);

  function signedIn(){
    try{
      const raw=localStorage.getItem(AUTH);if(!raw)return false;
      const data=JSON.parse(raw);return data===true||data?.signedIn===true||!!data?.userId;
    }catch{return false;}
  }
  function profile(){
    try{const p=JSON.parse(localStorage.getItem(PROFILE)||'null');return p&&typeof p==='object'?p:null;}catch{return null;}
  }
  function avatar(value){
    const id=String(value||'').toLowerCase();
    return AVATARS.has(id)?`assets/avatars/${id}.svg`:'assets/dlavie-mark.svg';
  }
  function style(){
    if($('#dlavieAccountNavStyle'))return;
    const el=document.createElement('style');el.id='dlavieAccountNavStyle';el.textContent=`
      .dlv-account-nav{height:38px;display:inline-flex;align-items:center;gap:8px;padding:0 10px;border:1px solid var(--border,#343840);border-radius:8px;background:var(--surface,#202228);color:inherit;text-decoration:none;font:700 11px/1 Inter,system-ui,sans-serif;white-space:nowrap}
      .dlv-account-nav img{width:22px;height:22px;border-radius:7px;object-fit:cover}.dlv-account-nav small{display:block;color:var(--muted,#9ca1aa);font-size:8.5px;font-weight:600;margin-top:2px}.dlv-account-nav:hover{border-color:#4a5059;background:var(--surface2,#26292e)}
      html[data-theme="light"] .dlv-account-nav{background:#fff;border-color:#d7dfd9;color:#202622}html[data-theme="light"] .dlv-account-nav:hover{background:#f2f6f3;border-color:#c7d2ca}html[data-theme="light"] .dlv-account-nav small{color:#707a73}
      .mobile-sheet .dlv-account-sheet{display:flex;align-items:center;gap:10px}.mobile-sheet .dlv-account-sheet img{width:24px;height:24px;border-radius:7px}.mobile-sheet .dlv-account-sheet b{display:block}.mobile-sheet .dlv-account-sheet small{display:block;font-size:9px;color:inherit;opacity:.6;margin-top:2px}
      @media(max-width:760px){.desktop-header .dlv-account-nav{display:none!important}}
    `;document.head.appendChild(el);
  }
  function render(){
    style();
    const member=signedIn(),p=profile();
    const name=member?(p?.display_name||'Akun'):'Masuk';
    const sub=member&&p?.username?`@${p.username}`:'DLavie Account';
    const img=avatar(p?.avatar);

    const actions=$('.header-actions');
    if(actions){
      let link=$('#dlvAccountNav');
      if(!link){link=document.createElement('a');link.id='dlvAccountNav';link.className='dlv-account-nav';link.href='account.html';actions.appendChild(link);}
      link.innerHTML=`<img src="${img}" alt=""><span><b>${name}</b><small>${sub}</small></span>`;
      link.setAttribute('aria-label',member?`Akun ${name}`:'Masuk ke DLavie');
    }

    const sheet=$('#mobileSheet');
    if(sheet){
      let link=$('#dlvAccountSheet');
      if(!link){link=document.createElement('a');link.id='dlvAccountSheet';link.className='sheet-action dlv-account-sheet';link.href='account.html';sheet.insertAdjacentElement('afterbegin',link);}
      link.innerHTML=`<img src="${img}" alt=""><span><b>${name}</b><small>${sub}</small></span>`;
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
  window.addEventListener('pageshow',render,{passive:true});
  window.addEventListener('focus',render,{passive:true});
  window.addEventListener('storage',e=>{if(e.key===AUTH||e.key===PROFILE)render();});
})();
