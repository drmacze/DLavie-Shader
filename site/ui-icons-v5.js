(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];

  const paths={
    home:'<path d="M3.5 11.2 12 4l8.5 7.2V20H6v-8.8M9.5 20v-5.5h5V20"/>',
    account:'<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20c.7-3.6 3.3-5.5 7.5-5.5s6.8 1.9 7.5 5.5"/>',
    login:'<path d="M10 5H5v14h5M13 8l4 4-4 4M8 12h9"/>',
    userPlus:'<path d="M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3.5 20c.6-3.2 2.8-5 6.5-5 1.5 0 2.8.3 3.8.8M18 11v6M15 14h6"/>',
    download:'<path d="M12 3v11m0 0 4-4m-4 4-4-4M5 20h14"/>',
    update:'<path d="M12 4a8 8 0 1 1-7.2 4.5M4 4v5h5M12 8v4l2.7 1.7"/>',
    community:'<path d="M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3 19c.5-3 2.4-4.8 5.5-4.8S13 16 13.5 19M16.5 10.5a2.7 2.7 0 1 0 0-5.4M16 14c2.8 0 4.5 1.4 5 4"/>',
    feedback:'<path d="M5 5h14v10H9l-4 4V5ZM8 9h8M8 12h5"/>',
    vote:'<path d="M5 4h14v16H5zM8 9l2 2 5-5M8 15h8"/>',
    code:'<path d="m9 8-4 4 4 4M15 8l4 4-4 4M13 5l-2 14"/>',
    theme:'<path d="M20 14.2A8.2 8.2 0 0 1 9.8 3.8 8.5 8.5 0 1 0 20 14.2Z"/>',
    search:'<path d="m20 20-4.2-4.2M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"/>',
    menu:'<path d="M5 7h14M5 12h14M5 17h14"/>',
    bookmark:'<path d="M6.5 4h11v16l-5.5-3.4L6.5 20V4Z"/>',
    shield:'<path d="M12 3 5.5 5.6v5.7c0 4.2 2.4 7.6 6.5 9.7 4.1-2.1 6.5-5.5 6.5-9.7V5.6L12 3ZM9 12l2 2 4-4"/>',
    settings:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M7 14v6"/>',
    file:'<path d="M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h5"/>',
    mail:'<path d="M4 6h16v12H4zM4.5 7l7.5 6 7.5-6"/>',
    lock:'<path d="M7 10V8a5 5 0 0 1 10 0v2M5.5 10h13v10h-13zM12 14v3"/>',
    key:'<path d="M14.5 9.5a4 4 0 1 1-1.1-2.8L21 6v3h-3v2h-2v2h-2.5"/>',
    message:'<path d="M5 5h14v11H9l-4 4V5ZM8 9h8M8 12h6"/>',
    heart:'<path d="M12 20s-7-4-7-9a4 4 0 0 1 7-2.7A4 4 0 0 1 19 11c0 5-7 9-7 9Z"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    external:'<path d="M14 5h5v5M19 5l-8 8M10 6H5v13h13v-5"/>',
    logout:'<path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10"/>',
    chevron:'<path d="m9 6 6 6-6 6"/>'
  };
  function icon(name,cls='ui-icon'){
    return `<span class="${cls}" aria-hidden="true"><svg viewBox="0 0 24 24">${paths[name]||paths.chevron}</svg></span>`;
  }

  function cleanText(el){
    if(!el) return '';
    return el.textContent.replace(/\s+/g,' ').trim();
  }

  function inferMainAction(el){
    const href=el.getAttribute('href')||'';
    const text=cleanText(el).toLowerCase();
    if(el.hasAttribute('data-dlavie-account-link')||href.includes('account.html')||text.includes('akun')||text.includes('account')||text.includes('masuk')) return ['account',text.includes('masuk')?'Masuk':'Akun'];
    if(href.includes('#downloads')||text.includes('project')) return ['download','Project'];
    if(href.includes('#news')||text.includes('update')||text.includes('news')) return ['update','Update'];
    if(href.includes('#community')||text.includes('komunitas')) return ['community','Komunitas'];
    if(href.includes('#feedback')||text.includes('feedback')) return ['feedback','Feedback'];
    if(href.includes('#vote')||text.includes('voting')||text.includes('vote')) return ['vote','Voting'];
    if(href.includes('github.com')||text.includes('github')) return ['code','GitHub'];
    if(el.hasAttribute('data-mr-theme')||text.includes('tema')||text.includes('theme')) return ['theme','Tema'];
    return ['chevron',cleanText(el)];
  }

  function upgradeMainSheet(){
    const sheet=$('#mobileSheet');
    if(!sheet) return;
    sheet.classList.add('ui-sheet-v5');
    if(!$('.ui-sheet-heading',sheet)){
      const heading=document.createElement('div');
      heading.className='ui-sheet-heading';
      heading.innerHTML=`<div class="ui-sheet-heading-brand"><img src="assets/dlavie-mark.svg" alt=""><span><b>DLavie</b><small>Navigasi</small></span></div><span class="ui-sheet-hint">Pilih halaman</span>`;
      const handle=$('.sheet-handle',sheet);
      (handle||sheet.firstChild)?.insertAdjacentElement?.('afterend',heading) || sheet.prepend(heading);
    }
    $$('.sheet-action',sheet).forEach(el=>{
      if(el.dataset.uiV5==='1') return;
      const [name,label]=inferMainAction(el);
      el.dataset.uiV5='1';
      el.innerHTML=`${icon(name,'ui-menu-icon')}<span class="ui-menu-label">${label}</span>${icon('chevron','ui-menu-trailing')}`;
    });
  }

  function createSiteFloatingMenu(){
    if(!$('#mobileSheet')||$('.account-topbar')||$('#dlvSiteMenuToggle')) return;
    document.body.classList.add('ui-site-bottom-menu-v5');
    document.body.insertAdjacentHTML('beforeend',`<button id="dlvSiteMenuToggle" class="ui-site-menu-toggle" type="button" aria-label="Buka menu" aria-expanded="false">${icon('menu','ui-site-toggle-icon')}</button>`);
    const toggle=$('#dlvSiteMenuToggle'), sheet=$('#mobileSheet');
    const sync=()=>{
      const open=sheet?.classList.contains('open')||sheet?.getAttribute('aria-hidden')==='false';
      toggle?.setAttribute('aria-expanded',String(!!open));
      toggle?.setAttribute('aria-label',open?'Tutup menu':'Buka menu');
      if(toggle) toggle.innerHTML=icon(open?'chevron':'menu','ui-site-toggle-icon');
      toggle?.classList.toggle('is-open',!!open);
    };
    toggle?.addEventListener('click',()=>{
      if(sheet?.classList.contains('open')) $('#sheetBackdrop')?.click();
      else $('#mobileMenuOpen')?.click();
      setTimeout(sync,0);
    });
    if(sheet)new MutationObserver(()=>{upgradeMainSheet();sync();}).observe(sheet,{attributes:true,childList:true,subtree:false,attributeFilter:['class','aria-hidden']});
    $('#sheetBackdrop')?.addEventListener('click',()=>setTimeout(sync,0));
    sync();
  }

  function upgradeBrand(){
    $$('.brand strong,.dlv-mobile-brand span,.account-brand strong').forEach(el=>el.textContent='DLavie');
    $$('.brand-logo,.dlv-mobile-brand img,.account-brand img').forEach(img=>img.classList.add('ui-brand-mark-v5'));
  }

  function addCaptionIcon(inputSelector,name){
    const input=$(inputSelector); if(!input) return;
    const label=input.closest('label'); const caption=label?.querySelector(':scope > span');
    if(!caption||caption.dataset.uiV5==='1') return;
    caption.dataset.uiV5='1';
    const text=cleanText(caption);
    caption.innerHTML=`${icon(name,'ui-caption-icon')}<span>${text}</span>`;
  }

  function upgradeAuth(){
    if(!$('#authView')) return;
    document.body.classList.add('ui-account-v5');
    const loginTab=$('[data-auth-tab="login"]'), registerTab=$('[data-auth-tab="register"]');
    if(loginTab&&loginTab.dataset.uiV5!=='1'){loginTab.dataset.uiV5='1';loginTab.innerHTML=`${icon('login','ui-tab-icon')}<span>Masuk</span>`;}
    if(registerTab&&registerTab.dataset.uiV5!=='1'){registerTab.dataset.uiV5='1';registerTab.innerHTML=`${icon('userPlus','ui-tab-icon')}<span>Buat akun</span>`;}
    [['#loginEmail','mail'],['#loginPassword','lock'],['#registerUsername','account'],['#registerDisplayName','account'],['#registerEmail','mail'],['#registerPassword','lock'],['#registerConfirm','lock'],['#resetEmail','mail'],['#recoveryPassword','lock'],['#recoveryConfirm','lock']].forEach(([s,n])=>addCaptionIcon(s,n));
    const forgot=$('#forgotPassword');
    if(forgot&&forgot.dataset.uiV5!=='1'){
      forgot.dataset.uiV5='1';forgot.innerHTML=`${icon('key','ui-inline-icon')}<span>Lupa password?</span>`;
    }
    const flow=$('#authFlowNote');
    if(flow) flow.classList.add('ui-flow-note-v5');
  }

  const accountNavMap={overview:'home',saved:'bookmark',profile:'account',security:'shield',preferences:'settings',data:'file'};
  function upgradeAccountNav(){
    $$('.account-tabs button[data-panel]').forEach(button=>{
      const key=button.dataset.panel, iconSlot=$('.account-nav-icon',button);
      if(iconSlot) iconSlot.innerHTML=`<svg viewBox="0 0 24 24">${paths[accountNavMap[key]||'chevron']}</svg>`;
    });
  }

  function upgradeKpis(){
    const cards=$$('.account-kpi-grid article');
    const names=['bookmark','message','heart','download'];
    cards.forEach((card,i)=>{
      if(card.dataset.uiV5==='1')return;
      card.dataset.uiV5='1';
      card.insertAdjacentHTML('afterbegin',icon(names[i]||'check','ui-kpi-icon'));
    });
    const profile=$('.account-health-grid .plus-card:first-child .plus-card-head>div');
    if(profile&&!$('.ui-section-icon',profile))profile.insertAdjacentHTML('afterbegin',icon('account','ui-section-icon'));
    const security=$('.account-health-grid .plus-card:nth-child(2) .plus-card-head>div');
    if(security&&!$('.ui-section-icon',security))security.insertAdjacentHTML('afterbegin',icon('shield','ui-section-icon'));
  }

  function inferAccountMenu(el){
    const section=el.dataset.dlvSection;
    if(section) return [accountNavMap[section]||'chevron', ({overview:'Ringkasan',saved:'Tersimpan',profile:'Profil',security:'Keamanan',preferences:'Preferensi',data:'Data & privasi'})[section]];
    if(el.dataset.dlvAuth==='login') return ['login','Masuk'];
    if(el.dataset.dlvAuth==='register') return ['userPlus','Buat akun'];
    if(el.hasAttribute('data-dlv-signout')) return ['logout','Keluar dari akun'];
    const href=el.getAttribute('href')||'';
    if(href.includes('#home')) return ['home','Beranda'];
    if(href.includes('community')) return ['community','Komunitas'];
    return ['chevron',cleanText(el)];
  }

  function upgradeAccountBottomMenu(){
    const menu=$('#dlvMobileMenu'); if(!menu) return;
    $$('a,button',menu).forEach(el=>{
      if(el.dataset.uiV5==='1')return;
      const [name,label]=inferAccountMenu(el);
      el.dataset.uiV5='1';
      el.innerHTML=`<span class="ui-account-menu-leading">${icon(name,'ui-menu-icon')}<span>${label}</span></span>${icon('chevron','ui-menu-trailing')}`;
    });
  }

  function observeDynamicMenus(){
    const sheet=$('#mobileSheet');
    if(sheet)new MutationObserver(upgradeMainSheet).observe(sheet,{childList:true,subtree:true});
    const menu=$('#dlvMobileMenu');
    if(menu)new MutationObserver(upgradeAccountBottomMenu).observe(menu,{childList:true,subtree:false});
  }

  function init(){
    upgradeBrand();
    upgradeMainSheet();
    createSiteFloatingMenu();
    upgradeAuth();
    upgradeAccountNav();
    upgradeKpis();
    upgradeAccountBottomMenu();
    observeDynamicMenus();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();