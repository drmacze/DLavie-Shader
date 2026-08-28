(() => {
  'use strict';
  const URL='https://ydaeukhqwishlrjyfktk.supabase.co';
  const KEY='sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const STORAGE='dlavie.theme.v1';
  let client=null;

  function resolve(value){
    if(value==='system') return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
    return value==='dark'?'dark':'light';
  }
  function apply(value){
    value=['light','dark','system'].includes(value)?value:'light';
    const resolved=resolve(value);
    document.documentElement.dataset.theme=resolved;
    try{localStorage.setItem(STORAGE,value);}catch{}
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.content=resolved==='light'?'#f5f7f4':'#111113';
  }
  async function sync(){
    if(!window.supabase?.createClient)return;
    client ||= window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    const {data}=await client.auth.getSession();
    const session=data?.session;
    if(!session)return;
    const {data:row,error}=await client.from('dlavie_accounts').select('theme_preference').eq('user_id',session.user.id).maybeSingle();
    if(!error&&row?.theme_preference)apply(row.theme_preference);
  }
  function init(){
    sync().catch(()=>{});
    const media=matchMedia('(prefers-color-scheme: dark)');
    const onSystem=()=>{try{if(localStorage.getItem(STORAGE)==='system')apply('system');}catch{}};
    media.addEventListener?.('change',onSystem);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
