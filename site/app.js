(() => {
  'use strict';

  const OWNER = 'drmacze';
  const HUB_REPO = 'DLavie-Shader';
  const API = 'https://api.github.com';

  const projects = [
    {name:'DLavie Shader',repo:'DLavie-Shader',type:'minecraft',label:'Minecraft · Shader',description:'Mobile-first Vibrant Visuals shader with vanilla-faithful PBR, volumetric godrays and scalable quality presets.',accent:'sun'},
    {name:'DLavie Patches',repo:'DLavie-Patches',type:'tools',label:'Tools · Patches',description:'Patch distribution and supporting resources for DLavie projects.',accent:'patch'},
    {name:'DLavie Meta',repo:'DLavie-Meta',type:'platform',label:'Platform · Metadata',description:'Metadata and shared configuration used across the DLavie ecosystem.',accent:'meta'},
    {name:'DLavie AI Open',repo:'DLavie-AI-Open',type:'tools',label:'AI · Open Source',description:'Open experiments and tools from the DLavie AI line.',accent:'ai'},
    {name:'DLavie Market',repo:'dlaviemarket',type:'platform',label:'Platform · Marketplace',description:'DLavie marketplace experience and related web components.',accent:'market'},
    {name:'DLavie OS',repo:'DlavieOS',type:'platform',label:'Platform · OS',description:'Experimental DLavie operating experience and interface project.',accent:'os'}
  ];

  const downloads = [
    {name:'DLavie Shader',repo:'DLavie-Shader',type:'shader',status:'available',description:'Vibrant Visuals + PBR Enhanced shader for Minecraft Bedrock. Presets Low, Medium, High and Ultra.',format:'.mcpack'},
    {name:'DLavie Vanilla PBR',repo:'DLavie-Shader',type:'texture',status:'roadmap',description:'Vanilla-faithful PBR material library. Maintains the original Minecraft texture identity while adding depth and material response.',format:'PBR pack'},
    {name:'DLavie Tools',repo:'DLavie-Patches',type:'tool',status:'source',description:'Utilities and patch resources from the DLavie ecosystem.',format:'Source'}
  ];

  const news = [
    {date:'27 AUG 2026',tag:'SHADER',title:'Godrays pass lands in DLavie Shader v0.1.2',body:'DLavie Shader now uses terrain-aware volumetric fog and light shafts, plus time-of-day Mie and glare tuning for stronger sunlight through leaves, windows and cave openings.'},
    {date:'27 AUG 2026',tag:'PLATFORM',title:'DLavie Hub starts here',body:'The shader repository now also contains the first version of DLavie Hub — a central home for projects, downloads, news, community feedback and voting.'},
    {date:'ROADMAP',tag:'PBR',title:'Vanilla-first PBR remains the material direction',body:'The goal is not to replace Minecraft textures. Future material packs will enrich the vanilla look with normals, roughness, metallic response and emissive maps.'}
  ];

  const votes = [
    {id:'pbr',title:'Vanilla PBR Material Pack',description:'Prioritize authored normal/MERS maps for core Minecraft blocks while keeping vanilla albedo textures.'},
    {id:'weather',title:'Weather & Atmosphere Pass',description:'Push rain, overcast skies, fog transitions and storm lighting to feel more cinematic and natural.'},
    {id:'water',title:'Water 2.0',description:'Focus on better water color, caustics, reflections and performance-scaled wave presets.'},
    {id:'community',title:'Community Accounts',description:'Build persistent profiles, comments, synced votes and contributor identity into DLavie Hub.'},
    {id:'gallery',title:'Showcase Gallery',description:'Add community screenshots, featured creations and curated visual comparisons.'},
    {id:'launcher',title:'Unified DLavie Launcher',description:'Connect downloads, updates and project discovery into one install/update flow.'}
  ];

  const state = { route:'home', projectFilter:'all', downloadFilter:'all', repoMeta:new Map(), releaseMeta:new Map() };
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  function toast(message){
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove('show'), 2400);
  }

  function routeFromHash(){
    const raw = location.hash.replace(/^#\/?/, '').split('?')[0] || 'home';
    return $('.page[data-route="'+CSS.escape(raw)+'"]') ? raw : 'home';
  }

  function renderRoute(){
    state.route = routeFromHash();
    $$('.page').forEach(p => p.classList.toggle('active', p.dataset.route === state.route));
    $$('[data-route-link]').forEach(a => a.classList.toggle('active', a.dataset.routeLink === state.route));
    document.title = state.route === 'home' ? 'DLavie Hub' : `${state.route[0].toUpperCase()+state.route.slice(1)} · DLavie`;
    window.scrollTo({top:0,behavior:'instant'});
    $('#app')?.focus({preventScroll:true});
    if(state.route === 'community') loadActivity();
  }

  async function api(path){
    const res = await fetch(API + path, {headers:{Accept:'application/vnd.github+json'}});
    if(!res.ok) throw new Error(`GitHub ${res.status}`);
    return res.json();
  }

  async function loadRepoMeta(project){
    if(state.repoMeta.has(project.repo)) return state.repoMeta.get(project.repo);
    try{
      const meta = await api(`/repos/${OWNER}/${project.repo}`);
      state.repoMeta.set(project.repo, meta);
      return meta;
    }catch{
      const fallback = {html_url:`https://github.com/${OWNER}/${project.repo}`,stargazers_count:0,updated_at:null,language:null,open_issues_count:0};
      state.repoMeta.set(project.repo, fallback);
      return fallback;
    }
  }

  function relativeDate(iso){
    if(!iso) return '—';
    const diff = Math.max(0, Date.now() - new Date(iso).getTime());
    const days = Math.floor(diff / 86400000);
    if(days === 0) return 'today';
    if(days === 1) return '1d ago';
    if(days < 30) return `${days}d ago`;
    const months = Math.floor(days/30);
    return `${months}mo ago`;
  }

  async function renderProjects(){
    const grid = $('#projectGrid');
    if(!grid) return;
    const q = ($('#projectSearch')?.value || '').trim().toLowerCase();
    const visible = projects.filter(p => (state.projectFilter === 'all' || p.type === state.projectFilter) && (!q || `${p.name} ${p.description} ${p.label}`.toLowerCase().includes(q)));
    if(!visible.length){ grid.innerHTML = '<p class="empty-state">Tidak ada project yang cocok.</p>'; return; }
    grid.innerHTML = visible.map(p => `<article class="project-card"><div class="card-top"><span class="project-type">${esc(p.label)}</span><span class="repo-state">SYNCING</span></div><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="card-meta"><span data-stars>☆ —</span><span data-updated>Updated —</span><span data-language></span></div><div class="card-actions"><a href="https://github.com/${OWNER}/${encodeURIComponent(p.repo)}" target="_blank" rel="noreferrer">Source ↗</a></div></article>`).join('');
    const cards = $$('.project-card', grid);
    visible.forEach(async (p, i) => {
      const meta = await loadRepoMeta(p);
      const card = cards[i]; if(!card) return;
      $('.repo-state',card).textContent = meta.archived ? 'ARCHIVED' : 'ACTIVE';
      $('[data-stars]',card).textContent = `☆ ${meta.stargazers_count ?? 0}`;
      $('[data-updated]',card).textContent = `Updated ${relativeDate(meta.updated_at)}`;
      $('[data-language]',card).textContent = meta.language || '';
    });
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

  async function renderDownloads(){
    const grid = $('#downloadGrid'); if(!grid) return;
    const q = ($('#downloadSearch')?.value || '').trim().toLowerCase();
    const visible = downloads.filter(d => (state.downloadFilter === 'all' || d.type === state.downloadFilter) && (!q || `${d.name} ${d.description} ${d.type}`.toLowerCase().includes(q)));
    grid.innerHTML = visible.map(d => `<article class="download-card"><div class="card-top"><span class="project-type">${esc(d.type)}</span><span class="repo-state">${d.status === 'available' ? 'CHECKING' : d.status.toUpperCase()}</span></div><h3>${esc(d.name)}</h3><p>${esc(d.description)}</p><div class="card-meta"><span>${esc(d.format)}</span><span data-release>${d.status === 'roadmap' ? 'Roadmap' : 'Latest release'}</span></div><div class="card-actions" data-actions></div></article>`).join('');
    const cards = $$('.download-card',grid);
    visible.forEach(async (d,i) => {
      const card = cards[i]; if(!card) return;
      const actions = $('[data-actions]',card);
      if(d.status === 'roadmap'){
        actions.innerHTML = '<a href="#vote">Vote priority</a><a href="https://github.com/drmacze/DLavie-Shader" target="_blank" rel="noreferrer">Source ↗</a>';
        return;
      }
      if(d.status === 'source'){
        actions.innerHTML = `<a href="https://github.com/${OWNER}/${encodeURIComponent(d.repo)}" target="_blank" rel="noreferrer">Open source ↗</a>`;
        return;
      }
      const release = await getLatestRelease(d.repo);
      const status = $('.repo-state',card);
      if(release){
        status.textContent = 'AVAILABLE';
        $('[data-release]',card).textContent = release.tag_name || 'Latest';
        const asset = (release.assets || []).find(a => /\.(mcpack|mcaddon|zip)$/i.test(a.name));
        actions.innerHTML = `${asset ? `<a href="${esc(asset.browser_download_url)}">Download ${esc(asset.name)}</a>` : ''}<a href="${esc(release.html_url)}" target="_blank" rel="noreferrer">Release notes ↗</a>`;
      }else{
        status.textContent = 'SOURCE';
        $('[data-release]',card).textContent = 'No GitHub Release yet';
        actions.innerHTML = `<a href="https://github.com/${OWNER}/${encodeURIComponent(d.repo)}" target="_blank" rel="noreferrer">Open repository ↗</a>`;
      }
    });
  }

  function renderNews(){
    const grid = $('#newsGrid'); if(!grid) return;
    grid.innerHTML = news.map(n => `<article class="news-card"><div class="tag-row"><span class="tag">${esc(n.tag)}</span></div><time>${esc(n.date)}</time><h2>${esc(n.title)}</h2><p>${esc(n.body)}</p></article>`).join('');
  }

  function voteIssueUrl(v){
    const title = `[Vote] ${v.title}`;
    const body = `## Community vote\n\nI vote for **${v.title}**.\n\n### Why this matters to me\n\n<!-- Optional: tell us why -->\n\n---\nSubmitted from DLavie Hub.`;
    return `https://github.com/${OWNER}/${HUB_REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  }

  function renderVotes(){
    const grid = $('#voteGrid'); if(!grid) return;
    grid.innerHTML = votes.map((v,i) => `<article class="vote-card"><span class="vote-number">0${i+1} / PRIORITY</span><h3>${esc(v.title)}</h3><p>${esc(v.description)}</p><button class="glass-btn" type="button" data-vote="${esc(v.id)}">Vote via GitHub ↗</button></article>`).join('');
    $$('[data-vote]',grid).forEach(btn => btn.addEventListener('click', () => {
      const v = votes.find(x => x.id === btn.dataset.vote); if(!v) return;
      window.open(voteIssueUrl(v),'_blank','noopener');
      try{localStorage.setItem('dlavie_last_vote',v.id);}catch{}
      toast(`Vote prepared: ${v.title}`);
    }));
  }

  async function loadActivity(){
    const list = $('#activityList'); if(!list || list.dataset.loaded === '1') return;
    try{
      const issues = await api(`/repos/${OWNER}/${HUB_REPO}/issues?state=open&per_page=6&sort=updated`);
      const clean = issues.filter(x => !x.pull_request).slice(0,5);
      list.innerHTML = clean.length ? clean.map(x => `<a class="activity-item" href="${esc(x.html_url)}" target="_blank" rel="noreferrer"><b>#${x.number} ${esc(x.title)}</b><span>Updated ${relativeDate(x.updated_at)} · ${esc(x.user?.login || 'community')}</span></a>`).join('') : '<p class="empty-state">Belum ada issue terbuka. Kamu bisa menjadi yang pertama.</p>';
      list.dataset.loaded = '1';
    }catch{ list.innerHTML = '<p class="empty-state">Live activity sedang tidak tersedia.</p>'; }
  }

  function bindFeedback(){
    $('#feedbackForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const type = $('#feedbackType').value;
      const project = $('#feedbackProject').value;
      const title = $('#feedbackTitle').value.trim();
      const details = $('#feedbackDetails').value.trim();
      if(!title || !details){ toast('Lengkapi title dan details.'); return; }
      const issueTitle = `[${type}] ${project}: ${title}`;
      const body = `## ${type}\n\n**Project:** ${project}\n\n### Details\n${details}\n\n---\nSubmitted from DLavie Hub.`;
      window.open(`https://github.com/${OWNER}/${HUB_REPO}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(body)}`,'_blank','noopener');
      toast('Feedback prepared on GitHub.');
    });
  }

  function allSearchItems(){
    return [
      ...projects.map(x => ({title:x.name,sub:x.label,text:`${x.name} ${x.description} ${x.label}`,href:'#projects'})),
      ...downloads.map(x => ({title:x.name,sub:`Download · ${x.type}`,text:`${x.name} ${x.description}`,href:'#downloads'})),
      ...news.map(x => ({title:x.title,sub:`News · ${x.date}`,text:`${x.title} ${x.body} ${x.tag}`,href:'#news'})),
      {title:'Community',sub:'Discuss & contribute',text:'community github discussion feedback contribution',href:'#community'},
      {title:'Feedback',sub:'Report bugs & ideas',text:'feedback bug feature performance visual idea',href:'#feedback'},
      {title:'Vote',sub:'Shape the roadmap',text:'vote roadmap priority community',href:'#vote'}
    ];
  }

  function renderGlobalSearch(){
    const q = ($('#globalSearch')?.value || '').trim().toLowerCase();
    const out = $('#globalResults'); if(!out) return;
    if(!q){out.innerHTML='<p class="empty-state">Cari project, download, atau berita.</p>';return;}
    const matches = allSearchItems().filter(x => x.text.toLowerCase().includes(q)).slice(0,10);
    out.innerHTML = matches.length ? matches.map(x => `<a class="result-item" href="${x.href}"><div><b>${esc(x.title)}</b><br><span>${esc(x.sub)}</span></div><span>→</span></a>`).join('') : '<p class="empty-state">Tidak ada hasil.</p>';
    $$('.result-item',out).forEach(a => a.addEventListener('click', closeSearch));
  }

  function openSearch(){ const overlay=$('#searchOverlay');overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');setTimeout(()=>$('#globalSearch')?.focus(),30); }
  function closeSearch(){ const overlay=$('#searchOverlay');overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true'); }

  function bindFilters(){
    $('#projectSearch')?.addEventListener('input',renderProjects);
    $('#downloadSearch')?.addEventListener('input',renderDownloads);
    $$('[data-project-filter]').forEach(b => b.addEventListener('click',()=>{state.projectFilter=b.dataset.projectFilter;$$('[data-project-filter]').forEach(x=>x.classList.toggle('active',x===b));renderProjects();}));
    $$('[data-download-filter]').forEach(b => b.addEventListener('click',()=>{state.downloadFilter=b.dataset.downloadFilter;$$('[data-download-filter]').forEach(x=>x.classList.toggle('active',x===b));renderDownloads();}));
    $$('[data-filter-jump]').forEach(a => a.addEventListener('click',()=>{state.downloadFilter=a.dataset.filterJump;setTimeout(()=>{$$('[data-download-filter]').forEach(x=>x.classList.toggle('active',x.dataset.downloadFilter===state.downloadFilter));renderDownloads();},20);}));
  }

  function init(){
    addEventListener('hashchange',renderRoute);
    $('#searchToggle')?.addEventListener('click',openSearch);
    $('#searchClose')?.addEventListener('click',closeSearch);
    $('#searchOverlay')?.addEventListener('click',e=>{if(e.target.id==='searchOverlay')closeSearch();});
    $('#globalSearch')?.addEventListener('input',renderGlobalSearch);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSearch();if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}});
    bindFilters(); bindFeedback(); renderNews(); renderVotes(); renderProjects(); renderDownloads(); renderRoute();
    $('#repoCount').textContent = projects.length;
  }

  init();
})();