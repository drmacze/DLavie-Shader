(() => {
  'use strict';

  const API='https://ydaeukhqwishlrjyfktk.supabase.co';
  const KEY='sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const img=u=>u?(/^https?:\/\//.test(u)?u:u.replace(/^\//,'')):'assets/dlavie-mark.svg?v=81';

  async function api(path){
    const r=await fetch(`${API}/rest/v1/${path}`,{cache:'no-store',headers:{apikey:KEY,Authorization:`Bearer ${KEY}`}});
    if(!r.ok)throw new Error(`Public project API ${r.status}`);
    return r.json();
  }
  async function projects(){
    return api('dlavie_projects?select=id,slug,name,summary,description,version,minecraft_versions,platforms,tags,github_repo,github_branch,thumbnail_url,gallery_urls,featured,status,visibility,sort_order,created_at,updated_at,published_at&status=eq.published&visibility=eq.public&order=sort_order.asc,created_at.desc');
  }
  function platformLabel(list=[]){
    if(list.includes('bedrock')&&list.includes('java'))return 'Bedrock + Java';
    if(list.includes('java'))return 'Java';
    return 'Bedrock';
  }
  function route(){
    const raw=(location.hash||'').replace(/^#\/?/,'').split('?')[0];
    const parts=raw.split('/').filter(Boolean);
    return {name:parts[0]||'downloads',slug:parts[0]==='project'?(parts[1]||''):''};
  }
  function emptyCatalog(root){
    root.innerHTML='<div class="public-empty-state"><strong>Belum ada project publik.</strong><span>Project akan muncul di sini setelah dipublish dari Developer Console.</span></div>';
  }
  function ensureStyle(){
    if($('#publicProjectSyncStyle'))return;
    const style=document.createElement('style');
    style.id='publicProjectSyncStyle';
    style.textContent='.public-empty-state{padding:34px 18px;border:1px dashed var(--line,#dce4de);border-radius:14px;background:var(--surface,#fff);display:grid;gap:6px;text-align:center;color:var(--muted,#69736c)}.public-empty-state strong{color:var(--ink,#172019);font-size:15px}.public-empty-state span{font-size:11px;line-height:1.5}.public-project-validating{visibility:hidden!important}.home-no-public-projects .hero-grid{grid-template-columns:minmax(0,760px)!important}.home-no-public-projects .hero-copy{max-width:760px}.home-no-public-projects .visual{display:none!important}.sync-changelog-list{display:grid;gap:10px}.sync-changelog-item{padding:16px;border:1px solid var(--line);border-radius:13px;background:var(--surface)}.sync-changelog-item header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.sync-changelog-item h3{margin:0;font-size:16px}.sync-changelog-item small{color:var(--muted)}.sync-changelog-item p{margin:10px 0 0;white-space:pre-wrap;color:var(--muted);line-height:1.6}.sync-changelog-item .chip-row{margin-top:10px}';
    document.head.appendChild(style);
  }

  function appProjectRow(p){
    const chips=[...(p.tags||[]).slice(0,2),platformLabel(p.platforms)].filter(Boolean).slice(0,3);
    return `<a class="project-row" href="#project/${esc(p.slug)}" data-project-name="${esc(`${p.name} ${p.slug} ${(p.tags||[]).join(' ')}`.toLowerCase())}"><img src="${esc(img(p.thumbnail_url))}" alt="" class="project-icon"><div class="project-row-copy"><h2>${esc(p.name)}</h2><p>${esc(p.summary)}</p><div class="chip-row">${chips.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div><div class="project-row-meta"><strong>${esc(p.version||'—')}</strong><span>${p.featured?'Featured':'Terbaru'}</span></div></a>`;
  }
  function bindSearch(){
    const input=$('#projectSearch');
    if(!input||input.dataset.sync81)return;
    input.dataset.sync81='1';
    input.addEventListener('input',()=>{
      const q=input.value.trim().toLowerCase();
      $$('#projectList [data-project-name]').forEach(el=>el.hidden=!!q&&!el.dataset.projectName.includes(q));
    });
  }
  async function renderPublicChangelog(project){
    const tab=$('#projectTabs [data-project-tab="changelog"]');
    const panel=$('[data-tab-panel="changelog"]');
    if(!panel)return;
    try{
      const rows=await api(`dlavie_project_changelog?select=id,version,title,minecraft_versions,body,sort_order,published_at,created_at&project_id=eq.${encodeURIComponent(project.id)}&is_published=eq.true&order=sort_order.asc,published_at.desc,created_at.desc`);
      if(tab)tab.hidden=false;
      panel.hidden=false;
      panel.innerHTML=`<div class="content-card"><h2>Changelog ${esc(project.name)}</h2>${rows.length?`<div class="sync-changelog-list">${rows.map((c,i)=>`<article class="sync-changelog-item"><header><div><small>${i===0?'TERBARU':'VERSI'}</small><h3>${esc(c.version)}${c.title?` · ${esc(c.title)}`:''}</h3></div><small>${esc((c.minecraft_versions||[]).join(', '))}</small></header><p>${esc(c.body||'').replace(/\n/g,'<br>')}</p></article>`).join('')}</div>`:'<div class="public-empty-state"><strong>Belum ada changelog.</strong><span>Catatan versi akan muncul setelah dipublish dari Developer Console.</span></div>'}</div>`;
    }catch(e){console.warn(e)}
  }
  async function syncApp(){
    if(!$('#projectList')&&!$('.page[data-route="project"]'))return;
    const r=route();
    if(r.name==='downloads'){
      const root=$('#projectList');
      if(root)root.innerHTML='';
      try{
        const rows=await projects();
        if(root){if(rows.length)root.innerHTML=rows.map(appProjectRow).join('');else emptyCatalog(root)}
        bindSearch();
      }catch(e){console.warn(e);if(root)emptyCatalog(root)}
      return;
    }
    if(r.name==='project'&&r.slug){
      const page=$('.page[data-route="project"]');
      if(page)page.classList.add('public-project-validating');
      try{
        const rows=await api(`dlavie_projects?select=*&slug=eq.${encodeURIComponent(r.slug)}&status=eq.published&visibility=eq.public&limit=1`);
        const project=rows[0]||null;
        if(!project){
          if(page)page.classList.remove('public-project-validating');
          location.hash='downloads';
          return;
        }
        if(page)page.classList.remove('public-project-validating');
        await renderPublicChangelog(project);
      }catch(e){console.warn(e);if(page)page.classList.remove('public-project-validating')}
    }
  }

  function homeResult(p){
    const tags=(p.tags||[]).slice(0,2);
    return `<a class="result" href="app.html?v=81#project/${esc(p.slug)}"><img src="${esc(img(p.thumbnail_url))}" alt=""><div><h3>${esc(p.name)}</h3><p>${esc(p.summary)}</p><div class="tag-row">${tags.map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div></div><span class="version">${esc(p.version?`v${String(p.version).replace(/^v/i,'')}`:'—')}</span></a>`;
  }
  function populateHomeFeatured(p){
    const visual=$('.hero .visual');
    if(!visual)return;
    visual.style.removeProperty('display');
    document.body.classList.remove('home-no-public-projects');
    const card=$('.project-card',visual),note=$('.release-note',visual);
    if(card){
      card.href=`app.html?v=81#project/${encodeURIComponent(p.slug)}`;
      const image=$('.project-top img',card),name=$('.project-top strong',card),desc=$('.project-top p',card),tags=$('.tag-row',card),version=$('.release-row b',card),release=$('.release-row p',card);
      if(image){image.src=img(p.thumbnail_url);image.alt=p.name||''}
      if(name)name.textContent=p.name||p.slug;
      if(desc)desc.textContent=`${platformLabel(p.platforms)} · Minecraft ${(p.minecraft_versions||[]).join(', ')||'—'}`;
      if(tags)tags.innerHTML=[...(p.tags||[]).slice(0,3),platformLabel(p.platforms)].filter(Boolean).slice(0,4).map(x=>`<span class="tag">${esc(x)}</span>`).join('');
      if(version)version.textContent=p.version||'Versi terbaru';
      if(release)release.textContent=p.summary||'';
    }
    if(note){
      note.href=`app.html?v=81#project/${encodeURIComponent(p.slug)}?tab=versions`;
      const b=$('b',note),s=$('span',note);if(b)b.textContent=p.version?`v${String(p.version).replace(/^v/i,'')}`:'Latest';if(s)s.textContent='Project publik';
    }
    const secondary=$$('.hero .cta a').find(a=>a.href.includes('#project/'));
    if(secondary){secondary.hidden=false;secondary.href=`app.html?v=81#project/${encodeURIComponent(p.slug)}`;secondary.textContent=`Lihat ${p.name}`}
  }
  async function syncHome(){
    const visual=$('.hero .visual'),discover=$('.discover .wrap');
    if(!visual||!discover)return;
    visual.style.display='none';
    $$('.discover .result').forEach(x=>x.remove());
    try{
      const rows=await projects();
      if(!rows.length){
        document.body.classList.add('home-no-public-projects');
        const secondary=$$('.hero .cta a').find(a=>a.href.includes('#project/'));if(secondary)secondary.hidden=true;
        if(!$('.public-empty-state',discover))discover.insertAdjacentHTML('beforeend','<div class="public-empty-state"><strong>Belum ada project publik.</strong><span>Project yang dipublish dari Developer Console akan otomatis muncul di website.</span></div>');
        return;
      }
      const oldEmpty=$('.public-empty-state',discover);if(oldEmpty)oldEmpty.remove();
      const featured=rows.find(x=>x.featured)||rows[0];
      populateHomeFeatured(featured);
      discover.insertAdjacentHTML('beforeend',rows.slice(0,4).map(homeResult).join(''));
    }catch(e){console.warn(e);document.body.classList.add('home-no-public-projects')}
  }

  function run(){ensureStyle();if($('.hero .visual')&&!$('#projectList'))syncHome();else syncApp()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('hashchange',()=>setTimeout(syncApp,0),{passive:true});
  window.addEventListener('pageshow',()=>{if(document.visibilityState==='visible')setTimeout(run,0)},{passive:true});
})();
