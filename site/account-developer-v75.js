(() => {
  'use strict';

  const SUPABASE_URL='https://ydaeukhqwishlrjyfktk.supabase.co';
  const SUPABASE_KEY='sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const OWNER_EMAIL='dlaviecom@gmail.com';
  const CONSOLE_URL='team-dlv-ops-9f2c.html?v=75';
  const $=(s,r=document)=>r.querySelector(s);
  let role=null;

  const icon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 9 3 12l5 3M16 9l5 3-5 3M14 5l-4 14"/></svg>';
  const label=()=>role==='owner'?'OWNER':'DEVELOPER';

  function applyBadge(){
    if(!role)return;
    const badge=$('#roleBadge');
    if(badge){badge.textContent=label();badge.classList.add('developer-role-badge');badge.title=`DLavie Developer · ${role}`;}
    const community=$('#communityRole');
    if(community)community.textContent=label();
    const identity=$('.identity-line');
    if(identity&&!$('#developerConsoleChip'))identity.insertAdjacentHTML('beforeend',`<a id="developerConsoleChip" class="developer-console-chip" href="${CONSOLE_URL}">${icon}<span>Console</span></a>`);
  }

  function applyMobileMenu(){
    if(!role)return;
    const menu=$('#dlvMobileMenu');
    if(!menu||menu.querySelector('[data-dlv-console-v75]'))return;
    const groups=[...menu.querySelectorAll('.dlv-mobile-menu-group')];
    const dlavie=groups.find(g=>g.querySelector('.dlv-mobile-menu-label')?.textContent.trim()==='DLavie');
    if(!dlavie)return;
    const signout=dlavie.querySelector('[data-dlv-signout]');
    const row=document.createElement('a');
    row.href=CONSOLE_URL;
    row.dataset.dlvConsoleV75='true';
    row.className='dlv-developer-console-row';
    row.innerHTML=`<span class="dlv-dev-menu-icon">${icon}</span><span class="dlv-dev-menu-copy"><strong>Developer Console</strong><small>${label()}</small></span><span class="dlv-menu-arrow">›</span>`;
    dlavie.insertBefore(row,signout||null);
  }

  function apply(){applyBadge();applyMobileMenu();}

  async function boot(){
    if(!window.supabase)return;
    try{
      const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
      const {data:{session}}=await sb.auth.getSession();
      if(!session)return;

      if(String(session.user?.email||'').toLowerCase()===OWNER_EMAIL)role='owner';
      try{
        const rpc=await sb.rpc('dlavie_my_developer_role');
        if(!rpc.error&&rpc.data)role=rpc.data;
      }catch(_){ }
      if(!role)return;

      apply();
      setTimeout(apply,200);
      setTimeout(apply,600);
      setTimeout(apply,1200);

      const observer=new MutationObserver(apply);
      observer.observe(document.body,{childList:true,subtree:true});
      setTimeout(()=>observer.disconnect(),10000);
    }catch(_){ }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
