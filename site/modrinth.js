(() => {
  'use strict';

  const OWNER = 'drmacze';
  const REPO = 'DLavie-Shader';
  const API = 'https://api.github.com';
  const versions = [
    {version:'0.1.2',name:'Godrays Pass',current:true,date:'27 Aug 2026',notes:'Terrain-aware volumetric godrays, scattering keyframes, and four volumetric quality profiles.'},
    {version:'0.1.1',name:'Import Fix',date:'27 Aug 2026',notes:'Fixed .mcpack import structure and manifest verification.'},
    {version:'0.1.0',name:'Foundation',date:'27 Aug 2026',notes:'Initial Vibrant Visuals + PBR architecture with Low / Medium / High / Ultra presets.'}
  ];
  const votes = [
    {id:'pbr',title:'Vanilla PBR Material Pack',description:'Build authored normal/MERS maps for core blocks while preserving vanilla albedo textures.'},
    {id:'weather',title:'Weather & Atmosphere',description:'Improve rain, overcast lighting, fog transitions, and storm mood.'},
    {id:'water',title:'Water 2.0',description:'Push water color, caustics, reflections, and scalable waves.'},
    {id:'perf',title:'Mobile Performance Pass',description:'Profile thermals and frame pacing on more mobile devices and tune presets.'},
    {id:'gallery',title:'Comparison Gallery',description:'Add curated before/after and preset comparison captures to the project page.'},
    {id:'installer',title:'Cleaner Install Flow',description:'Improve how release files, compatibility, and install steps are surfaced.'}
  ];

  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];
  const state = { route:'home', tab:'description', repo:null, release:null, lenis:null };

  const toast = message => {
    const el = $('#toast');
    if(!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2200);
  };

  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function parseHash(){
    const raw = location.hash.replace(/^#\/?/, '') || 'home';
    const [path, queryString=''] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    const params = new URLSearchParams(queryString);
    if(parts[0] === 'project') return {route:'project',slug:parts[1] || 'dlavie-shader',tab:params.get('tab') || 'description'};
    const route = ['home','downloads','news','community','feedback','vote'].includes(parts[0]) ? parts[0] : 'home';
    return {route,tab:null};
  }

  function scrollTop(){
    if(state.lenis) state.lenis.scrollTo(0,{immediate:true}); else window.scrollTo(0,0);
  }

  function route(){
    const next = parseHash();
    state.route = next.route;
    $$('.page').forEach(p => p.classList.toggle('active', p.dataset.route === state.route));
    $$('[data-route-link]').forEach(a => a.classList.toggle('active', a.dataset.routeLink === state.route));
    if(state.route === 'project') setProjectTab(next.tab || 'description', false);
    document.title = state.route === 'project' ? 'DLavie Shader — DLavie' : state.route === 'home' ? 'DLavie' : `${state.route[0].toUpperCase()+state.route.slice(1)} — DLavie`;
    scrollTop();
    requestAnimationFrame(() => {
      refreshMotion();
      if(window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  function initSmoothScroll(){
    if(!window.Lenis) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced) return;
    state.lenis = new Lenis({duration:1.05,smoothWheel:true,touchMultiplier:1.05});
    if(window.gsap && window.ScrollTrigger){
      gsap.registerPlugin(ScrollTrigger);
      state.lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => state.lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = time => {state.lenis.raf(time);requestAnimationFrame(raf)};
      requestAnimationFrame(raf);
    }
  }

  function refreshMotion(){
    if(!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.killTweensOf('.page.active .reveal-group > *');
    gsap.fromTo('.page.active .reveal-group > *',{y:22,opacity:0},{y:0,opacity:1,duration:.65,stagger:.07,ease:'power3.out'});
    if(window.ScrollTrigger){
      $$('.page.active .reveal').forEach(el => {
        gsap.fromTo(el,{y:24,opacity:0},{y:0,opacity:1,duration:.65,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
      });
    }
  }

  async function api(path){
    const res = await fetch(API + path,{headers:{Accept:'application/vnd.github+json'}});
    if(!res.ok) throw new Error(`GitHub ${res.status}`);
    return res.json();
  }

  function relativeDate(iso){
    if(!iso) return '—';
    const d = Math.floor((Date.now()-new Date(iso).getTime())/86400000);
    if(d <= 0) return 'today'; if(d===1) return '1 day ago'; if(d<30) return `${d} days ago`; return `${Math.floor(d/30)} months ago`;
  }

  async function loadProjectMeta(){
    try{
      state.repo = await api(`/repos/${OWNER}/${REPO}`);
      $('#starStat').textContent = state.repo.stargazers_count ?? 0;
      $('#updatedStat').textContent = relativeDate(state.repo.updated_at);
    }catch{}
    try{
      state.release = await api(`/repos/${OWNER}/${REPO}/releases/latest`);
      const total = (state.release.assets || []).reduce((n,a) => n + (a.download_count || 0),0);
      $('#downloadStat').textContent = total || '—';
    }catch{
      state.release = null;
    }
    renderVersions();
  }

  function releaseAsset(){
    if(!state.release) return null;
    return (state.release.assets || []).find(a => /\.(mcpack|mcaddon|zip)$/i.test(a.name)) || null;
  }

  function latestDownloadUrl(){
    const asset = releaseAsset();
    if(asset) return asset.browser_download_url;
    if(state.release?.html_url) return state.release.html_url;
    return `https://github.com/${OWNER}/${REPO}/archive/refs/heads/main.zip`;
  }

  function renderVersions(){
    const list = $('#versionList');
    if(!list) return;
    const asset = releaseAsset();
    list.innerHTML = versions.map(v => {
      const canDirect = v.current && asset;
      const primaryHref = canDirect ? asset.browser_download_url : `https://github.com/${OWNER}/${REPO}/archive/refs/heads/main.zip`;
      const primaryText = canDirect ? 'Download pack' : 'Source ZIP';
      return `<article class="version-card"><div><div class="project-title-row"><h3>${esc(v.version)} — ${esc(v.name)}</h3>${v.current?'<span class="version-label current">CURRENT</span>':''}</div><p>${esc(v.notes)}</p><div class="chip-row"><span>${esc(v.date)}</span><span>Minecraft Bedrock</span>${v.current?'<span>Vibrant Visuals</span>':''}</div></div><div class="version-actions"><a class="download-version" href="${esc(primaryHref)}" target="_blank" rel="noreferrer">${primaryText}</a><a href="https://github.com/${OWNER}/${REPO}/blob/main/CHANGELOG.md" target="_blank" rel="noreferrer">Changelog</a></div></article>`;
    }).join('');
  }

  function setProjectTab(tab, updateHash=true){
    const allowed = ['description','changelog','versions','license'];
    tab = allowed.includes(tab) ? tab : 'description';
    state.tab = tab;
    $$('[data-project-tab]').forEach(b => b.classList.toggle('active',b.dataset.projectTab===tab));
    $$('[data-tab-panel]').forEach(p => p.classList.toggle('active',p.dataset.tabPanel===tab));
    if(updateHash && state.route === 'project') history.replaceState(null,'',`#project/dlavie-shader?tab=${tab}`);
    requestAnimationFrame(() => {if(window.ScrollTrigger) ScrollTrigger.refresh()});
  }

  function bindTabs(){
    $$('[data-project-tab]').forEach(btn => btn.addEventListener('click',()=>setProjectTab(btn.dataset.projectTab)));
  }

  function bindProjectActions(){
    $('#downloadLatest')?.addEventListener('click',()=>window.open(latestDownloadUrl(),'_blank','noopener'));
    const copy = async () => {try{await navigator.clipboard.writeText(`${location.origin}${location.pathname}#project/dlavie-shader`);toast('Project link copied.')}catch{toast('Could not copy link.')}};
    $('#copyProjectLink')?.addEventListener('click',copy);
    $('#copyPermanent')?.addEventListener('click',copy);
    const more = $('#projectMore'), menu = $('#projectMenu');
    more?.addEventListener('click',e=>{e.stopPropagation();const open=menu.hidden;menu.hidden=!open;more.setAttribute('aria-expanded',String(open))});
    document.addEventListener('click',e=>{if(menu && !menu.hidden && !e.target.closest('.more-wrap')){menu.hidden=true;more?.setAttribute('aria-expanded','false')}});
    $('#refreshRelease')?.addEventListener('click',async()=>{state.release=null;await loadProjectMeta();toast('Release data refreshed.')});
  }

  function bindProjectSearch(){
    $('#projectSearch')?.addEventListener('input',e=>{
      const q=e.target.value.toLowerCase().trim();
      $$('.project-row').forEach(row=>row.hidden=!!q && !row.dataset.projectName.includes(q));
    });
  }

  function voteUrl(v){
    const title=`[Vote] DLavie Shader: ${v.title}`;
    const body=`## Roadmap vote\n\nI vote for **${v.title}**.\n\n### Why\n\n<!-- Optional -->\n\n---\nSubmitted from DLavie.`;
    return `https://github.com/${OWNER}/${REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  }

  function renderVotes(){
    const grid=$('#voteGrid'); if(!grid)return;
    grid.innerHTML=votes.map((v,i)=>`<article class="vote-card"><span class="card-number">0${i+1} / ROADMAP</span><h2>${esc(v.title)}</h2><p>${esc(v.description)}</p><button class="secondary-button" data-vote="${esc(v.id)}" type="button">Vote via GitHub ↗</button></article>`).join('');
    $$('[data-vote]',grid).forEach(b=>b.addEventListener('click',()=>{const v=votes.find(x=>x.id===b.dataset.vote);if(v)window.open(voteUrl(v),'_blank','noopener')}));
  }

  function bindFeedback(){
    $('#feedbackForm')?.addEventListener('submit',e=>{
      e.preventDefault();
      const type=$('#feedbackType').value,project=$('#feedbackProject').value,title=$('#feedbackTitle').value.trim(),details=$('#feedbackDetails').value.trim();
      if(!title||!details)return;
      const issueTitle=`[${type}] ${project}: ${title}`;
      const body=`## ${type}\n\n**Project:** ${project}\n\n### Details\n${details}\n\n---\nSubmitted from DLavie.`;
      window.open(`https://github.com/${OWNER}/${REPO}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(body)}`,'_blank','noopener');
    });
  }

  const searchItems = [
    {title:'DLavie Shader',sub:'Project',href:'#project/dlavie-shader',keys:'shader minecraft bedrock pbr vibrant visuals download'},
    {title:'Shader changelog',sub:'DLavie Shader',href:'#project/dlavie-shader?tab=changelog',keys:'changelog godrays import fix foundation'},
    {title:'Shader versions',sub:'DLavie Shader',href:'#project/dlavie-shader?tab=versions',keys:'versions 0.1.2 0.1.1 0.1.0 download'},
    {title:'Shader license',sub:'MIT',href:'#project/dlavie-shader?tab=license',keys:'license mit source'},
    {title:'News',sub:'Development',href:'#news',keys:'news release development'},
    {title:'Community',sub:'Issues & feedback',href:'#community',keys:'community issues feedback'},
    {title:'Feedback',sub:'Send an issue',href:'#feedback',keys:'feedback bug performance visual'},
    {title:'Vote',sub:'Shader roadmap',href:'#vote',keys:'vote roadmap feature pbr water weather'}
  ];

  function openSearch(){const o=$('#searchOverlay');o.hidden=false;document.body.style.overflow='hidden';setTimeout(()=>$('#globalSearch')?.focus(),40)}
  function closeSearch(){const o=$('#searchOverlay');o.hidden=true;document.body.style.overflow=''}
  function bindSearch(){
    $('#searchOpen')?.addEventListener('click',openSearch);$('#mobileSearch')?.addEventListener('click',openSearch);$('#searchClose')?.addEventListener('click',closeSearch);
    $('#searchOverlay')?.addEventListener('click',e=>{if(e.target.id==='searchOverlay')closeSearch()});
    $('#globalSearch')?.addEventListener('input',e=>{const q=e.target.value.toLowerCase().trim(),out=$('#searchResults');if(!q){out.innerHTML='<p>Try “shader”, “changelog”, “versions”, or “feedback”.</p>';return}const matches=searchItems.filter(x=>(x.title+' '+x.sub+' '+x.keys).toLowerCase().includes(q));out.innerHTML=matches.length?matches.map(x=>`<a href="${x.href}" data-search-result><b>${esc(x.title)}</b><span>${esc(x.sub)}</span></a>`).join(''):'<p>No results.</p>';$$('[data-search-result]',out).forEach(a=>a.addEventListener('click',closeSearch))});
  }

  function bindMobileSheet(){
    const sheet=$('#mobileSheet'),back=$('#sheetBackdrop');
    const open=()=>{back.hidden=false;sheet.classList.add('open');sheet.setAttribute('aria-hidden','false')};
    const close=()=>{sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');setTimeout(()=>back.hidden=true,320)};
    $('#mobileMenuOpen')?.addEventListener('click',open);back?.addEventListener('click',close);$$('.sheet-action',sheet).forEach(a=>a.addEventListener('click',close));
  }

  function init(){
    initSmoothScroll();
    bindTabs();bindProjectActions();bindProjectSearch();bindFeedback();bindSearch();bindMobileSheet();renderVotes();renderVersions();loadProjectMeta();
    window.addEventListener('hashchange',route);route();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
