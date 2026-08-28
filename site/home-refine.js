(() => {
  'use strict';

  const THEME_KEY = 'dlavie.theme.v1';
  const root = document.documentElement;
  const home = document.querySelector('.page[data-route="home"]');

  const sunIcon = '<svg class="theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  const moonIcon = '<svg class="theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.4 8.4 0 0 1 9.8 3.5 8.8 8.8 0 1 0 20.5 14.2Z"/></svg>';

  function storedTheme(){
    try{
      const value = localStorage.getItem(THEME_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    }catch{return null;}
  }

  function preferredTheme(){
    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function activeTheme(){
    return root.dataset.theme === 'light' ? 'light' : 'dark';
  }

  function syncThemeMeta(theme){
    const meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.content = theme === 'light' ? '#f5f6f8' : '#101114';
  }

  function updateThemeControls(){
    const theme = activeTheme();
    const nextLabel = theme === 'dark' ? 'Gunakan tema terang' : 'Gunakan tema gelap';
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-label', nextLabel);
      button.setAttribute('title', nextLabel);
      button.setAttribute('aria-pressed', String(theme === 'light'));
      const label = button.querySelector('[data-theme-label]');
      if(label) label.textContent = theme === 'dark' ? 'Tema terang' : 'Tema gelap';
      if(!button.classList.contains('theme-toggle')){
        const sun = button.querySelector('.theme-icon-sun');
        const moon = button.querySelector('.theme-icon-moon');
        if(sun) sun.style.display = theme === 'light' ? '' : 'none';
        if(moon) moon.style.display = theme === 'dark' ? '' : 'none';
      }
    });
  }

  function applyTheme(theme,{persist=false}={}){
    const safe = theme === 'light' ? 'light' : 'dark';
    root.dataset.theme = safe;
    syncThemeMeta(safe);
    if(persist){
      try{ localStorage.setItem(THEME_KEY,safe); }catch{}
    }
    updateThemeControls();
  }

  function toggleTheme(){
    applyTheme(activeTheme() === 'dark' ? 'light' : 'dark',{persist:true});
  }

  function makeHeaderToggle(){
    const actions = document.querySelector('.header-actions');
    if(!actions || actions.querySelector('[data-theme-toggle]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-button theme-toggle';
    button.dataset.themeToggle = 'true';
    button.innerHTML = sunIcon + moonIcon;
    button.addEventListener('click',toggleTheme);
    actions.insertBefore(button,actions.firstChild);
  }

  function makeMobileToggle(){
    const sheet = document.querySelector('#mobileSheet');
    if(!sheet || sheet.querySelector('[data-theme-toggle]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sheet-action theme-sheet-toggle';
    button.dataset.themeToggle = 'true';
    button.innerHTML = `${sunIcon}${moonIcon}<span data-theme-label>Tema</span>`;
    button.addEventListener('click',toggleTheme);
    const account = sheet.querySelector('[data-dlavie-account-link]');
    if(account?.nextSibling) sheet.insertBefore(button,account.nextSibling);
    else sheet.appendChild(button);
  }

  function setText(selector,text,scope=document){
    const el = scope.querySelector(selector);
    if(el) el.textContent = text;
  }

  function refineHome(){
    if(!home || home.dataset.refined === 'true') return;
    home.dataset.refined = 'true';
    document.body.classList.add('home-refined');

    const hero = home.querySelector('.home-hero');
    const title = hero?.querySelector('h1');
    const primary = hero?.querySelector('.primary-button');
    const secondary = hero?.querySelector('.secondary-button');

    setText('.eyebrow','DLAVIE / MINECRAFT',hero);
    if(title) title.innerHTML = 'Shader & mod Minecraft,<br><span>tanpa ribet.</span>';
    setText('.hero-lede','Temukan project DLavie, cek kompatibilitas, baca perubahan, lalu download versi yang kamu butuhkan dari satu tempat yang jelas.',hero);
    if(primary){
      primary.href = '#project/dlavie-shader';
      primary.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 20h14"/></svg>DLavie Shader';
    }
    if(secondary){ secondary.href = '#downloads'; secondary.textContent = 'Lihat semua project'; }

    if(hero && !hero.querySelector('.home-meta-row')){
      const meta = document.createElement('div');
      meta.className = 'home-meta-row';
      meta.innerHTML = '<span><i></i>Bedrock Edition</span><span><i></i>Mobile-first</span><span><i></i>Versi & changelog jelas</span>';
      hero.querySelector('.hero-actions')?.insertAdjacentElement('afterend',meta);
    }

    const stats = home.querySelector('.stat-strip');
    const items = stats ? [...stats.children] : [];
    if(items[0]){ setText('strong','1',items[0]); setText('span','Project aktif',items[0]); }
    if(items[1]){ setText('strong','3',items[1]); setText('span','Versi tercatat',items[1]); }
    if(items[2]){ setText('strong','MIT',items[2]); setText('span','Lisensi source',items[2]); }

    const headings = [...home.querySelectorAll('.section-heading')];
    if(headings[0]){
      setText('.section-kicker','PROJECT UTAMA',headings[0]);
      setText('h2','Siap dicoba sekarang.',headings[0]);
      setText('a','Semua project →',headings[0]);
    }
    if(headings[1]){
      setText('.section-kicker','DIBUAT AGAR JELAS',headings[1]);
      setText('h2','Yang penting mudah ditemukan.',headings[1]);
    }

    const featured = home.querySelector('.featured-project');
    setText('.featured-copy > p','Shader Vibrant Visuals + PBR untuk Minecraft Bedrock dengan pencahayaan natural, godrays, material vanilla-faithful, dan preset performa untuk perangkat mobile.',featured || document);

    const cards = [...home.querySelectorAll('.principle-grid .surface-card')];
    const copy = [
      ['Download lebih cepat','Versi terbaru, kompatibilitas, changelog, dan tombol download ditempatkan dekat satu sama lain supaya tidak perlu mencari-cari.'],
      ['Informasi yang relevan','Setiap project menjelaskan platform, versi Minecraft, fitur utama, lisensi, serta riwayat update secara singkat.'],
      ['Tetap terhubung','Bug report, feedback, dan roadmap tetap tersedia tanpa mengganggu alur utama pengguna yang hanya ingin melihat atau mengunduh project.']
    ];
    cards.forEach((card,index) => {
      if(!copy[index]) return;
      setText('h3',copy[index][0],card);
      setText('p',copy[index][1],card);
    });
  }

  function polishNavigation(){
    const navCopy = {home:'Beranda',downloads:'Project',news:'Update',community:'Komunitas'};
    document.querySelectorAll('.desktop-links [data-route-link]').forEach(link => {
      const route = link.dataset.routeLink;
      if(navCopy[route]) link.textContent = navCopy[route];
    });

    const mobileHome = document.querySelector('.mobile-nav [data-route-link="home"] span');
    if(mobileHome) mobileHome.textContent = 'Beranda';
    setText('#mobileSearch span','Cari');
    setText('#mobileMenuOpen span','Menu');

    const sheet = document.querySelector('#mobileSheet');
    if(sheet){
      const labels = [
        ['a[href="#downloads"]','Project'],
        ['a[href="#news"]','Update'],
        ['a[href="#community"]','Komunitas'],
        ['a[href="#feedback"]','Feedback'],
        ['a[href="#vote"]','Voting']
      ];
      labels.forEach(([selector,text]) => {
        const el = sheet.querySelector(selector);
        if(!el) return;
        const svg = el.querySelector('svg')?.outerHTML || '';
        const img = el.querySelector('img')?.outerHTML || '';
        el.innerHTML = `${svg}${img}${text}`;
      });
    }
  }

  function polishPages(){
    const downloads = document.querySelector('.page[data-route="downloads"]');
    if(downloads){
      setText('.eyebrow','PROJECT DLAVIE',downloads);
      setText('.page-head h1','Project',downloads);
      setText('.page-head > p:last-child','Shader, mod, dan project Minecraft yang dibagikan DLavie. Pilih project untuk melihat detail, kompatibilitas, changelog, dan versi download.',downloads);
      const search = downloads.querySelector('#projectSearch');
      if(search) search.placeholder = 'Cari shader atau mod…';
    }

    const project = document.querySelector('.page[data-route="project"]');
    if(project){
      setText('.project-identity .eyebrow','MINECRAFT BEDROCK / SHADER',project);
      const download = project.querySelector('#downloadLatest');
      if(download){
        download.dataset.label = 'Download terbaru';
        download.setAttribute('aria-label','Download versi terbaru DLavie Shader');
        download.title = 'Download versi terbaru';
      }
      const share = project.querySelector('#copyProjectLink');
      if(share){ share.setAttribute('aria-label','Salin link project'); share.title = 'Salin link'; }
      const more = project.querySelector('#projectMore');
      if(more){ more.setAttribute('aria-label','Opsi lainnya'); more.title = 'Opsi lainnya'; }

      const tabNames = {description:'Ringkasan',changelog:'Perubahan',versions:'Versi',license:'Lisensi'};
      project.querySelectorAll('[data-project-tab]').forEach(button => {
        if(tabNames[button.dataset.projectTab]) button.textContent = tabNames[button.dataset.projectTab];
      });
    }

    const news = document.querySelector('.page[data-route="news"]');
    if(news){
      setText('.eyebrow','PERKEMBANGAN',news);
      setText('.page-head h1','Update',news);
      setText('.page-head > p:last-child','Catatan rilis dan perkembangan project DLavie yang sedang aktif.',news);
    }

    const community = document.querySelector('.page[data-route="community"]');
    if(community){
      setText('.eyebrow','KOMUNITAS',community);
      setText('.page-head h1','Ikut membangun.',community);
      setText('.page-head > p:last-child','Laporkan bug, berikan saran, atau bantu menentukan prioritas pengembangan berikutnya.',community);
    }

    const feedback = document.querySelector('.page[data-route="feedback"]');
    if(feedback){
      setText('.eyebrow','FEEDBACK',feedback);
      setText('.page-head h1','Ada yang perlu diperbaiki?',feedback);
      setText('.page-head > p:last-child','Kirim laporan yang jelas agar bug, masalah performa, atau ide fitur bisa dilacak dengan mudah.',feedback);
    }
  }

  function polishFooter(){
    const footer = document.querySelector('.site-footer');
    if(!footer) return;
    const labels = [
      ['a[href="#downloads"]','Project'],
      ['a[href="#community"]','Komunitas'],
      ['a[href="#feedback"]','Feedback'],
      ['a[href="#vote"]','Voting']
    ];
    labels.forEach(([selector,text]) => setText(selector,text,footer));
  }

  function init(){
    applyTheme(root.dataset.theme || storedTheme() || preferredTheme());
    refineHome();
    polishNavigation();
    polishPages();
    polishFooter();
    makeHeaderToggle();
    makeMobileToggle();
    updateThemeControls();

    const sheet = document.querySelector('#mobileSheet');
    if(sheet){
      const observer = new MutationObserver(() => {
        makeMobileToggle();
        polishNavigation();
      });
      observer.observe(sheet,{childList:true});
    }

    const media = matchMedia('(prefers-color-scheme: light)');
    media.addEventListener?.('change',event => {
      if(!storedTheme()) applyTheme(event.matches ? 'light' : 'dark');
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
