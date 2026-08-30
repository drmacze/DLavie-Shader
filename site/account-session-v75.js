(() => {
  'use strict';
  const SUPABASE_URL='https://ydaeukhqwishlrjyfktk.supabase.co';
  const SUPABASE_KEY='sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const ACCOUNT_API=`${SUPABASE_URL}/functions/v1/dlavie-account`;
  const CONSOLE_URL='team/dlv-ops-9f2c/?v=75';
  const OWNER_EMAIL='dlaviecom@gmail.com';
  const $=(s,r=document)=>r.querySelector(s);
  let sb=null, busy=false, developerRole=null;
  const wait=ms=>new Promise(r=>setTimeout(r,ms));

  function client(){
    if(sb)return sb;
    if(!window.supabase?.createClient)return null;
    sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    return sb;
  }

  async function stableSession(){
    const c=client(); if(!c)return null;
    for(const delay of [0,140,320,700]){
      if(delay)await wait(delay);
      try{const s=(await c.auth.getSession()).data?.session;if(s)return s}catch(_){ }
    }
    try{const s=(await c.auth.refreshSession()).data?.session;if(s)return s}catch(_){ }
    return null;
  }

  function patchConsoleLinks(){
    document.querySelectorAll('a').forEach(a=>{
      const href=a.getAttribute('href')||'';
      if(a.matches('[data-dlv-developer-console],#developerConsoleChip,#developerConsoleButton,#developerQuickLink,.developer-console-access-button,.developer-console-button,.developer-console-chip,.developer-quick-link') || href.includes('developer.html?team=') || href.includes('team-dlv-ops-9f2c.html')){
        a.setAttribute('href',CONSOLE_URL);
      }
    });
  }

  function developerLabel(){return developerRole==='owner'?'OWNER':'DEVELOPER'}
  function ensureDeveloperUI(){
    if(!developerRole)return;
    const label=developerLabel();
    const badge=$('#roleBadge'); if(badge){badge.textContent=label;badge.classList.add('developer-role-badge')}
    const community=$('#communityRole'); if(community)community.textContent=label;
    const menu=$('#dlvMobileMenu');
    if(menu){
      const existing=menu.querySelector('[data-dlv-developer-console]');
      if(existing){existing.href=CONSOLE_URL;existing.querySelector('small')?.replaceChildren(document.createTextNode(label));}
      else{
        const groups=[...menu.querySelectorAll('.dlv-mobile-menu-group')];
        const group=groups.find(g=>g.querySelector('.dlv-mobile-menu-label')?.textContent.trim()==='DLavie');
        const signout=group?.querySelector('[data-dlv-signout]');
        if(group){
          const a=document.createElement('a');
          a.href=CONSOLE_URL;a.dataset.dlvDeveloperConsole='true';a.className='dlv-developer-console-row';
          a.innerHTML=`<span>Developer Console</span><small>${label}</small><span class="dlv-menu-arrow">›</span>`;
          group.insertBefore(a,signout||null);
        }
      }
    }
    const identity=$('.identity-line');
    if(identity&&!$('#developerConsoleChip'))identity.insertAdjacentHTML('beforeend',`<a id="developerConsoleChip" class="developer-console-chip" href="${CONSOLE_URL}">Console</a>`);
    patchConsoleLinks();
  }

  function renderAccount(data){
    if(!data?.account||!data?.user)return;
    const a=data.account,m=data.member||{},u=data.user;
    $('#authView') && ($('#authView').hidden=true);
    $('#accountView') && ($('#accountView').hidden=false);
    if($('#accountDisplay'))$('#accountDisplay').textContent=a.display_name||a.username||'DLavie';
    if($('#accountUsername'))$('#accountUsername').textContent='@'+(a.username||'member');
    if($('#accountEmail'))$('#accountEmail').textContent=u.email||'';
    if($('#verifiedBadge'))$('#verifiedBadge').hidden=!u.email_confirmed_at;
    if($('#roleBadge'))$('#roleBadge').textContent=developerRole?developerLabel():String(m.role||'member').toUpperCase();
    if($('#communityRole'))$('#communityRole').textContent=developerRole?developerLabel():String(m.role||'member').toUpperCase();
    if($('#createdDate')&&a.created_at)$('#createdDate').textContent=new Date(a.created_at).toLocaleDateString([], {year:'numeric',month:'short',day:'numeric'});
    if($('#emailState'))$('#emailState').textContent=u.email_confirmed_at?'Verified':'Unverified';
    if($('#profileDisplayName'))$('#profileDisplayName').value=a.display_name||'';
    if($('#profileBio'))$('#profileBio').value=a.bio||'';
    if($('#bioCount'))$('#bioCount').textContent=String((a.bio||'').length);
    if($('#newUsername'))$('#newUsername').value=a.username||'';
    window.DLavieAccountUI?.setAvatar?.(a.avatar_seed);
    try{
      localStorage.setItem('dlavie.auth.state.v1',JSON.stringify({signedIn:true,userId:u.id}));
      localStorage.setItem('dlavie.profile.cache.v1',JSON.stringify({username:a.username,display_name:a.display_name,avatar:a.avatar_seed}));
    }catch(_){ }
  }

  async function sync(){
    if(busy)return;busy=true;
    try{
      patchConsoleLinks();
      const c=client();if(!c)return;
      const session=await stableSession();
      if(!session)return;
      let role=null;
      try{const r=await c.rpc('dlavie_my_developer_role');if(!r.error&&r.data)role=r.data}catch(_){ }
      if(!role&&String(session.user?.email||'').toLowerCase()===OWNER_EMAIL)role='owner';
      developerRole=role;
      const res=await fetch(ACCOUNT_API,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':`Bearer ${session.access_token}`},body:JSON.stringify({action:'me'}),cache:'no-store'});
      const json=await res.json().catch(()=>null);
      if(res.ok&&json?.ok)renderAccount(json.data);
      ensureDeveloperUI();
    }catch(_){ }
    finally{busy=false;}
  }

  function init(){
    patchConsoleLinks();
    sync();
    [250,700,1500,2800].forEach(ms=>setTimeout(sync,ms));
    window.addEventListener('pageshow',sync,{passive:true});
    window.addEventListener('focus',sync,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')sync()});
    const root=document.body;
    if(root)new MutationObserver(()=>{patchConsoleLinks();ensureDeveloperUI()}).observe(root,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
