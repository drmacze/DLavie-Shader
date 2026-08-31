(() => {
  'use strict';
  if(window.__DLAVIE_MARKET_V82__) return;
  window.__DLAVIE_MARKET_V82__=true;
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=(name)=>({
    home:'<path d="m3 11 9-8 9 8v9H6v-9m4 9v-6h4v6"/>',
    grid:'<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
    update:'<path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v6h-6"/>',
    community:'<path d="M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35M16 3.15a4 4 0 0 1 0 7.7"/>',
    search:'<path d="m21 21-4.3-4.3m2.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"/>',
    user:'<path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"/>',
    tag:'<path d="M20 13 13 20l-9-9V4h7l9 9ZM8.5 8.5h.01"/>',
    bedrock:'<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0v9m8-4.5-8 4.5-8-4.5"/>',
    java:'<path d="M8 5c0 2 8 1 8 4 0 2-3 2.5-6 2.5M8 14h8M9 18h6"/>'
  }[name]||'<path d="M4 12h16"/>');
  const svg=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icon(n)}</svg>`;

  function mark(){document.body.classList.add('dlv-store-v82')}
  function signedHint(){
    try{const v=JSON.parse(localStorage.getItem('dlavie.auth.state.v1')||'null');return !!(v===true||v?.signedIn||v?.userId)}catch{return false}
  }
  function accountHref(){return signedHint()?'account.html?v=82#profile':'account.html?v=82'}
  function navigationItems(){return [
    ['Beranda','index.html?v=82','home'],['Project','app.html?v=82#downloads','grid'],['Update','app.html?v=82#news','update'],['Komunitas','app.html?v=82#community','community'],['Cari','#dlv-search','search'],['Akun',accountHref(),'user']
  ]}
  function drawer(){
    const sheet=$('#mobileSheet'); if(!sheet||sheet.dataset.market82)return;
    sheet.dataset.market82='1';
    sheet.innerHTML=`<div class="dlv-drawer-head"><div class="dlv-drawer-brand"><img src="assets/dlavie-mark.svg?v=82" alt=""><span>DLavie</span></div><button class="dlv-drawer-close" type="button" aria-label="Tutup menu">×</button></div><div class="dlv-drawer-label">Navigasi</div>${navigationItems().map(([label,href,i])=>`<a class="dlv-drawer-row" href="${href}" data-dlv-nav="${i}">${svg(i)}<span>${label}</span><small>›</small></a>`).join('')}<div class="dlv-drawer-label">DLavie</div><a class="dlv-drawer-row" href="https://github.com/drmacze/DLavie-Shader" target="_blank" rel="noreferrer"><span>GitHub</span><small>↗</small></a>`;
    $('.dlv-drawer-close',sheet)?.addEventListener('click',()=>$('#sheetBackdrop')?.click());
  }
  function homePanel(){
    const panel=$('#menuPanel,.panel'); if(!panel||panel.dataset.market82)return;
    panel.dataset.market82='1';
    const themeBtn=$('#themeToggle',panel);
    panel.innerHTML=navigationItems().filter(x=>x[0]!=='Beranda').map(([label,href,i])=>`<a href="${href}" data-dlv-nav="${i}">${svg(i)}<span>${label}</span><b>›</b></a>`).join('')+`<a href="https://github.com/drmacze/DLavie-Shader" target="_blank" rel="noreferrer"><span>GitHub</span><b>↗</b></a>`+(themeBtn?'<button type="button" id="dlvThemeFromMenu"><span>Tema</span><b>◐</b></button>':'');
    $('#dlvThemeFromMenu')?.addEventListener('click',()=>document.querySelector('#themeToggle')?.click());
  }

  function categoryFor(el){
    const text=`${el.dataset.tags||''} ${el.dataset.platforms||''} ${el.dataset.projectName||''} ${el.textContent||''}`.toLowerCase();
    if(/shader/.test(text))return 'shader'; if(/resource|texture/.test(text))return 'resource'; if(/add.?on|mod/.test(text))return 'addon'; if(/java/.test(text))return 'java'; if(/bedrock/.test(text))return 'bedrock'; return 'all';
  }
  const filterDefs=[['Semua','all','grid'],['Shader','shader','tag'],['Resource','resource','tag'],['Add-on','addon','tag'],['Bedrock','bedrock','bedrock'],['Java','java','java']];
  function applyFilter(root,value){
    const items=$$('[data-project-name]',root);
    items.forEach(el=>{const t=`${el.dataset.tags||''} ${el.dataset.platforms||''} ${el.dataset.projectName||''}`.toLowerCase();let show=value==='all';if(value==='shader')show=/shader/.test(t);if(value==='resource')show=/resource|texture/.test(t);if(value==='addon')show=/add.?on|\bmod\b/.test(t);if(value==='bedrock')show=/bedrock/.test(t);if(value==='java')show=/java/.test(t);el.hidden=!show});
  }
  function filters(){
    const roots=[];
    const home=$('.discover .wrap'); if(home)roots.push(home);
    const app=$('#projectList'); if(app)roots.push(app);
    roots.forEach(root=>{
      const host=root.id==='projectList'?root.parentElement:root;
      if(!host||$('.dlv-market-tools',host))return;
      const tools=document.createElement('div');tools.className='dlv-market-tools';
      tools.innerHTML=filterDefs.map(([label,val,i],idx)=>`<button class="dlv-market-chip${idx===0?' active':''}" type="button" data-market-filter="${val}">${svg(i)}${label}</button>`).join('');
      if(root.id==='projectList')root.insertAdjacentElement('beforebegin',tools);else{
        const search=$('.search-link',host);search?search.insertAdjacentElement('afterend',tools):host.insertBefore(tools,host.firstChild);
      }
      tools.addEventListener('click',e=>{const b=e.target.closest('[data-market-filter]');if(!b)return;$$('[data-market-filter]',tools).forEach(x=>x.classList.toggle('active',x===b));applyFilter(root,b.dataset.marketFilter)});
    });
  }

  function createSearch(){
    if($('#dlvStoreSearch'))return;
    const wrap=document.createElement('div');wrap.id='dlvStoreSearch';wrap.className='dlv-store-search';wrap.hidden=true;
    wrap.innerHTML=`<section class="dlv-store-search-panel"><div style="display:flex;gap:8px;align-items:center"><input id="dlvStoreSearchInput" type="search" autocomplete="off" placeholder="Cari project DLavie..." style="width:100%;height:52px;padding:0 14px"><button id="dlvStoreSearchClose" type="button" style="height:52px;width:52px;border:1px solid #363d38;border-radius:8px;background:#242824;color:#fff;font-size:24px">×</button></div><div class="dlv-store-search-results" id="dlvStoreSearchResults"><p style="color:#9da69f">Cari nama project, tag, platform, atau versi.</p></div></section>`;
    document.body.appendChild(wrap);
    const input=$('#dlvStoreSearchInput'),results=$('#dlvStoreSearchResults');
    function render(q=''){
      const rows=window.DLavieCatalog||[];q=q.trim().toLowerCase();
      const list=q?rows.filter(p=>`${p.name} ${p.summary} ${(p.tags||[]).join(' ')} ${(p.platforms||[]).join(' ')} ${p.version||''}`.toLowerCase().includes(q)):rows.slice(0,6);
      results.innerHTML=list.length?list.slice(0,12).map(p=>`<a class="dlv-search-result" href="app.html?v=82#project/${encodeURIComponent(p.slug)}"><img src="${esc(p.thumbnail_url||'assets/dlavie-mark.svg?v=82')}" alt=""><span><strong>${esc(p.name)}</strong><small>${esc(p.summary||'Project DLavie')}</small></span><b>${esc(p.version?`v${String(p.version).replace(/^v/i,'')}`:'→')}</b></a>`).join(''):'<p style="color:#9da69f">Tidak ada project yang cocok.</p>';
    }
    input.addEventListener('input',()=>render(input.value));
    $('#dlvStoreSearchClose').addEventListener('click',()=>{wrap.hidden=true;document.documentElement.style.overflow=''});
    wrap.addEventListener('click',e=>{if(e.target===wrap){wrap.hidden=true;document.documentElement.style.overflow=''}});
    window.DLavieStoreSearch={open(){wrap.hidden=false;document.documentElement.style.overflow='hidden';render(input.value);setTimeout(()=>input.focus(),50)},close(){wrap.hidden=true;document.documentElement.style.overflow=''}};
  }
  function searchBindings(){
    document.addEventListener('click',e=>{
      const nav=e.target.closest('[data-dlv-nav="search"],[href="#dlv-search"]');
      if(nav){e.preventDefault();$('#sheetBackdrop')?.click();window.DLavieStoreSearch?.open();return}
      const open=e.target.closest('#searchOpen,#mobileSearch,.search-link');
      if(open&&location.pathname.endsWith('index.html')||open&&location.pathname.endsWith('/')){e.preventDefault();window.DLavieStoreSearch?.open()}
    },true);
  }

  function marketplaceLabels(){
    const homeHead=$('.discover .section-head h2');if(homeHead)homeHead.textContent='Project terbaru';
    const homeCopy=$('.discover .section-copy');if(homeCopy)homeCopy.textContent='Cari project berdasarkan kategori, platform, versi, dan tag. Semua informasi berasal langsung dari Developer Console.';
    const appHead=$('.page[data-route="downloads"] .page-head h1');if(appHead)appHead.textContent='Project';
    const appCopy=$('.page[data-route="downloads"] .page-head p');if(appCopy)appCopy.textContent='Jelajahi semua project DLavie yang sudah dipublish. Gunakan pencarian atau filter untuk menemukan yang cocok.';
  }
  function detailEnhance(project){
    const identity=$('.project-identity');if(!identity||$('.dlv-detail-meta',identity))return;
    const meta=document.createElement('div');meta.className='dlv-detail-meta';
    meta.innerHTML=`<span>${esc(project.version?`v${String(project.version).replace(/^v/i,'')}`:'Latest')}</span><span>${esc((project.platforms||[]).join(' + ')||'Minecraft')}</span>${project.minecraft_versions?.[0]?`<span>Minecraft ${esc(project.minecraft_versions[0])}</span>`:''}`;
    identity.appendChild(meta);
    const primary=$('#downloadLatest');if(primary&&!primary.dataset.marketLabel){primary.dataset.marketLabel='1';primary.innerHTML=`${svg('update')}<span style="font-weight:820">Buka project</span>`}
  }
  function onCatalog(){filters();marketplaceLabels()}

  function init(){
    mark();drawer();homePanel();createSearch();searchBindings();marketplaceLabels();filters();
    window.addEventListener('dlavie:catalog',onCatalog);
    window.addEventListener('dlavie:project',e=>detailEnhance(e.detail?.project||{}));
    const mo=new MutationObserver(()=>{drawer();homePanel();filters()});mo.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
