(() => {
  'use strict';
  const SUPABASE_URL='https://ydaeukhqwishlrjyfktk.supabase.co';
  const SUPABASE_KEY='sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const ACCOUNT_URL='account.html?v=75#overview';
  const $=(s,r=document)=>r.querySelector(s);
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  let retried=false;
  async function stableSession(){
    if(!window.supabase?.createClient)return null;
    const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    for(const delay of [0,160,360,760]){
      if(delay)await wait(delay);
      try{const s=(await sb.auth.getSession()).data?.session;if(s)return {sb,session:s}}catch(_){ }
    }
    try{const s=(await sb.auth.refreshSession()).data?.session;if(s)return {sb,session:s}}catch(_){ }
    return null;
  }
  async function repair(){
    document.querySelectorAll('a[href^="account.html"]').forEach(a=>a.href=ACCOUNT_URL);
    const stable=await stableSession();if(!stable)return;
    const {sb}=stable;
    let role=null;try{const r=await sb.rpc('dlavie_my_developer_role');if(!r.error)role=r.data}catch(_){ }
    if(!role)return;
    const gate=$('#accessGate'),app=$('#consoleApp');
    if(app&&!app.hidden){sessionStorage.removeItem('dlv.console.v75.reloaded');return;}
    if(gate&&!gate.hidden&&!retried){
      retried=true;
      const key='dlv.console.v75.reloaded';
      if(sessionStorage.getItem(key)!=='1'){
        sessionStorage.setItem(key,'1');
        location.reload();
      }
    }
  }
  function init(){repair();setTimeout(repair,500);setTimeout(repair,1400);window.addEventListener('pageshow',repair,{passive:true});window.addEventListener('focus',repair,{passive:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
