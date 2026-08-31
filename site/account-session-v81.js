(() => {
  'use strict';
  const URL='https://ydaeukhqwishlrjyfktk.supabase.co';
  const KEY='sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const API=`${URL}/functions/v1/dlavie-account`;
  const HINT='dlavie.auth.state.v1';
  const PROFILE='dlavie.profile.cache.v1';
  const OWNER='dlaviecom@gmail.com';
  const $=(s,r=document)=>r.querySelector(s);
  let sb=null,locked=false,session=null;
  const wait=ms=>new Promise(r=>setTimeout(r,ms));

  function client(){
    if(sb)return sb;
    if(!window.supabase?.createClient)return null;
    sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    return sb;
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
    const c=client();if(!c)return null;
    for(const ms of [0,120,300,650,1200]){
      if(ms)await wait(ms);
      try{const s=(await c.auth.getSession()).data?.session;if(s)return s}catch{}
    }
    const raw=rawSession();
    if(raw){
      try{const r=await c.auth.setSession({access_token:raw.access_token,refresh_token:raw.refresh_token});if(r.data?.session)return r.data.session}catch{}
    }
    try{return (await c.auth.refreshSession()).data?.session||null}catch{return null}
  }
  function applyCachedProfile(){
    try{
      const p=JSON.parse(localStorage.getItem(PROFILE)||'null');if(!p)return;
      if($('#accountDisplay'))$('#accountDisplay').textContent=p.display_name||p.username||'DLavie';
      if($('#accountUsername'))$('#accountUsername').textContent=p.username?'@'+p.username:'@member';
      window.DLavieAccountUI?.setAvatar?.(p.avatar);
    }catch{}
  }
  function forceSignedIn(s){
    if(!s)return;
    session=s;locked=true;
    const auth=$('#authView'),account=$('#accountView');
    if(auth)auth.hidden=true;
    if(account)account.hidden=false;
    if($('#accountEmail'))$('#accountEmail').textContent=s.user?.email||'';
    if($('#verifiedBadge'))$('#verifiedBadge').hidden=!s.user?.email_confirmed_at;
    if($('#emailState'))$('#emailState').textContent=s.user?.email_confirmed_at?'Verified':'Unverified';
    applyCachedProfile();
    try{localStorage.setItem(HINT,JSON.stringify({signedIn:true,userId:s.user.id}));}catch{}
    const requested=(location.hash||'').replace(/^#/,'');
    if(!requested||requested==='overview')history.replaceState(history.state,'',`${location.pathname}${location.search}#profile`);
    window.DLavieAccountFlow?.applySection?.('profile');
  }
  function fill(data){
    const a=data?.account,m=data?.member||{},u=data?.user;if(!a||!u)return;
    if($('#accountDisplay'))$('#accountDisplay').textContent=a.display_name||a.username||'DLavie';
    if($('#accountUsername'))$('#accountUsername').textContent='@'+(a.username||'member');
    if($('#accountEmail'))$('#accountEmail').textContent=u.email||session?.user?.email||'';
    const owner=String(u.email||session?.user?.email||'').toLowerCase()===OWNER;
    if($('#roleBadge'))$('#roleBadge').textContent=owner?'OWNER':String(m.role||'member').toUpperCase();
    if($('#communityRole'))$('#communityRole').textContent=owner?'OWNER':String(m.role||'member').toUpperCase();
    if($('#profileDisplayName'))$('#profileDisplayName').value=a.display_name||'';
    if($('#profileBio'))$('#profileBio').value=a.bio||'';
    if($('#newUsername'))$('#newUsername').value=a.username||'';
    window.DLavieAccountUI?.setAvatar?.(a.avatar_seed);
    try{localStorage.setItem(PROFILE,JSON.stringify({username:a.username,display_name:a.display_name,avatar:a.avatar_seed}));}catch{}
  }
  async function refreshProfile(s){
    try{
      const r=await fetch(API,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json',apikey:KEY,Authorization:`Bearer ${s.access_token}`},body:JSON.stringify({action:'me'})});
      const j=await r.json().catch(()=>null);if(r.ok&&j?.ok)fill(j.data);
    }catch{}
  }
  async function sync(){
    if(new URLSearchParams(location.search).get('mode')==='reset')return;
    const s=await stableSession();
    if(s){forceSignedIn(s);refreshProfile(s)}
    else{locked=false;session=null;}
  }
  function guard(){
    if(!locked||!session)return;
    const auth=$('#authView'),account=$('#accountView');
    if(auth&&!auth.hidden)auth.hidden=true;
    if(account&&account.hidden)account.hidden=false;
  }
  function init(){
    sync();
    [250,700,1500,2800].forEach(ms=>setTimeout(sync,ms));
    const root=document.body;if(root)new MutationObserver(guard).observe(root,{subtree:true,attributes:true,attributeFilter:['hidden']});
    const c=client();c?.auth?.onAuthStateChange?.((event,s)=>{
      if(event==='SIGNED_OUT'){locked=false;session=null;return}
      if(s){forceSignedIn(s);refreshProfile(s)}
    });
    window.addEventListener('pageshow',sync,{passive:true});
    window.addEventListener('focus',sync,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')sync()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
