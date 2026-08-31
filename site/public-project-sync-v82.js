(() => {
  'use strict';
  if(window.__DLAVIE_PUBLIC_SYNC_V82__) return;
  window.__DLAVIE_PUBLIC_SYNC_V82__=true;

  const API='https://ydaeukhqwishlrjyfktk.supabase.co';
  const KEY='sb_publishable_XNXU6SVeM-D477Ymy1ORsw_4hCHOll9';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const img=u=>u?(/^https?:\/\//.test(u)?u:u.replace(/^\//,'')):'assets/dlavie-mark.svg?v=82';

  async function api(path){
    const sep=path.includes('?')?'&':'?';
    const r=await fetch(`${API}/rest/v1/${path}${sep}_dlv=${Date.now()}`,{
      cache:'no-store',headers:{apikey:KEY,Authorization:`Bearer ${KEY}`}
    });
    if(!r.ok) throw new Error(`Public project API ${r.status}`);
    return r.json();
  }
  async function projects(){
    return api('dlavie_projects?select=id,slug,name,summary,description,version,minecraft_versions,platforms,tags,github_repo,github_branch,thumbnail_url,gallery_urls,featured,status,visibility,sort_order,created_at,updated_at,published_at&status=eq.published&visibility=eq.public&order=sort_order.asc,created_at.desc');
  }
  function platformLabel(list=[]){
    const p=(list||[]).map(x=>String(x).toLowerCase());
    if(p.includes('bedrock')&&p.includes('java')) return 'Bedrock + Java';
    if(p.includes('java')) return 'Java';
    if(p.includes('bedrock')) return 'Bedrock';
    return 'Minecraft';
  }
  function route(){
    const raw=(location.hash||'').replace(/^#\/?/,'').split('?')[0];
    const parts=raw.split('/').filter(Boolean);
    return {name:parts[0]||'downloads',slug:parts[0]==='project'?(parts[1]||''):''};
  }
  function emit(name,detail){
    try{window.dispatchEvent(new CustomEvent(name,{detail}))}catch(_){ }
  }
  function publishCatalog(rows){
    window.DLavieCatalog=rows;
    document.documentElement.classList.remove('dlv-project-sync-pending');
    emit('dlavie:catalog',{projects:rows});
  }
  function emptyCatalog(root){
    if(!root)return;
    root.innerHTML='<div class="public-empty-state"><strong>Belum ada project publik.</strong><span>Project akan muncul setelah statusnya Published + Public di Developer Console.</span></div>';
  }
  function appProjectRow(p){
    const chips=[...(p.tags||[]).slice(0,2),platformLabel(p.platforms)].filter(Boolean).slice(0,3);
    return `<a class="project-row" href="#project/${encodeURIComponent(p.slug)}" data-project-name="${esc(`${p.name} ${p.slug} ${(p.tags||[]).join(' ')} ${(p.platforms||[]).join(' ')}`.toLowerCase())}" data-tags="${esc((p.tags||[]).join(' ').toLowerCase())}" data-platforms="${esc((p.platforms||[]).join(' ').toLowerCase())}"><img src="${esc(img(p.thumbnail_url))}" alt="${esc(p.name)}" class="project-icon"><div class="project-row-copy"><h2>${esc(p.name)}</h2><p>${esc(p.summary||'Project DLavie')}</p><div class="chip-row">${chips.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div><div class="project-row-meta"><strong>${esc(p.version?`v${String(p.version).replace(/^v/i,'')}`:'—')}</strong><span>${p.featured?'Featured':'Published'}</span></div></a>`;
  }
  function homeResult(p){
    return `<a class="result" href="app.html?v=82#project/${encodeURIComponent(p.slug)}" data-project-name="${esc(`${p.name} ${p.slug} ${(p.tags||[]).join(' ')} ${(p.platforms||[]).join(' ')}`.toLowerCase())}" data-tags="${esc((p.tags||[]).join(' ').toLowerCase())}" data-platforms="${esc((p.platforms||[]).join(' ').toLowerCase())}"><img src="${esc(img(p.thumbnail_url))}" alt="${esc(p.name)}"><div><h3>${esc(p.name)}</h3><p>${esc(p.summary||'Project DLavie')}</p><div class="tag-row">${(p.tags||[]).slice(0,3).map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div></div><span class="version">${esc(p.version?`v${String(p.version).replace(/^v/i,'')}`:'—')}</span></a>`;
  }
  function homeFeatured(p){
    const visual=$('.hero .visual'); if(!visual)return;
    visual.style.removeProperty('display');
    document.body.classList.remove('home-no-public-projects');
    const card=$('.project-card',visual),note=$('.release-note',visual);
    if(card){
      card.href=`app.html?v=82#project/${encodeURIComponent(p.slug)}`;
      const image=$('.project-top img',card),name=$('.project-top strong',card),desc=$('.project-top p',card),tags=$('.tag-row',card),version=$('.release-row b',card),release=$('.release-row p',card);
      if(image){image.src=img(p.thumbnail_url);image.alt=p.name||''}
      if(name)name.textContent=p.name||p.slug;
      if(desc)desc.textContent=`${platformLabel(p.platforms)} · Minecraft ${(p.minecraft_versions||[]).join(', ')||'versi terbaru'}`;
      if(tags)tags.innerHTML=[...(p.tags||[]).slice(0,3),platformLabel(p.platforms)].filter(Boolean).slice(0,4).map(x=>`<span class="tag">${esc(x)}</span>`).join('');
      if(version)version.textContent=p.version?`v${String(p.version).replace(/^v/i,'')}`:'Versi terbaru';
      if(release)release.textContent=p.summary||'';
    }
    if(note){
      note.href=`app.html?v=82#project/${encodeURIComponent(p.slug)}?tab=changelog`;
      const b=$('b',note),s=$('span',note); if(b)b.textContent=p.version?`v${String(p.version).replace(/^v/i,'')}`:'Latest'; if(s)s.textContent='Rilis publik';
    }
    $$('.hero .cta a').filter(a=>a.href.includes('#project/')).forEach(a=>{a.hidden=false;a.href=`app.html?v=82#project/${encodeURIComponent(p.slug)}`;a.textContent=`Lihat ${p.name}`});
  }
  function bindSearch(){
    const input=$('#projectSearch'); if(!input||input.dataset.sync82)return;
    input.dataset.sync82='1';
    input.addEventListener('input',()=>{
      const q=input.value.trim().toLowerCase();
      $$('#projectList [data-project-name]').forEach(el=>el.hidden=!!q&&!el.dataset.projectName.includes(q));
    });
  }
  async function changelog(project){
    const tab=$('#projectTabs [data-project-tab="changelog"]');
    const panel=$('[data-tab-panel="changelog"]'); if(!panel)return;
    try{
      const rows=await api(`dlavie_project_changelog?select=id,version,title,minecraft_versions,body,sort_order,published_at,created_at&project_id=eq.${encodeURIComponent(project.id)}&is_published=eq.true&order=sort_order.asc,published_at.desc,created_at.desc`);
      if(tab)tab.hidden=false; panel.hidden=false;
      panel.innerHTML=`<div class="content-card"><h2>Changelog ${esc(project.name)}</h2>${rows.length?`<div class="sync-changelog-list">${rows.map((c,i)=>`<article class="sync-changelog-item"><header><div><small>${i===0?'TERBARU':'VERSI'}</small><h3>${esc(c.version)}${c.title?` · ${esc(c.title)}`:''}</h3></div><small>${esc((c.minecraft_versions||[]).join(', '))}</small></header><p>${esc(c.body||'').replace(/\n/g,'<br>')}</p></article>`).join('')}</div>`:'<div class="public-empty-state"><strong>Belum ada changelog.</strong><span>Catatan versi akan muncul setelah dipublish dari Developer Console.</span></div>'}</div>`;
    }catch(e){console.warn('[DLavie changelog]',e)}
  }
  function detailGallery(project){
    const shell=$('.project-shell'); if(!shell)return;
    $('.dlv-detail-gallery',shell)?.remove();
    const urls=[project.thumbnail_url,...(project.gallery_urls||[])].filter(Boolean).map(img);
    const unique=[...new Set(urls)]; if(!unique.length)return;
    const main=unique[0];
    const html=`<section class="dlv-detail-gallery" aria-label="Galeri ${esc(project.name)}"><div class="dlv-detail-gallery-main"><img src="${esc(main)}" alt="${esc(project.name)} preview" id="dlvGalleryMain"></div><div class="dlv-detail-gallery-thumbs">${unique.slice(0,8).map((u,i)=>`<button class="dlv-detail-thumb${i===0?' active':''}" type="button" data-gallery-src="${esc(u)}"><img src="${esc(u)}" alt="Preview ${i+1}"></button>`).join('')}</div></section>`;
    const summary=$('.project-summary',shell); summary?.insertAdjacentHTML('afterend',html);
  }
  function detailSidebar(project){
    const side=$('.project-sidebar'); if(!side)return;
    const repo=project.github_repo?String(project.github_repo).replace(/^https?:\/\/github\.com\//,'').replace(/\/$/,''):'';
    const repoUrl=repo?`https://github.com/${repo}`:'';
    side.innerHTML=`<div class="side-card"><h3>Kompatibilitas</h3><p>${esc(platformLabel(project.platforms))}</p><div class="chip-row">${(project.minecraft_versions||[]).map(v=>`<span>${esc(v)}</span>`).join('')||'<span>Versi terbaru</span>'}</div><div class="dlv-detail-meta"><span>${esc(project.version?`v${String(project.version).replace(/^v/i,'')}`:'Latest')}</span><span>${project.featured?'Featured':'Published'}</span></div></div><div class="side-card"><h3>Tags</h3><div class="chip-row">${(project.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('')||'<span>DLavie</span>'}</div></div>${repoUrl?`<div class="side-card"><h3>Source</h3><div class="side-links"><a href="${esc(repoUrl)}" target="_blank" rel="noreferrer">GitHub repository <b>↗</b></a>${project.github_branch?`<span>Branch: <b>${esc(project.github_branch)}</b></span>`:''}</div></div>`:''}`;
  }
  function detailContent(project){
    const summary=$('.project-summary');
    if(summary){
      const icon=$('.hero-project-icon',summary),eyebrow=$('.project-identity .eyebrow',summary),h1=$('.project-identity h1',summary),p=$('.project-identity>p:last-child',summary);
      if(icon){icon.src=img(project.thumbnail_url);icon.alt=project.name||''}
      if(eyebrow)eyebrow.textContent=`DLAVIE · ${platformLabel(project.platforms).toUpperCase()}`;
      if(h1)h1.textContent=project.name||project.slug;
      if(p)p.textContent=project.summary||'';
    }
    const desc=$('[data-tab-panel="description"] .prose');
    if(desc){
      const paragraphs=String(project.description||project.summary||'').split(/\n{2,}/).map(x=>x.trim()).filter(Boolean);
      desc.innerHTML=`<h2>${esc(project.name)}</h2><p class="lead">${esc(project.summary||'')}</p>${paragraphs.map(x=>`<p>${esc(x).replace(/\n/g,'<br>')}</p>`).join('')}`;
    }
    detailSidebar(project); detailGallery(project);
    const primary=$('#downloadLatest');
    if(primary){
      primary.title=project.github_repo?'Buka source project':'Informasi project';
      primary.setAttribute('aria-label',primary.title);
      primary.dataset.projectRepo=project.github_repo||'';
    }
    emit('dlavie:project',{project});
  }
  async function syncApp(rows){
    const r=route();
    if(r.name==='downloads'){
      const root=$('#projectList'); if(root){root.innerHTML=rows.length?rows.map(appProjectRow).join(''):'';if(!rows.length)emptyCatalog(root)}
      bindSearch(); return;
    }
    if(r.name==='project'&&r.slug){
      const project=rows.find(x=>x.slug===decodeURIComponent(r.slug));
      if(!project){location.hash='downloads';return}
      detailContent(project); await changelog(project);
    }
  }
  async function syncHome(rows){
    const visual=$('.hero .visual'),discover=$('.discover .wrap'); if(!visual||!discover)return;
    visual.style.display='none'; $$('.discover .result').forEach(x=>x.remove());
    const oldEmpty=$('.public-empty-state',discover); if(oldEmpty)oldEmpty.remove();
    if(!rows.length){
      document.body.classList.add('home-no-public-projects');
      $$('.hero .cta a').filter(a=>a.href.includes('#project/')).forEach(a=>a.hidden=true);
      discover.insertAdjacentHTML('beforeend','<div class="public-empty-state"><strong>Belum ada project publik.</strong><span>Project Published + Public dari Developer Console akan tampil otomatis di sini.</span></div>');
      return;
    }
    const featured=rows.find(x=>x.featured)||rows[0]; homeFeatured(featured);
    discover.insertAdjacentHTML('beforeend',rows.map(homeResult).join(''));
  }
  async function run(){
    try{
      const rows=await projects(); publishCatalog(rows);
      if($('.hero .visual')&&!$('#projectList')) await syncHome(rows); else await syncApp(rows);
    }catch(e){
      console.warn('[DLavie public sync]',e); publishCatalog([]);
      const root=$('#projectList'); if(root)emptyCatalog(root);
      const discover=$('.discover .wrap'); if(discover&&!$('.public-empty-state',discover))discover.insertAdjacentHTML('beforeend','<div class="public-empty-state"><strong>Katalog belum dapat dimuat.</strong><span>Coba muat ulang beberapa saat lagi.</span></div>');
    }
  }
  document.addEventListener('click',e=>{
    const thumb=e.target.closest('[data-gallery-src]');
    if(thumb){const main=$('#dlvGalleryMain');if(main)main.src=thumb.dataset.gallerySrc;$$('.dlv-detail-thumb').forEach(x=>x.classList.toggle('active',x===thumb));return}
    const primary=e.target.closest('#downloadLatest');
    if(primary?.dataset.projectRepo){const repo=String(primary.dataset.projectRepo).replace(/^https?:\/\/github\.com\//,'').replace(/\/$/,'');if(repo)window.open(`https://github.com/${repo}`,'_blank','noopener')}
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
  window.addEventListener('hashchange',()=>setTimeout(()=>syncApp(window.DLavieCatalog||[]),0),{passive:true});
  window.addEventListener('pageshow',()=>{if(document.visibilityState==='visible')setTimeout(run,0)},{passive:true});
})();
