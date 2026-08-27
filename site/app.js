(() => {
  'use strict';

  const OWNER = 'drmacze';
  const HUB_REPO = 'DLavie-Shader';
  const API = 'https://api.github.com';

  const projects = [
    {name:'DLavie Shader',repo:'DLavie-Shader',type:'minecraft',label:'Minecraft · Shader',description:'Mobile-first Vibrant Visuals shader with vanilla-faithful PBR, volumetric godrays and scalable quality presets.'},
    {name:'DLavie Patches',repo:'DLavie-Patches',type:'tools',label:'Tools · Patches',description:'Patch distribution and supporting resources for DLavie projects.'},
    {name:'DLavie Meta',repo:'DLavie-Meta',type:'platform',label:'Platform · Metadata',description:'Metadata and shared configuration used across the DLavie ecosystem.'},
    {name:'DLavie AI Open',repo:'DLavie-AI-Open',type:'tools',label:'AI · Open Source',description:'Open experiments and utilities from the DLavie AI line.'},
    {name:'DLavie Market',repo:'dlaviemarket',type:'platform',label:'Platform · Marketplace',description:'DLavie marketplace experience and related web components.'},
    {name:'DLavie OS',repo:'DlavieOS',type:'platform',label:'Platform · OS',description:'Experimental DLavie operating experience and interface project.'}
  ];

  const downloads = [
    {name:'DLavie Shader',repo:'DLavie-Shader',type:'shader',status:'available',description:'Vibrant Visuals + PBR Enhanced shader for Minecraft Bedrock. Presets Low, Medium, High and Ultra.',format:'.mcpack'},
    {name:'DLavie Vanilla PBR',repo:'DLavie-Shader',type:'texture',status:'roadmap',description:'Vanilla-faithful PBR material library that keeps original Minecraft albedo while adding depth and material response.',format:'PBR pack'},
    {name:'DLavie Tools',repo:'DLavie-Patches',type:'tool',status:'source',description:'Utilities and patch resources from the DLavie ecosystem.',format:'Source'}
  ];

  const news = [
    {date:'27 AUG 2026',tag:'SHADER',title:'Godrays pass lands in DLavie Shader v0.1.2',body:'Terrain-aware volumetric fog and light shafts now create stronger sunlight through leaves, windows, roofs, and cave openings while keeping mobile performance in mind.'},
    {date:'27 AUG 2026',tag:'PLATFORM',title:'DLavie Hub gets a cleaner visual direction',body:'The hub is being rebuilt around clarity: strong typography, simple cards, focused actions, calmer color, and motion that supports navigation instead of distracting from it.'},
    {date:'ROADMAP',tag:'PBR',title:'Vanilla-first PBR remains the material direction',body:'Future material work keeps the original Minecraft texture identity while adding normals, roughness, metallic response, and emissive maps where useful.'}
  ];

  const votes = [
    {id:'pbr',title:'Vanilla PBR Material Pack',description:'Prioritize authored normal/MERS maps for core Minecraft blocks while keeping vanilla albedo textures.'},
    {id:'weather',title:'Weather & Atmosphere Pass',description:'Improve rain, overcast skies, fog transitions and storm lighting.'},
    {id:'water',title:'Water 2.0',description:'Focus on better water color, caustics, reflections and performance-scaled wave presets.'},
    {id:'community',title:'Community Accounts',description:'Add persistent profiles, comments, synced votes and contributor identity to DLavie Hub.'},
    {id:'gallery',title:'Showcase Gallery',description:'Add community screenshots, featured creations and curated visual comparisons.'},
    {id:'launcher',title:'Unified DLavie Launcher',description:'Connect downloads, updates and project discovery into one install/update flow.'}
  ];

  const state = {
    route:'home',
    projectFilter:'all',
    downloadFilter:'all',
    repoMeta:new Map(),
    releaseMeta:new Map(),
    reducedMotion:window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    lenis:null
  };

  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  function toast(message){
    const el = $('#toast');
    if(!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  async function api(path){
    const response = await fetch(API + path, {headers:{Accept:'application/vnd.github+json'}});
    if(!response.ok) throw new Error(`GitHub ${response.status}`);
    return response.json();
  }

  function relativeDate(iso){
    if(!iso) return '—';
    const diff = Math.max(0, Date.now() - new Date(iso).getTime());
    const days = Math.floor(diff / 86400000);
    if(days === 0) return 'today';
    if(days === 1) return '1d ago';
    if(days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  }

  async function loadRepoMeta(project){
    if(state.repoMeta.has(project.repo)) return state.repoMeta.get(project.repo);
    try{
      const meta = await api(`/repos/${OWNER}/${project.repo}`);
      state.repoMeta.set(project.repo, meta);
      return meta;
    }catch{
      const fallback = {html_url:`https://github.com/${OWNER}/${project.repo}`,stargazers_count:0,updated_at:null,language:null,archived:false};
      state.repoMeta.set(project.repo, fallback);
      return fallback;
    }
  }

  async function getLatestRelease(repo){
    if(state.releaseMeta.has(repo)) return state.releaseMeta.get(repo);
    try{
      const data = await api(`/repos/${OWNER}/${repo}/releases/latest`);
      state.releaseMeta.set(repo, data);
      return data;
    }catch{
      state.releaseMeta.set(repo, null);
      return null;
    }
  }

  function routeFromHash(){
    const raw = location.hash.replace(/^#\/?/, '').split('?')[0] || 'home';
    return $(`.page[data-route="${CSS.escape(raw)}"]`) ? raw : 'home';
  }

  function closeMobileMenu(){
    const button = $('#menuToggle');
    const menu = $('#mobileMenu');
    button?.setAttribute('aria-expanded','false');
    menu?.classList.remove('open');
    document.body.classList.remove('menu-open');
  }

  function animatePageIn(page){
    if(state.reducedMotion || !window.gsap) return;
    const targets = page.querySelectorAll('.page-hero > *, .hero > *, .content-section > *');
    gsap.killTweensOf(targets);
    gsap.fromTo(targets,{autoAlpha:0,y:18},{autoAlpha:1,y:0,duration:.65,stagger:.055,ease:'power3.out',clearProps:'transform,opacity,visibility'});
  }

  function renderRoute(){
    const nextRoute = routeFromHash();
    const current = $('.page.active');
    const next = $(`.page[data-route="${CSS.escape(nextRoute)}"]`);
    if(!next) return;

    const switchPage = () => {
      $$('.page').forEach(page => page.classList.toggle('active', page === next));
      $$('[data-route-link]').forEach(link => link.classList.toggle('active', link.dataset.routeLink === nextRoute));
      state.route = nextRoute;
      document.title = nextRoute === 'home' ? 'DLavie — Hub' : `${nextRoute[0].toUpperCase()+nextRoute.slice(1)} · DLavie`;
      closeMobileMenu();
      if(state.lenis) state.lenis.scrollTo(0,{immediate:true}); else window.scrollTo(0,0);
      $('#app')?.focus({preventScroll:true});
      if(nextRoute === 'community') loadActivity();
      requestAnimationFrame(() => {
        animatePageIn(next);
        setupScrollReveals();
        window.ScrollTrigger?.refresh();
      });
    };

    if(!current || current === next || state.reducedMotion || !window.gsap){
      switchPage();
      return;
    }

    gsap.to(current,{autoAlpha:0,y:8,duration:.18,ease:'power2.out',onComplete:() => {
      current.style.opacity = '';
      current.style.visibility = '';
      current.style.transform = '';
      switchPage();
    }});
  }

  async function updateHomeStats(){
    const count = $('#repoCount');
    if(count) count.textContent = String(projects.length);
    const releases = $('#releaseCount');
    if(!releases) return;
    try{
      const data = await api(`/repos/${OWNER}/${HUB_REPO}/releases?per_page=20`);
      releases.textContent = String(Array.isArray(data) ? data.length : 0);
    }catch{
      releases.textContent = '1';
    }
  }

  async function renderProjects(){
    const grid = $('#projectGrid');
    if(!grid) return;
    const q = ($('#projectSearch')?.value || '').trim().toLowerCase();
    const visible = projects.filter(project => (state.projectFilter === 'all' || project.type === state.projectFilter) && (!q || `${project.name} ${project.description} ${project.label}`.toLowerCase().includes(q)));
    if(!visible.length){
      grid.innerHTML = '<p class="empty-state">Tidak ada project yang cocok.</p>';
      return;
    }
    grid.innerHTML = visible.map(project => `<article class="catalog-card" data-reveal-card><div class="card-head"><span class="card-kind">${esc(project.label)}</span><span class="card-status">SYNCING</span></div><h3>${esc(project.name)}</h3><p>${esc(project.description)}</p><div class="card-meta"><span data-stars>☆ —</span><span data-updated>Updated —</span><span data-language></span></div><div class="card-actions"><a href="https://github.com/${OWNER}/${encodeURIComponent(project.repo)}" target="_blank" rel="noreferrer">Source ↗</a></div></article>`).join('');
    const cards = $$('.catalog-card', grid);
    visible.forEach(async (project, index) => {
      const meta = await loadRepoMeta(project);
      const card = cards[index];
      if(!card) return;
      $('.card-status', card).textContent = meta.archived ? 'ARCHIVED' : 'ACTIVE';
      $('[data-stars]', card).textContent = `☆ ${meta.stargazers_count ?? 0}`;
      $('[data-updated]', card).textContent = `Updated ${relativeDate(meta.updated_at)}`;
      $('[data-language]', card).textContent = meta.language || '';
    });
    animateCatalogCards(grid);
  }

  async function renderDownloads(){
    const grid = $('#downloadGrid');
    if(!grid) return;
    const q = ($('#downloadSearch')?.value || '').trim().toLowerCase();
    const visible = downloads.filter(item => (state.downloadFilter === 'all' || item.type === state.downloadFilter) && (!q || `${item.name} ${item.description} ${item.type}`.toLowerCase().includes(q)));
    if(!visible.length){
      grid.innerHTML = '<p class="empty-state">Tidak ada download yang cocok.</p>';
      return;
    }
    grid.innerHTML = visible.map(item => `<article class="catalog-card" data-reveal-card><div class="card-head"><span class="card-kind">${esc(item.type)}</span><span class="card-status">${item.status === 'available' ? 'CHECKING' : item.status.toUpperCase()}</span></div><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><div class="card-meta"><span>${esc(item.format)}</span><span data-release>${item.status === 'roadmap' ? 'Roadmap' : 'Latest release'}</span></div><div class="card-actions" data-actions></div></article>`).join('');
    const cards = $$('.catalog-card', grid);
    visible.forEach(async (item, index) => {
      const card = cards[index];
      if(!card) return;
      const actions = $('[data-actions]', card);
      if(item.status === 'roadmap'){
        actions.innerHTML = '<a class="primary-mini" href="#vote">Vote priority</a><a href="https://github.com/drmacze/DLavie-Shader" target="_blank" rel="noreferrer">Source ↗</a>';
        return;
      }
      if(item.status === 'source'){
        actions.innerHTML = `<a href="https://github.com/${OWNER}/${encodeURIComponent(item.repo)}" target="_blank" rel="noreferrer">Open source ↗</a>`;
        return;
      }
      const release = await getLatestRelease(item.repo);
      const status = $('.card-status', card);
      if(release){
        status.textContent = 'AVAILABLE';
        $('[data-release]', card).textContent = release.tag_name || 'Latest';
        const asset = (release.assets || []).find(asset => /\.(mcpack|mcaddon|zip)$/i.test(asset.name));
        actions.innerHTML = `${asset ? `<a class="primary-mini" href="${esc(asset.browser_download_url)}">Download ${esc(asset.name)}</a>` : ''}<a href="${esc(release.html_url)}" target="_blank" rel="noreferrer">Release notes ↗</a>`;
      }else{
        status.textContent = 'SOURCE';
        $('[data-release]', card).textContent = 'No GitHub Release yet';
        actions.innerHTML = `<a href="https://github.com/${OWNER}/${encodeURIComponent(item.repo)}" target="_blank" rel="noreferrer">Open repository ↗</a>`;
      }
    });
    animateCatalogCards(grid);
  }

  function renderNews(){
    const grid = $('#newsGrid');
    if(!grid) return;
    grid.innerHTML = news.map(item => `<article class="news-item" data-reveal-card><span class="news-date">${esc(item.date)}</span><div class="news-content"><h2>${esc(item.title)}</h2><p>${esc(item.body)}</p></div><span class="news-tag">${esc(item.tag)}</span></article>`).join('');
    animateCatalogCards(grid);
  }

  function voteIssueUrl(vote){
    const title = `[Vote] ${vote.title}`;
    const body = `## Community vote\n\nI vote for **${vote.title}**.\n\n### Why this matters to me\n\n<!-- Optional: tell us why -->\n\n---\nSubmitted from DLavie Hub.`;
    return `https://github.com/${OWNER}/${HUB_REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  }

  function renderVotes(){
    const grid = $('#voteGrid');
    if(!grid) return;
    grid.innerHTML = votes.map((vote,index) => `<article class="vote-card" data-reveal-card><span class="vote-number">0${index+1} / PRIORITY</span><h3>${esc(vote.title)}</h3><p>${esc(vote.description)}</p><button class="button button-secondary" type="button" data-vote="${esc(vote.id)}">Vote via GitHub ↗</button></article>`).join('');
    $$('[data-vote]', grid).forEach(button => button.addEventListener('click', () => {
      const vote = votes.find(item => item.id === button.dataset.vote);
      if(!vote) return;
      window.open(voteIssueUrl(vote), '_blank', 'noopener');
      toast(`Vote prepared: ${vote.title}`);
    }));
    animateCatalogCards(grid);
  }

  async function loadActivity(){
    const list = $('#activityList');
    if(!list || list.dataset.loaded === '1') return;
    try{
      const issues = await api(`/repos/${OWNER}/${HUB_REPO}/issues?state=open&per_page=6&sort=updated`);
      const clean = issues.filter(item => !item.pull_request).slice(0,5);
      list.innerHTML = clean.length ? clean.map(item => `<a class="activity-item" href="${esc(item.html_url)}" target="_blank" rel="noreferrer"><b>#${item.number} ${esc(item.title)}</b><span>Updated ${relativeDate(item.updated_at)} · ${esc(item.user?.login || 'community')}</span></a>`).join('') : '<p class="empty-state">Belum ada issue terbuka. Kamu bisa menjadi yang pertama.</p>';
      list.dataset.loaded = '1';
    }catch{
      list.innerHTML = '<p class="empty-state">Live activity sedang tidak tersedia.</p>';
    }
  }

  function bindFeedback(){
    $('#feedbackForm')?.addEventListener('submit', event => {
      event.preventDefault();
      const type = $('#feedbackType').value;
      const project = $('#feedbackProject').value;
      const title = $('#feedbackTitle').value.trim();
      const details = $('#feedbackDetails').value.trim();
      if(!title || !details){ toast('Lengkapi title dan details.'); return; }
      const issueTitle = `[${type}] ${project}: ${title}`;
      const body = `## ${type}\n\n**Project:** ${project}\n\n### Details\n${details}\n\n---\nSubmitted from DLavie Hub.`;
      window.open(`https://github.com/${OWNER}/${HUB_REPO}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(body)}`, '_blank', 'noopener');
      toast('Feedback prepared on GitHub.');
    });
  }

  function allSearchItems(){
    return [...projects.map(item => ({title:item.name,sub:item.label,text:`${item.name} ${item.description} ${item.label}`,href:'#projects'})),...downloads.map(item => ({title:item.name,sub:`Download · ${item.type}`,text:`${item.name} ${item.description}`,href:'#downloads'})),...news.map(item => ({title:item.title,sub:`News · ${item.date}`,text:`${item.title} ${item.body} ${item.tag}`,href:'#news'})),{title:'Community',sub:'Discuss & contribute',text:'community github issues feedback contribution',href:'#community'},{title:'Feedback',sub:'Report bugs & ideas',text:'feedback bug feature performance visual idea',href:'#feedback'},{title:'Vote',sub:'Shape the roadmap',text:'vote roadmap priority community',href:'#vote'}];
  }

  function renderGlobalSearch(){
    const query = ($('#globalSearch')?.value || '').trim().toLowerCase();
    const output = $('#globalResults');
    if(!output) return;
    if(!query){ output.innerHTML = '<p class="empty-state">Search projects, downloads, news, or community pages.</p>'; return; }
    const matches = allSearchItems().filter(item => item.text.toLowerCase().includes(query)).slice(0,10);
    output.innerHTML = matches.length ? matches.map(item => `<a class="result-item" href="${item.href}"><div><b>${esc(item.title)}</b><span>${esc(item.sub)}</span></div><span>↗</span></a>`).join('') : '<p class="empty-state">No results.</p>';
  }

  function openSearch(){
    const overlay = $('#searchOverlay');
    if(!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    document.body.classList.add('search-open');
    if(window.gsap && !state.reducedMotion){
      gsap.to(overlay,{autoAlpha:1,duration:.22,ease:'power2.out'});
      gsap.fromTo($('.search-panel',overlay),{y:14,scale:.985},{y:0,scale:1,duration:.35,ease:'power3.out'});
    }else overlay.style.opacity = '1';
    requestAnimationFrame(() => $('#globalSearch')?.focus());
  }

  function closeSearch(){
    const overlay = $('#searchOverlay');
    if(!overlay) return;
    const finish = () => {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden','true');
      overlay.style.opacity = '';
      document.body.classList.remove('search-open');
    };
    if(window.gsap && !state.reducedMotion) gsap.to(overlay,{autoAlpha:0,duration:.18,ease:'power2.in',onComplete:finish}); else finish();
  }

  function bindSearch(){
    $('#searchToggle')?.addEventListener('click', openSearch);
    $('#searchClose')?.addEventListener('click', closeSearch);
    $('#globalSearch')?.addEventListener('input', renderGlobalSearch);
    $('#searchOverlay')?.addEventListener('click', event => { if(event.target === event.currentTarget) closeSearch(); });
    document.addEventListener('keydown', event => {
      if(event.key === 'Escape'){ closeSearch(); closeMobileMenu(); }
      if((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'){ event.preventDefault(); openSearch(); }
    });
  }

  function bindFilters(){
    $('#projectSearch')?.addEventListener('input', renderProjects);
    $('#downloadSearch')?.addEventListener('input', renderDownloads);
    $$('[data-project-filter]').forEach(button => button.addEventListener('click', () => {
      state.projectFilter = button.dataset.projectFilter;
      $$('[data-project-filter]').forEach(item => item.classList.toggle('active', item === button));
      renderProjects();
    }));
    $$('[data-download-filter]').forEach(button => button.addEventListener('click', () => {
      state.downloadFilter = button.dataset.downloadFilter;
      $$('[data-download-filter]').forEach(item => item.classList.toggle('active', item === button));
      renderDownloads();
    }));
    $$('[data-filter-jump]').forEach(link => link.addEventListener('click', () => {
      state.downloadFilter = link.dataset.filterJump;
      setTimeout(() => {
        $$('[data-download-filter]').forEach(button => button.classList.toggle('active', button.dataset.downloadFilter === state.downloadFilter));
        renderDownloads();
      }, 0);
    }));
  }

  function bindFaq(){
    $$('.faq-item').forEach(item => {
      const button = $('button', item);
      const answer = $('.faq-answer', item);
      if(!button || !answer) return;
      button.addEventListener('click', () => {
        const open = item.classList.contains('open');
        $$('.faq-item.open').forEach(other => {
          if(other === item) return;
          other.classList.remove('open');
          $('button',other)?.setAttribute('aria-expanded','false');
          const otherAnswer = $('.faq-answer',other);
          if(otherAnswer && window.gsap && !state.reducedMotion) gsap.to(otherAnswer,{height:0,duration:.3,ease:'power2.inOut'}); else if(otherAnswer) otherAnswer.style.height = '0px';
        });
        item.classList.toggle('open', !open);
        button.setAttribute('aria-expanded', String(!open));
        const targetHeight = !open ? answer.scrollHeight : 0;
        if(window.gsap && !state.reducedMotion){
          gsap.to(answer,{height:targetHeight,duration:.38,ease:'power3.inOut',onComplete:() => { if(!open) answer.style.height = 'auto'; }});
        }else answer.style.height = !open ? 'auto' : '0px';
      });
    });
  }

  function bindMenu(){
    const button = $('#menuToggle');
    const menu = $('#mobileMenu');
    button?.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      menu?.classList.toggle('open', !open);
      document.body.classList.toggle('menu-open', !open);
      if(menu && window.gsap && !state.reducedMotion && !open) gsap.fromTo(menu,{autoAlpha:0,y:-8},{autoAlpha:1,y:0,duration:.25,ease:'power2.out'});
    });
    $$('#mobileMenu a').forEach(link => link.addEventListener('click', closeMobileMenu));
  }

  function animateCatalogCards(root){
    if(state.reducedMotion || !window.gsap) return;
    const cards = $$('[data-reveal-card]', root);
    gsap.fromTo(cards,{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.48,stagger:.045,ease:'power3.out',clearProps:'transform,opacity,visibility'});
  }

  function setupLenisAndGsap(){
    if(state.reducedMotion || !window.Lenis || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({duration:1.05,smoothWheel:true,syncTouch:false,touchMultiplier:1,wheelMultiplier:.9,anchors:true,autoResize:true});
    state.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function setupScrollReveals(){
    if(state.reducedMotion || !window.gsap || !window.ScrollTrigger) return;
    ScrollTrigger.getAll().forEach(trigger => { if(trigger.vars?.id?.startsWith('dlv-reveal')) trigger.kill(); });
    $$('.page.active [data-reveal]').forEach((element,index) => {
      gsap.fromTo(element,{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:.7,ease:'power3.out',scrollTrigger:{id:`dlv-reveal-${state.route}-${index}`,trigger:element,start:'top 86%',once:true}});
    });
    const shaderIcon = $('.page.active .shader-icon');
    if(shaderIcon){
      gsap.to(shaderIcon,{y:-10,ease:'none',scrollTrigger:{id:'dlv-reveal-parallax',trigger:shaderIcon,start:'top bottom',end:'bottom top',scrub:.5}});
    }
  }

  function setupHeaderMotion(){
    const header = $('#siteHeader');
    if(!header) return;
    const update = () => header.classList.toggle('scrolled', window.scrollY > 12);
    update();
    window.addEventListener('scroll', update, {passive:true});
  }

  function heroIntro(){
    if(state.reducedMotion || !window.gsap) return;
    const tl = gsap.timeline({defaults:{ease:'power3.out'}});
    tl.from('.hero-overline',{autoAlpha:0,y:12,duration:.45}).from('.hero-title',{autoAlpha:0,y:24,duration:.72},'-=.18').from('.hero-description',{autoAlpha:0,y:18,duration:.58},'-=.36').from('.hero-actions',{autoAlpha:0,y:14,duration:.48},'-=.3').from('.stats-wrap',{autoAlpha:0,y:20,duration:.55},'-=.18');
  }

  function init(){
    setupLenisAndGsap();
    setupHeaderMotion();
    bindMenu();
    bindSearch();
    bindFilters();
    bindFaq();
    bindFeedback();
    renderProjects();
    renderDownloads();
    renderNews();
    renderVotes();
    updateHomeStats();
    window.addEventListener('hashchange', renderRoute);
    renderRoute();
    heroIntro();
    requestAnimationFrame(setupScrollReveals);
  }

  init();
})();
