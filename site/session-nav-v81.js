(() => {
  'use strict';
  const URL='https://ydaeukhqwishlrjyfktk.supabase.co';
  const KEY='sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const HINT='dlavie.auth.state.v1';
  const PROFILE='dlavie.profile.cache.v1';
  let sb=null,loading=null;
  const wait=ms=>new Promise(r=>setTimeout(r,ms));

  function hint(){
    try{const v=JSON.parse(localStorage.getItem(HINT)||'null');return !!(v===true||v?.signedIn||v?.userId)}catch{return false}
  }
  function accountHref(signed){return signed?'account.html?v=81#profile':'account.html?v=81'}
  function rewrite(signed=hint()){
    document.querySelectorAll('a[href*="account.html"]').forEach(a=>{
      const href=a.getAttribute('href')||'';
      if(/account\.html/.test(href))a.setAttribute('href',accountHref(signed));
    });
  }
  function load(){
    if(window.supabase?.createClient)return Promise.resolve(window.supabase);
    if(loading)return loading;
    loading=new Promise((resolve,reject)=>{
      const old=document.querySelector('script[data-dlv-auth-lib]');
      if(old){old.addEventListener('load',()=>resolve(window.supabase),{once:true});old.addEventListener('error',reject,{once:true});return}
      const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.async=true;s.dataset.dlvAuthLib='1';s.onload=()=>resolve(window.supabase);s.onerror=reject;document.head.appendChild(s);
    });
    return loading;
  }
  function rawSession(){
    try{
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i)||'';
        if(!/^sb-.*-auth-token$/.test(k))continue;
        const v=JSON.parse(localStorage.getItem(k)||'null');
        const s=v?.currentSession||v?.session||v;
        if(s?.access_token&&s?.refresh_token)return s;
      }
    }catch{}
    return null;
  }
  async function stableSession(){
    try{
      const lib=await load();
      sb ||= lib.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
      for(const ms of [0,120,320,700]){
        if(ms)await wait(ms);
        const s=(await sb.auth.getSession()).data?.session;
        if(s)return s;
      }
      const raw=rawSession();
      if(raw){const r=await sb.auth.setSession({access_token:raw.access_token,refresh_token:raw.refresh_token});if(r.data?.session)return r.data.session}
      const refreshed=(await sb.auth.refreshSession()).data?.session;
      return refreshed||null;
    }catch{return null}
  }
  async function sync(){
    rewrite();
    const s=await stableSession();
    if(s){
      try{localStorage.setItem(HINT,JSON.stringify({signedIn:true,userId:s.user.id}));}catch{}
      rewrite(true);
    }else if(!hint())rewrite(false);
  }
  rewrite();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
  new MutationObserver(()=>rewrite()).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('pageshow',sync,{passive:true});
  window.addEventListener('focus',sync,{passive:true});
})();
