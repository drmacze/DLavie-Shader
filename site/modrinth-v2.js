(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const THEME_KEY = 'dlavie.theme.v1';
  const searchIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.3-4.3m2.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"/></svg>';
  const menuIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  const moonIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.4 8.4 0 0 1 9.8 3.5 8.8 8.8 0 1 0 20.5 14.2Z"/></svg>';

  function setText(selector,text,scope=document){
    const el = scope.querySelector(selector);
    if(el) el.textContent = text;
  }

  function openGlobalSearch(){
    const trigger = document.querySelector('#mobileSearch') || document.querySelector('#searchOpen');
    if(trigger) trigger.click();
  }

  function makeMobileTopbar(){
    if(document.querySelector('.dlv-mobile-topbar')) return;
    const header = document.createElement('header');
    header.className = 'dlv-mobile-topbar';
    header.innerHTML = `
      <a class="dlv-mobile-brand" href="#home" aria-label="DLavie home"><img src="assets/dlavie-mark.svg" alt=""><span>dlavie</span></a>
      <button class="dlv-mobile-icon" type="button" data-dlv-search aria-label="Cari">${searchIcon}</button>
      <button class="dlv-mobile-icon" type="button" data-dlv-menu aria-label="Menu">${menuIcon}</button>`;
    body.prepend(header);
    header.querySelector('[data-dlv-search]')?.addEventListener('click',openGlobalSearch);
    header.querySelector('[data-dlv-menu]')?.addEventListener('click',()=>document.querySelector('#mobileMenuOpen')?.click());
  }

  function refineHome(){
    const home = document.querySelector('.page[data-route="home"]');
    if(!home) return;
    body.classList.add('modrinth-v3');

    const hero = home.querySelector('.home-hero');
    setText('.eyebrow','DLAVIE',hero);
    const title = hero?.querySelector('h1');
    if(title) title.textContent = 'Jelajahi project Minecraft';
    setText('.hero-lede','Shader, mod, dan resource pack DLavie dengan versi, kompatibilitas, changelog, dan download yang mudah ditemukan.',hero);

    if(hero && !hero.querySelector('.home-discover')){
      const discover = document.createElement('div');
      discover.className = 'home-discover';
      discover.innerHTML = `
        <button class="home-search-trigger" type="button">${searchIcon}<span>Cari project, versi, atau changelog…</span></button>
        <div class="home-category-row" aria-label="Kategori project">
          <span>Shaders</span><span>Mods</span><span>Resource packs</span><span>Bedrock</span><span>Java</span>
        </div>`;
      hero.appendChild(discover);
      discover.querySelector('.home-search-trigger')?.addEventListener('click',openGlobalSearch);
    }

    const heads = [...home.querySelectorAll('.section-heading')];
    if(heads[0]){
      setText('.section-kicker','PROJECTS',heads[0]);
      setText('h2','Project DLavie',heads[0]);
      setText('a','Semua project →',heads[0]);
    }

    const featured = home.querySelector('.featured-project');
    setText('.featured-copy > p','Shader Vibrant Visuals + PBR untuk Minecraft Bedrock dengan godrays dan preset performa mobile.',featured || document);
  }

  function localizeNavigation(){
    const labels = {home:'Beranda',downloads:'Project',news:'Update',community:'Komunitas'};
    document.querySelectorAll('.desktop-links [data-route-link]').forEach(link=>{
      const value = labels[link.dataset.routeLink];
      if(value) link.textContent = value;
    });

    const sheet = document.querySelector('#mobileSheet');
    if(sheet){
      const mapping = [
        ['a[href="#downloads"]','Project'],
        ['a[href="#news"]','Update'],
        ['a[href="#community"]','Komunitas'],
        ['a[href="#feedback"]','Feedback'],
        ['a[href="#vote"]','Voting']
      ];
      mapping.forEach(([selector,text])=>{
        const el = sheet.querySelector(selector);
        if(!el) return;
        const icon = el.querySelector('svg')?.outerHTML || el.querySelector('img')?.outerHTML || '';
        el.innerHTML = icon + text;
      });
      sheet.querySelectorAll('[data-dlavie-account-link]').forEach(link=>{
        const value = link.textContent.trim().toLowerCase();
        if(value === 'account') setTextPreserveIcon(link,'Akun');
        if(value === 'sign in') setTextPreserveIcon(link,'Masuk');
      });
    }
  }

  function setTextPreserveIcon(el,text){
    if(!el) return;
    const icon = el.querySelector('svg')?.outerHTML || el.querySelector('img')?.outerHTML || '';
    el.innerHTML = icon + text;
  }

  function refinePages(){
    const downloads = document.querySelector('.page[data-route="downloads"]');
    if(downloads){
      setText('.eyebrow','DISCOVER',downloads);
      setText('.page-head h1','Project',downloads);
      setText('.page-head > p:last-child','Jelajahi shader, mod, dan resource pack yang dibagikan DLavie.',downloads);
      const input = downloads.querySelector('#projectSearch');
      if(input) input.placeholder = 'Cari project…';
    }

    const project = document.querySelector('.page[data-route="project"]');
    if(project){
      setText('.project-identity .eyebrow','SHADER • MINECRAFT BEDROCK',project);
      const download = project.querySelector('#downloadLatest');
      if(download){
        download.setAttribute('aria-label','Download DLavie Shader');
        download.title = 'Download versi terbaru';
      }
      const tabs = {description:'Deskripsi',changelog:'Changelog',versions:'Versi',license:'Lisensi'};
      project.querySelectorAll('[data-project-tab]').forEach(btn=>{
        if(tabs[btn.dataset.projectTab]) btn.textContent = tabs[btn.dataset.projectTab];
      });
    }

    const news = document.querySelector('.page[data-route="news"]');
    if(news){setText('.page-head h1','Update',news);setText('.eyebrow','NEWS',news)}
    const community = document.querySelector('.page[data-route="community"]');
    if(community){setText('.page-head h1','Komunitas',community);setText('.eyebrow','COMMUNITY',community)}
    const feedback = document.querySelector('.page[data-route="feedback"]');
    if(feedback){setText('.page-head h1','Feedback',feedback)}
  }

  function localizeSearch(){
    const input = document.querySelector('#globalSearch');
    if(input){input.placeholder='Cari di DLavie';input.setAttribute('aria-label','Cari di DLavie')}
    const results = document.querySelector('#searchResults');
    if(!results) return;
    const translate = () => {
      results.querySelectorAll('p').forEach(p=>{
        const t = p.textContent.trim();
        if(t.startsWith('Try “shader”')) p.textContent='Cari shader, changelog, versi, atau feedback.';
        else if(t === 'No results.') p.textContent='Tidak ada hasil.';
      });
    };
    translate();
    new MutationObserver(translate).observe(results,{childList:true,subtree:true});
  }

  function activeTheme(){ return root.dataset.theme === 'light' ? 'light' : 'dark'; }
  function applyTheme(theme){
    const value = theme === 'light' ? 'light' : 'dark';
    root.dataset.theme = value;
    try{localStorage.setItem(THEME_KEY,value)}catch{}
    const meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.content = value === 'light' ? '#f5f5f6' : '#111112';
  }

  function addThemeToggle(){
    const actions = document.querySelector('.header-actions');
    if(actions && !actions.querySelector('[data-mr-theme]')){
      const btn = document.createElement('button');
      btn.type='button';
      btn.className='icon-button';
      btn.dataset.mrTheme='true';
      btn.setAttribute('aria-label','Ganti tema');
      btn.innerHTML=moonIcon;
      btn.addEventListener('click',()=>applyTheme(activeTheme()==='dark'?'light':'dark'));
      actions.insertBefore(btn,actions.firstChild);
    }

    const sheet = document.querySelector('#mobileSheet');
    if(sheet && !sheet.querySelector('[data-mr-theme]')){
      const btn = document.createElement('button');
      btn.type='button';
      btn.className='sheet-action';
      btn.dataset.mrTheme='true';
      btn.innerHTML=moonIcon+'Tema';
      btn.addEventListener('click',()=>applyTheme(activeTheme()==='dark'?'light':'dark'));
      sheet.appendChild(btn);
    }
  }

  function init(){
    makeMobileTopbar();
    refineHome();
    localizeNavigation();
    refinePages();
    localizeSearch();
    addThemeToggle();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
