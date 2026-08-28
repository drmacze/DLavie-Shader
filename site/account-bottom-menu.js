(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const validSections=new Set(['overview','saved','profile','security','preferences','data']);
  const labels={overview:'Ringkasan',saved:'Tersimpan',profile:'Profil',security:'Keamanan',preferences:'Preferensi',data:'Data & privasi'};

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
    inject();updateViewportInset();
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
    if(accountView)new MutationObserver(()=>{render();setOpen(false)}).observe(accountView,{attributes:true,attributeFilter:['hidden']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
