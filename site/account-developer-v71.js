(() => {
  'use strict';
  const SUPABASE_URL='https://ydaeukhqwishlrjyfktk.supabase.co';
  const SUPABASE_KEY='sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const TEAM_CONSOLE='team/dlv-ops-9f2c/?v=72';
  const $=(s,r=document)=>r.querySelector(s);
  const icon=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 9 3 12l5 3M16 9l5 3-5 3M14 5l-4 14"/></svg>`;
  let access=null;

  function label(role){return role==='owner'?'OWNER':'DEVELOPER'}
  function addProfileAccess(){
    if(!access)return;
    document.body.dataset.dlvDeveloperRole=access.role;
    document.body.classList.add('dlv-has-developer-access');
    const badge=$('#roleBadge');
    if(badge){badge.textContent=label(access.role);badge.classList.add('developer-role-badge');badge.title=`DLavie Developer · ${access.role}`}
    const identity=$('.identity-line');
    if(identity&&!$('#developerConsoleChip')) identity.insertAdjacentHTML('beforeend',`<a id="developerConsoleChip" class="developer-console-chip" href="${TEAM_CONSOLE}">${icon}<span>Tim</span></a>`);
    const profile=$('.profile-header');
    const signout=$('#signOutButton');
    if(profile&&signout&&!$('#developerConsoleButton')) signout.insertAdjacentHTML('beforebegin',`<a id="developerConsoleButton" class="developer-console-button" href="${TEAM_CONSOLE}">${icon}<span>Workspace tim</span></a>`);
    const side=[...document.querySelectorAll('.account-side .side-card')];
    const accountCard=side.find(x=>x.textContent.includes('ACCOUNT'));
    if(accountCard&&!$('#developerRoleValue')){
      const dl=$('dl',accountCard);
      if(dl)dl.insertAdjacentHTML('beforeend',`<div class="developer-role-row"><dt>Developer role</dt><dd id="developerRoleValue">${label(access.role)}</dd></div>`);
    }
    const quick=side.find(x=>x.textContent.includes('QUICK LINKS'));
    if(quick&&!$('#developerQuickLink')){
      const kicker=$('.kicker',quick);
      kicker?.insertAdjacentHTML('afterend',`<a id="developerQuickLink" class="developer-quick-link" href="${TEAM_CONSOLE}">${icon}<span>Workspace tim</span><b>→</b></a>`);
    }
  }

  function addMobileAccess(){
    if(!access)return;
    const menu=$('#dlvMobileMenu');
    if(!menu||menu.querySelector('[data-dlv-developer-console]'))return;
    const groups=[...menu.querySelectorAll('.dlv-mobile-menu-group')];
    const dlavieGroup=groups.find(g=>g.querySelector('.dlv-mobile-menu-label')?.textContent.trim()==='DLavie');
    if(!dlavieGroup)return;
    const signout=dlavieGroup.querySelector('[data-dlv-signout]');
    const a=document.createElement('a');
    a.href=TEAM_CONSOLE;
    a.dataset.dlvDeveloperConsole='true';
    a.className='dlv-developer-console-row';
    a.innerHTML=`<span class="dlv-dev-menu-icon">${icon}</span><span class="dlv-dev-menu-copy"><strong>Workspace tim</strong><small>${label(access.role)}</small></span><span class="dlv-menu-arrow">›</span>`;
    dlavieGroup.insertBefore(a,signout||null);
  }

  function watchMenu(){
    const menu=$('#dlvMobileMenu');
    if(!menu)return;
    addMobileAccess();
    new MutationObserver(()=>addMobileAccess()).observe(menu,{childList:true});
  }

  async function boot(){
    if(!window.supabase)return;
    const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    const {data:{session}}=await sb.auth.getSession();
    if(!session)return;
    const {data,error}=await sb.from('dlavie_developers').select('role').eq('user_id',session.user.id).maybeSingle();
    if(error||!data)return;
    access=data;
    addProfileAccess();
    watchMenu();
    setTimeout(()=>{addProfileAccess();addMobileAccess()},350);
    setTimeout(()=>{addProfileAccess();addMobileAccess()},1200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
