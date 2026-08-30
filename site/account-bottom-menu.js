(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const validSections=new Set(['overview','saved','profile','security','preferences','data']);
  const labels={overview:'Ringkasan',saved:'Tersimpan',profile:'Profil',security:'Keamanan',preferences:'Preferensi',data:'Data & privasi'};
  const SUPABASE_URL='https://ydaeukhqwishlrjyfktk.supabase.co';
  const SUPABASE_KEY='sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const TEAM_CONSOLE='team/dlv-ops-9f2c/?v=72';
  let developerAccess=null;

  function activeSection(){
    const hash=location.hash.replace(/^#/,'').toLowerCase();
    return validSections.has(hash)?hash:'overview';
  }

  function updateViewportInset(){
    const vv=window.visualViewport;
    let obstruction=0;
    if(vv) obstruction=Math.max(0,window.innerHeight-vv.height-vv.offsetTop);
    document.documentElement.style.setProperty('--dlv-bottom-obstruction',`${Math.min(140,Math.round(obstruction))}px`);
  }

  function signedIn(){return !$('#accountView')?.hidden;}
  function devLabel(){return developerAccess?.role==='owner'?'OWNER':'DEVELOPER'}
  function developerRow(){
    if(!developerAccess)return '';
    return `<a href="${TEAM_CONSOLE}" data-dlv-developer-console class="dlv-developer-console-row"><span>Workspace tim</span><small>${devLabel()}</small><span class="dlv-menu-arrow">›</span></a>`;
  }

  function buildContent(){
    const current=activeSection();
    if(signedIn()){
      return `
        <div class="dlv-mobile-menu-head"><strong>Navigasi</strong><span>Akun DLavie</span></div>
        <div class="dlv-mobile-menu-group">
          <div class="dlv-mobile-menu-label">Akun</div>
          ${[...validSections].map(key=>`<button type="button" data-dlv-section="${key}" class="${current===key?'is-active':''}"><span>${labels[key]}</span><span class="dlv-menu-arrow">›</span></button>`).join('')}
        </div>
        <div class="dlv-mobile-menu-group">
          <div class="dlv-mobile-menu-label">DLavie</div>
          ${developerRow()}
          <a href="./#home"><span>Beranda</span><span class="dlv-menu-arrow">↗</span></a>
          <a href="community.html"><span>Komunitas</span><span class="dlv-menu-arrow">↗</span></a>
          <button type="button" data-dlv-signout class="dlv-menu-danger"><span>Keluar dari akun</span><span class="dlv-menu-arrow">→</span></button>
        </div>`;
    }
    return `
      <div class="dlv-mobile-menu-head"><strong>Navigasi</strong><span>DLavie</span></div>
      <div class="dlv-mobile-menu-group">
        <div class="dlv-mobile-menu-label">Akun</div>
        <button type="button" data-dlv-auth="login"><span>Masuk</span><span class="dlv-menu-arrow">›</span></button>
        <button type="button" data-dlv-auth="register"><span>Buat akun</span><span class="dlv-menu-arrow">›</span></button>
      </div>
      <div class="dlv-mobile-menu-group">
        <div class="dlv-mobile-menu-label">DLavie</div>
        <a href="./#home"><span>Beranda</span><span class="dlv-menu-arrow">↗</span></a>
        <a href="community.html"><span>Komunitas</span><span class="dlv-menu-arrow">↗</span></a>
      </div>`;
  }

  function render(){
    const menu=$('#dlvMobileMenu');
    if(menu) menu.innerHTML=buildContent();
  }

  function applyDeveloperUI(){
    if(!developerAccess)return;
    document.body.dataset.dlvDeveloperRole=developerAccess.role;
    const role=$('#roleBadge');
    if(role){role.textContent=devLabel();role.classList.add('developer-role-badge');}
    const identity=$('.identity-line');
    if(identity&&!$('#developerConsoleChip')) identity.insertAdjacentHTML('beforeend',`<a id="developerConsoleChip" class="developer-console-chip" href="${TEAM_CONSOLE}">Tim</a>`);
    const side=[...document.querySelectorAll('.account-side .side-card')];
    const accountCard=side.find(x=>x.textContent.includes('ACCOUNT'));
    if(accountCard&&!$('#developerRoleValue')) $('dl',accountCard)?.insertAdjacentHTML('beforeend',`<div><dt>Developer role</dt><dd id="developerRoleValue">${devLabel()}</dd></div>`);
    const quick=side.find(x=>x.textContent.includes('QUICK LINKS'));
    if(quick&&!$('#developerQuickLink')) $('.kicker',quick)?.insertAdjacentHTML('afterend',`<a id="developerQuickLink" class="developer-quick-link" href="${TEAM_CONSOLE}">Workspace tim <b>→</b></a>`);
    render();
  }

  async function loadDeveloperAccess(){
    try{
      if(!window.supabase)return;
      const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
      const {data:{session}}=await sb.auth.getSession();
      if(!session)return;
      const {data,error}=await sb.from('dlavie_developers').select('role').eq('user_id',session.user.id).maybeSingle();
      if(error||!data)return;
      developerAccess=data;
      applyDeveloperUI();
      setTimeout(applyDeveloperUI,300);
      setTimeout(applyDeveloperUI,1000);
    }catch(_){ }
  }

  function setOpen(open){
    const button=$('#dlvMobileMenuToggle'),menu=$('#dlvMobileMenu'),backdrop=$('#dlvMobileMenuBackdrop');
    if(!button||!menu||!backdrop)return;
    button.setAttribute('aria-expanded',String(open));
    button.setAttribute('aria-label',open?'Tutup menu':'Buka menu');
    menu.classList.toggle('is-open',open);
    backdrop.classList.toggle('is-open',open);
    menu.setAttribute('aria-hidden',String(!open));
    if(open){render();setTimeout(()=>menu.querySelector('button,a')?.focus({preventScroll:true}),40);}
  }

  function inject(){
    if($('#dlvMobileMenuToggle'))return;
    document.body.insertAdjacentHTML('beforeend',`
      <div class="dlv-mobile-menu-backdrop" id="dlvMobileMenuBackdrop" aria-hidden="true"></div>
      <nav class="dlv-mobile-menu" id="dlvMobileMenu" aria-label="Navigasi mobile" aria-hidden="true"></nav>
      <button class="dlv-mobile-menu-toggle" id="dlvMobileMenuToggle" type="button" aria-controls="dlvMobileMenu" aria-expanded="false" aria-label="Buka menu">
        <span></span><span></span><span></span>
      </button>`);
    render();
  }

  function bind(){
    inject();updateViewportInset();loadDeveloperAccess();
    $('#dlvMobileMenuToggle')?.addEventListener('click',()=>setOpen($('#dlvMobileMenuToggle')?.getAttribute('aria-expanded')!=='true'));
    $('#dlvMobileMenuBackdrop')?.addEventListener('click',()=>setOpen(false));
    $('#dlvMobileMenu')?.addEventListener('click',event=>{
      const section=event.target.closest('[data-dlv-section]');
      if(section){
        const name=section.dataset.dlvSection;
        window.DLavieAccountFlow?.applySection?.(name,{updateUrl:true});
        setOpen(false);render();
        document.querySelector(`[data-account-panel="${name}"]`)?.scrollIntoView({behavior:'smooth',block:'start'});
        return;
      }
      const auth=event.target.closest('[data-dlv-auth]');
      if(auth){
        document.querySelector(`[data-auth-tab="${auth.dataset.dlvAuth}"]`)?.click();
        setOpen(false);
        $('#authView')?.scrollIntoView({behavior:'smooth',block:'start'});
        return;
      }
      if(event.target.closest('[data-dlv-signout]')){
        setOpen(false);
        $('#signOutButton')?.click();
        return;
      }
      if(event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown',event=>{if(event.key==='Escape')setOpen(false)});
    window.addEventListener('hashchange',()=>{render();setOpen(false)});
    window.addEventListener('resize',updateViewportInset,{passive:true});
    window.visualViewport?.addEventListener('resize',updateViewportInset,{passive:true});
    window.visualViewport?.addEventListener('scroll',updateViewportInset,{passive:true});

    const accountView=$('#accountView');
    if(accountView)new MutationObserver(()=>{render();setOpen(false);if(signedIn())loadDeveloperAccess()}).observe(accountView,{attributes:true,attributeFilter:['hidden']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
